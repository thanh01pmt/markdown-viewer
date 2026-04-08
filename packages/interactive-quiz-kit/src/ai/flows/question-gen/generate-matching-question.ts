// packages/interactive-quiz-kit/src/ai/flows/question-gen/generate-matching-question.ts
'use client';

import { z } from 'zod';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import type { MatchingQuestion, MatchPromptItem, MatchOptionItem } from '../../../types';
import { generateUniqueId } from '../../../utils/idGenerators';
import { DebugLogger, type AttemptResult } from '../../../utils/debug-logger';
import { urlToGenerativePart } from '../../../utils/aiUtils';
import {
  type GenerateMatchingQuestionClientInput,
  type GenerateMatchingQuestionOutput,
  AIMatchingOutputFieldsSchema,
} from './generate-matching-question-types';
import { MatchingQuestionZodSchema } from './question-generation-schemas';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 3000;

function buildEnhancedPrompt(clientInput: GenerateMatchingQuestionClientInput, attemptNumber: number): string {
  const { quizContext, language, difficultyCode, numberOfPairs, imageUrl } = clientInput;
  const category = quizContext?.originalCategory || 'the specified technical category';
  
  const attemptInfo = attemptNumber > 1 ?
    `\n## DEBUG INFO - This is attempt #${attemptNumber}\nPrevious attempts failed. Please ensure the 'correctPairs' array has exactly the required number of items and the JSON is valid.\n\n` : '';

  const imageContextInstruction = imageUrl
    ? `**Image Context:** You MUST analyze the provided image. The matching pairs must be directly related to the content of this image.`
    : '';

  const contextStrings = [
    `**Required Category:** ${category}`,
    quizContext?.description && `**Learning Objective:** ${quizContext.description}`,
    imageContextInstruction,
    quizContext?.plannedBloomLevelCode && `**Cognitive Level (Bloom's):** ${quizContext.plannedBloomLevelCode}`,
    quizContext?.targetMisconception && `**Target Misconception:** Design a pair that specifically tests this confusion: "${quizContext.targetMisconception}"`,
  ].filter(Boolean).map(s => `- ${s}`).join('\n');
  
  const exampleJson = JSON.stringify({
    prompt: "Match each Swift collection type to its primary characteristic.",
    correctPairs: [
      { "promptText": "Array", "optionText": "An ordered, random-access collection." },
      { "promptText": "Set", "optionText": "An unordered collection of unique elements." },
      { "promptText": "Dictionary", "optionText": "An unordered collection of key-value associations." }
    ],
    explanation: "These are the fundamental characteristics of Swift's main collection types.",
    points: 10,
    difficultyCode: "EASY",
    topic: "Swift Collection Types",
    verifiedCategory: category,
  }, null, 2);

  return `${attemptInfo}You are an expert Question Author for advanced technical education, specializing in: ${category}.
Your mission is to create a high-quality, technically accurate Matching Question.

## Core Rules (Non-negotiable)
1.  **Category Purity:** The question MUST be exclusively about **${category}**.
2.  **Logical Pairs:** The items to be matched must have a clear, one-to-one relationship.
3.  **Schema Integrity:** The response MUST be ONLY a single, valid JSON object that strictly follows the provided schema.

## CRITICAL CONTEXT FOR THIS QUESTION
${contextStrings}

## Task: Generate the Question
Based on all the rules and context above, generate a single Matching Question.

### Input Parameters
- **Topic for Question:** ${quizContext?.plannedTopic || 'General'}
- **Language for Text:** ${language}
- **Difficulty Level:** ${difficultyCode}
- **Number of Pairs:** Generate exactly ${numberOfPairs} correct pairs in the 'correctPairs' array.

### Required JSON Output Format
Your response must be ONLY the JSON object, matching this exact structure:

${exampleJson}

Now, generate the JSON for the requested question.`;
}

export async function generateMatchingQuestion(
  clientInput: GenerateMatchingQuestionClientInput,
  apiKey: string
): Promise<GenerateMatchingQuestionOutput> {
  const ai = new GoogleGenerativeAI(apiKey);
  const model = 'gemini-2.5-flash';
  const config: any = {
    temperature: 0.8,
    responseMimeType: 'application/json',
      thinkingConfig: {
        thinkingBudget: 4096,
      },
    };

  const attemptResults: AttemptResult[] = [];
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    const startTime = Date.now();
    const promptText = buildEnhancedPrompt(clientInput, attempt);
    const promptHash = Math.abs(promptText.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)).toString(36).slice(0, 10);

    try {
      DebugLogger.logPrompt(attempt, promptText, { ...clientInput, attemptNumber: attempt, promptHash });
      
      const parts: Part[] = [{ text: promptText }];

      if (clientInput.imageUrl) {
        const mimeType = clientInput.imageUrl.endsWith('.png') ? 'image/png' : 'image/jpeg';
        const imagePart = await urlToGenerativePart(clientInput.imageUrl, mimeType);
        parts.unshift(imagePart);
      }

      const contents = [{ role: 'user' as const, parts }];
      const aiResult = await ai.getGenerativeModel({ model: model, generationConfig: config }).generateContent({ contents: contents });

      const response = aiResult.response;
      const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const duration = Date.now() - startTime;
      DebugLogger.logResponse(attempt, rawText);

      if (!rawText) throw new Error("AI returned an empty response.");

      const parsedJson = JSON.parse(rawText);
      DebugLogger.logValidation(attempt, 'JSON Parsed Successfully', parsedJson);

      const aiGeneratedContent = AIMatchingOutputFieldsSchema.parse(parsedJson);
      DebugLogger.logValidation(attempt, 'Zod Schema Validated', aiGeneratedContent);

      if (aiGeneratedContent.correctPairs.length !== clientInput.numberOfPairs) {
        throw new Error(`AI generated ${aiGeneratedContent.correctPairs.length} pairs, but ${clientInput.numberOfPairs} were required.`);
      }
      
      if (clientInput.quizContext?.originalCategory) {
        const verifiedCategory = aiGeneratedContent.verifiedCategory?.toLowerCase();
        const requiredCategory = clientInput.quizContext.originalCategory.toLowerCase();
        if (verifiedCategory && verifiedCategory !== requiredCategory) {
          throw new Error(`Category mismatch: Required ${requiredCategory}, got ${verifiedCategory}`);
        }
      }

      const finalPrompts: MatchPromptItem[] = [];
      const finalOptions: MatchOptionItem[] = [];
      const finalCorrectAnswerMap: { promptId: string; optionId: string }[] = [];

      aiGeneratedContent.correctPairs.forEach(pair => {
        const promptId = generateUniqueId('m_p_');
        const optionId = generateUniqueId('m_o_');
        finalPrompts.push({ id: promptId, content: pair.promptText });
        finalOptions.push({ id: optionId, content: pair.optionText });
        finalCorrectAnswerMap.push({ promptId, optionId });
      });

      const meta: Record<string, string[]> = {};
      if (clientInput.quizContext?.originalLoId) {
          meta['learningObjectiveCodes'] = [clientInput.quizContext.originalLoId];
      }

      const completeQuestion: MatchingQuestion = {
        id: generateUniqueId('match_ai_'),
        questionTypeCode: 'MATCHING',
        prompt: aiGeneratedContent.prompt,
        prompts: finalPrompts,
        options: finalOptions,
        correctAnswerMap: finalCorrectAnswerMap,
        shuffleOptions: clientInput.shuffleOptions,
        explanation: aiGeneratedContent.explanation,
        points: aiGeneratedContent.points,
        meta: Object.keys(meta).length > 0 ? meta : undefined,
        imageUrl: clientInput.imageUrl,
      };

      const validatedQuestion = MatchingQuestionZodSchema.parse(completeQuestion);
      attemptResults.push({ success: true, duration, promptLength: promptText.length, responseLength: rawText.length, promptHash });
      
      console.log(`\n✅ Matching generation successful on attempt ${attempt} (${duration}ms)`);
      if (attempt > 1) DebugLogger.logAttemptSummary(attemptResults);
      
      return { question: validatedQuestion };

    } catch (error: any) {
      lastError = error;
      const duration = Date.now() - startTime;
      attemptResults.push({ success: false, duration, error: error.message, promptLength: promptText.length, promptHash });
      
      const willRetry = attempt < MAX_RETRY_ATTEMPTS;
      DebugLogger.logRetryInfo(attempt, error, willRetry);
      
      if (willRetry) {
        console.log(`⏳ Retrying in ${RETRY_DELAY_MS}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

  DebugLogger.logAttemptSummary(attemptResults);
  const errorMessage = `Failed to generate Matching question after ${MAX_RETRY_ATTEMPTS} attempts. Last error: ${lastError?.message}`;
  console.error('\n❌ Final Result: FAILED');
  console.error(errorMessage);
  return { error: errorMessage };
}