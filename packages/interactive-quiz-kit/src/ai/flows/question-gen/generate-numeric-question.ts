// packages/interactive-quiz-kit/src/ai/flows/question-gen/generate-numeric-question.ts
'use client';

import { z } from 'zod';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import type { NumericQuestion } from '../../../types';
import { generateUniqueId } from '../../../utils/idGenerators';
import { DebugLogger, type AttemptResult } from '../../../utils/debug-logger';
import { urlToGenerativePart } from '../../../utils/aiUtils';
import {
  type GenerateNumericQuestionClientInput,
  type GenerateNumericQuestionOutput,
  AINumericOutputFieldsSchema,
} from './generate-numeric-question-types';
import { NumericQuestionZodSchema } from './question-generation-schemas';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 3000;

function buildEnhancedPrompt(clientInput: GenerateNumericQuestionClientInput, attemptNumber: number): string {
  const { quizContext, language, difficultyCode, minRange, maxRange, allowDecimals, imageUrl } = clientInput;
  const category = quizContext?.originalCategory || 'the specified technical category';
  
  const attemptInfo = attemptNumber > 1 ?
    `\n## DEBUG INFO - This is attempt #${attemptNumber}\nPrevious attempts failed. Ensure the 'answer' is a valid number and fits within the specified constraints.\n\n` : '';

  const imageContextInstruction = imageUrl
    ? `**Image Context:** You MUST analyze the provided image. The question and its numerical answer must be directly related to the content of this image.`
    : '';

  const contextStrings = [
    `**Required Category:** ${category}`,
    quizContext?.description && `**Learning Objective:** ${quizContext.description}`,
    imageContextInstruction,
    quizContext?.plannedBloomLevelCode && `**Cognitive Level (Bloom's):** ${quizContext.plannedBloomLevelCode}`,
    quizContext?.targetMisconception && `**Target Misconception:** The question should clarify this numerical error: "${quizContext.targetMisconception}"`,
  ].filter(Boolean).map(s => `- ${s}`).join('\n');
  
  const constraintStrings = [
    minRange !== undefined && `The final 'answer' MUST be greater than or equal to ${minRange}.`,
    maxRange !== undefined && `The final 'answer' MUST be less than or equal to ${maxRange}.`,
    !allowDecimals && `The final 'answer' MUST be an integer (whole number).`
  ].filter(Boolean).join('\n');

  const exampleJson = JSON.stringify({
    prompt: "A Swift `Int` on a 64-bit platform can store a maximum value of 2^63 - 1. What is the maximum value for an `Int8`?",
    answer: 127,
    tolerance: 0,
    explanation: "An Int8 uses 8 bits. One bit is for the sign, leaving 7 bits for the value. The range is from -128 to 127 (2^7 - 1).",
    points: 10,
    difficultyCode: "MEDIUM",
    topic: "Swift Data Types",
    verifiedCategory: category,
  }, null, 2);

  return `${attemptInfo}You are an expert Question Author for advanced technical education, specializing in: ${category}.
Your mission is to create a high-quality, technically accurate Numeric Question.

## Core Rules (Non-negotiable)
1.  **Category Purity:** The question MUST be exclusively about **${category}**.
2.  **Quantitative Answer:** The question MUST ask for a specific, objective numerical answer.
3.  **Schema Integrity:** The response MUST be ONLY a single, valid JSON object.

## CRITICAL CONTEXT FOR THIS QUESTION
${contextStrings}

## Task: Generate the Question
Based on all the rules and context above, generate a single Numeric Question.

### Input Parameters & Constraints
- **Topic for Question:** ${quizContext?.plannedTopic || 'General'}
- **Language for Text:** ${language}
- **Difficulty Level:** ${difficultyCode}
${constraintStrings ? `\n### CRITICAL CONSTRAINTS ON THE ANSWER\n${constraintStrings}` : ''}

### Required JSON Output Format
Your response must be ONLY the JSON object, matching this exact structure:

${exampleJson}

Now, generate the JSON for the requested question.`;
}

export async function generateNumericQuestion(
  clientInput: GenerateNumericQuestionClientInput,
  apiKey: string
): Promise<GenerateNumericQuestionOutput> {
  if (clientInput.minRange !== undefined && clientInput.maxRange !== undefined && clientInput.minRange > clientInput.maxRange) {
    return { error: `Invalid input: minRange (${clientInput.minRange}) cannot be greater than maxRange (${clientInput.maxRange}).` };
  }

  const ai = new GoogleGenerativeAI(apiKey);
  const model = 'gemini-2.5-flash';
  const config: any = {
    temperature: 0.4,
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

      const aiGeneratedContent = AINumericOutputFieldsSchema.parse(parsedJson);
      DebugLogger.logValidation(attempt, 'Zod Schema Validated', aiGeneratedContent);

      const answer = aiGeneratedContent.answer;
      if (clientInput.minRange !== undefined && answer < clientInput.minRange) {
        throw new Error(`AI answer ${answer} is less than the required minRange of ${clientInput.minRange}.`);
      }
      if (clientInput.maxRange !== undefined && answer > clientInput.maxRange) {
        throw new Error(`AI answer ${answer} is greater than the required maxRange of ${clientInput.maxRange}.`);
      }
      if (!clientInput.allowDecimals && !Number.isInteger(answer)) {
        throw new Error(`AI answer ${answer} is not an integer, but decimals are not allowed.`);
      }

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

      const completeQuestion: NumericQuestion = {
        id: generateUniqueId('num_ai_'),
        questionTypeCode: 'NUMERIC',
        prompt: aiGeneratedContent.prompt,
        answer: aiGeneratedContent.answer,
        tolerance: clientInput.tolerance ?? aiGeneratedContent.tolerance ?? 0,
        explanation: aiGeneratedContent.explanation,
        points: aiGeneratedContent.points,
        meta: Object.keys(meta).length > 0 ? meta : undefined,
        imageUrl: clientInput.imageUrl,
      };

      const validatedQuestion = NumericQuestionZodSchema.parse(completeQuestion);
      attemptResults.push({ success: true, duration, promptLength: promptText.length, responseLength: rawText.length, promptHash });
      
      console.log(`\n✅ Numeric generation successful on attempt ${attempt} (${duration}ms)`);
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
  const errorMessage = `Failed to generate Numeric question after ${MAX_RETRY_ATTEMPTS} attempts. Last error: ${lastError?.message}`;
  console.error('\n❌ Final Result: FAILED');
  console.error(errorMessage);
  return { error: errorMessage };
}