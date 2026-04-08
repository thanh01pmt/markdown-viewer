// packages/interactive-quiz-kit/src/ai/flows/question-gen/generate-short-answer-question.ts
'use client';

import { z } from 'zod';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import type { ShortAnswerQuestion } from '../../../types';
import { generateUniqueId } from '../../../utils/idGenerators';
import { DebugLogger, type AttemptResult } from '../../../utils/debug-logger';
import { urlToGenerativePart } from '../../../utils/aiUtils';
import {
  type GenerateShortAnswerQuestionClientInput,
  type GenerateShortAnswerQuestionOutput,
  AIShortAnswerOutputFieldsSchema,
} from './generate-short-answer-question-types';
import { ShortAnswerQuestionZodSchema } from './question-generation-schemas';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 3000;

function buildEnhancedPrompt(clientInput: GenerateShortAnswerQuestionClientInput, attemptNumber: number): string {
  const { quizContext, language, difficultyCode, imageUrl } = clientInput;
  const category = quizContext?.originalCategory || 'the specified technical category';
  
  const attemptInfo = attemptNumber > 1 ?
    `\n## DEBUG INFO - This is attempt #${attemptNumber}\nPrevious attempts failed. Ensure 'acceptedAnswers' is a non-empty array of strings and the JSON is valid.\n\n` : '';

  const imageContextInstruction = imageUrl
    ? `**Image Context:** You MUST analyze the provided image. The question and its short answer must be directly related to the content of this image.`
    : '';

  const contextStrings = [
    `**Required Category:** ${category}`,
    quizContext?.description && `**Learning Objective:** ${quizContext.description}`,
    imageContextInstruction,
    quizContext?.plannedBloomLevelCode && `**Cognitive Level (Bloom's):** ${quizContext.plannedBloomLevelCode}`,
    quizContext?.targetMisconception && `**Target Misconception:** The question should require an answer that corrects this specific misconception: "${quizContext.targetMisconception}"`,
  ].filter(Boolean).map(s => `- ${s}`).join('\n');
  
  const exampleJson = JSON.stringify({
    prompt: "In Swift, what keyword is used to declare a constant?",
    acceptedAnswers: ["let"],
    explanation: "The 'let' keyword is used to declare constants, which are values that cannot be changed after they are set. 'var' is used for variables.",
    points: 10,
    difficultyCode: "EASY",
    topic: "Swift Constants",
    verifiedCategory: category,
  }, null, 2);

  return `${attemptInfo}You are an expert Question Author for advanced technical education, specializing in: ${category}.
Your mission is to create a high-quality, technically accurate Short Answer Question.

## Core Rules (Non-negotiable)
1.  **Category Purity:** The question MUST be exclusively about **${category}**.
2.  **Objective Answer:** The question must have a short, factual, and objective answer. Avoid questions that are subjective or require long explanations.
3.  **Schema Integrity:** The response MUST be ONLY a single, valid JSON object.

## CRITICAL CONTEXT FOR THIS QUESTION
${contextStrings}

## Task: Generate the Question
Based on all the rules and context above, generate a single Short Answer Question.

### Input Parameters
- **Topic for Question:** ${quizContext?.plannedTopic || 'General'}
- **Language for Text:** ${language}
- **Difficulty Level:** ${difficultyCode}

### Required JSON Output Format
Your response must be ONLY the JSON object, matching this exact structure:

${exampleJson}

Now, generate the JSON for the requested question.`;
}

export async function generateShortAnswerQuestion(
  clientInput: GenerateShortAnswerQuestionClientInput,
  apiKey: string
): Promise<GenerateShortAnswerQuestionOutput> {
  const ai = new GoogleGenerativeAI(apiKey);
  const model = 'gemini-2.5-flash';
  const config: any = {
    temperature: 0.5,
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

      const aiGeneratedContent = AIShortAnswerOutputFieldsSchema.parse(parsedJson);
      DebugLogger.logValidation(attempt, 'Zod Schema Validated', aiGeneratedContent);

      if (clientInput.quizContext?.originalCategory) {
        const verifiedCategory = aiGeneratedContent.verifiedCategory?.toLowerCase();
        const requiredCategory = clientInput.quizContext.originalCategory.toLowerCase();
        if (verifiedCategory && verifiedCategory !== requiredCategory) {
          throw new Error(`Category mismatch: Required ${requiredCategory}, got ${verifiedCategory}`);
        }
      }

      const meta: Record<string, string[]> = {};
      if (clientInput.quizContext?.originalLoId) {
          meta['learningObjectiveCodes'] = [clientInput.quizContext.originalLoId];
      }

      const completeQuestion: ShortAnswerQuestion = {
        id: generateUniqueId('saq_ai_'),
        questionTypeCode: 'SHORT_ANSWER',
        prompt: aiGeneratedContent.prompt,
        acceptedAnswers: aiGeneratedContent.acceptedAnswers,
        isCaseSensitive: clientInput.isCaseSensitive,
        explanation: aiGeneratedContent.explanation,
        points: aiGeneratedContent.points,
        meta: Object.keys(meta).length > 0 ? meta : undefined,
        imageUrl: clientInput.imageUrl,
      };

      const validatedQuestion = ShortAnswerQuestionZodSchema.parse(completeQuestion);
      attemptResults.push({ success: true, duration, promptLength: promptText.length, responseLength: rawText.length, promptHash });
      
      console.log(`\n✅ Short Answer generation successful on attempt ${attempt} (${duration}ms)`);
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
  const errorMessage = `Failed to generate Short Answer question after ${MAX_RETRY_ATTEMPTS} attempts. Last error: ${lastError?.message}`;
  console.error('\n❌ Final Result: FAILED');
  console.error(errorMessage);
  return { error: errorMessage };
}