// packages/interactive-quiz-kit/src/ai/flows/question-gen/generate-fitb-question.ts
'use client';

import { z } from 'zod';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import type { FillInTheBlanksQuestion } from '../../../types';
import { generateUniqueId } from '../../../utils/idGenerators';
import { DebugLogger, type AttemptResult } from '../../../utils/debug-logger';
import { urlToGenerativePart } from '../../../utils/aiUtils';
import {
  type GenerateFillInTheBlanksQuestionClientInput,
  type GenerateFillInTheBlanksQuestionOutput,
  AIFillInTheBlanksOutputFieldsSchema,
} from './generate-fitb-question-types';
import { FillInTheBlanksQuestionZodSchema } from './question-generation-schemas';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 3000;

function buildEnhancedPrompt(clientInput: GenerateFillInTheBlanksQuestionClientInput, attemptNumber: number): string {
  const { quizContext, language, difficultyCode, numberOfBlanks, imageUrl } = clientInput;
  const category = quizContext?.originalCategory || 'the specified technical category';
  
  const attemptInfo = attemptNumber > 1 ?
    `\n## DEBUG INFO - This is attempt #${attemptNumber}\nPrevious attempts failed. Pay strict attention to the JSON schema, especially the 'segments' array structure. Ensure 'blank' segments have 'acceptedAnswers' and 'text' segments have 'content'.\n\n` : '';

  const imageContextInstruction = imageUrl
    ? `**Image Context:** You MUST analyze the provided image. The question and blanks must be directly related to the content of this image.`
    : '';

  const contextStrings = [
    `**Required Category:** ${category}`,
    quizContext?.description && `**Learning Objective:** ${quizContext.description}`,
    imageContextInstruction,
    quizContext?.plannedBloomLevelCode && `**Cognitive Level (Bloom's):** ${quizContext.plannedBloomLevelCode}`,
    quizContext?.targetMisconception && `**Target Misconception:** Design the blank to test this specific point: "${quizContext.targetMisconception}"`,
  ].filter(Boolean).map(s => `- ${s}`).join('\n');
  
  const exampleJson = JSON.stringify({
    prompt: "Complete the following Swift code snippet.",
    segments: [
      { "type": "text", "content": "To declare a new function in Swift, you use the `" },
      { "type": "blank", "acceptedAnswers": ["func"] },
      { "type": "text", "content": "` keyword." }
    ],
    explanation: "The 'func' keyword is used to declare a function in the Swift programming language.",
    points: 10,
    difficultyCode: "EASY",
    topic: "Swift Function Declaration",
    verifiedCategory: category,
  }, null, 2);

  return `${attemptInfo}You are an expert Question Author for advanced technical education, specializing in: ${category}.
Your mission is to create a high-quality, technically accurate Fill-in-the-Blanks Question.

## Core Rules (Non-negotiable)
1.  **Category Purity:** The question MUST be exclusively about **${category}**.
2.  **Schema Integrity:** The response MUST be ONLY a single, valid JSON object that strictly follows the provided schema.
3.  **Logical Segments:** For 'blank' segments, you MUST provide 'acceptedAnswers'. For 'text' segments, you MUST provide 'content'. Do not mix them.

## CRITICAL CONTEXT FOR THIS QUESTION
${contextStrings}

## Task: Generate the Question
Based on all the rules and context above, generate a single Fill-in-the-Blanks Question.

### Input Parameters
- **Topic for Question:** ${quizContext?.plannedTopic || 'General'}
- **Language for Text:** ${language}
- **Difficulty Level:** ${difficultyCode}
- **Number of Blanks:** Generate exactly ${numberOfBlanks} segment(s) with type 'blank'.

### Required JSON Output Format
Your response must be ONLY the JSON object, matching this exact structure:

${exampleJson}

Now, generate the JSON for the requested question.`;
}

export async function generateFillInTheBlanksQuestion(
  clientInput: GenerateFillInTheBlanksQuestionClientInput,
  apiKey: string
): Promise<GenerateFillInTheBlanksQuestionOutput> {
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

      const aiGeneratedContent = AIFillInTheBlanksOutputFieldsSchema.parse(parsedJson);
      DebugLogger.logValidation(attempt, 'Zod Schema Validated', aiGeneratedContent);

      const blankCount = aiGeneratedContent.segments.filter(s => s.type === 'blank').length;
      if (blankCount !== clientInput.numberOfBlanks) {
        throw new Error(`AI generated ${blankCount} blanks, but ${clientInput.numberOfBlanks} were required.`);
      }
      aiGeneratedContent.segments.forEach((segment, index) => {
        if (segment.type === 'blank' && (!segment.acceptedAnswers || segment.acceptedAnswers.length === 0)) {
          throw new Error(`Segment ${index} is a 'blank' but is missing 'acceptedAnswers'.`);
        }
        if (segment.type === 'text' && typeof segment.content !== 'string') {
          throw new Error(`Segment ${index} is 'text' but is missing 'content'.`);
        }
      });
      
      if (clientInput.quizContext?.originalCategory) {
        const verifiedCategory = aiGeneratedContent.verifiedCategory?.toLowerCase();
        const requiredCategory = clientInput.quizContext.originalCategory.toLowerCase();
        if (verifiedCategory && verifiedCategory !== requiredCategory) {
          throw new Error(`Category mismatch: Required ${requiredCategory}, got ${verifiedCategory}`);
        }
      }

      const finalSegments: FillInTheBlanksQuestion['segments'] = [];
      const finalAnswers: FillInTheBlanksQuestion['answers'] = [];

      aiGeneratedContent.segments.forEach(segment => {
        if (segment.type === 'text') {
          finalSegments.push({ type: 'text', content: segment.content });
        } else if (segment.type === 'blank' && segment.acceptedAnswers) {
          const blankId = generateUniqueId('blank_');
          finalSegments.push({ type: 'blank', id: blankId });
          finalAnswers.push({ blankId: blankId, acceptedValues: segment.acceptedAnswers });
        }
      });

      const meta: Record<string, string[]> = {};
      if (clientInput.quizContext?.originalLoId) {
          meta['learningObjectiveCodes'] = [clientInput.quizContext.originalLoId];
      }

      const completeQuestion: FillInTheBlanksQuestion = {
        id: generateUniqueId('fitb_ai_'),
        questionTypeCode: 'FILL_IN_THE_BLANKS',
        prompt: aiGeneratedContent.prompt,
        segments: finalSegments,
        answers: finalAnswers,
        isCaseSensitive: clientInput.isCaseSensitive,
        explanation: aiGeneratedContent.explanation,
        points: aiGeneratedContent.points,
        meta: Object.keys(meta).length > 0 ? meta : undefined,
        imageUrl: clientInput.imageUrl,
      };

      const validatedQuestion = FillInTheBlanksQuestionZodSchema.parse(completeQuestion);
      attemptResults.push({ success: true, duration, promptLength: promptText.length, responseLength: rawText.length, promptHash });
      
      console.log(`\n✅ FITB generation successful on attempt ${attempt} (${duration}ms)`);
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
  const errorMessage = `Failed to generate FITB question after ${MAX_RETRY_ATTEMPTS} attempts. Last error: ${lastError?.message}`;
  console.error('\n❌ Final Result: FAILED');
  console.error(errorMessage);
  return { error: errorMessage };
}