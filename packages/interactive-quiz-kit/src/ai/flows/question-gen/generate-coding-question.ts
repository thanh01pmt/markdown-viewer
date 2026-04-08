// src/lib/interactive-quiz-kit/ai/flows/question-gen/generate-coding-question.ts

'use client';

import { z } from 'zod';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import type { CodingQuestion, TestCase } from '../../../types';
import { generateUniqueId } from '../../../utils/idGenerators';
import { DebugLogger, type AttemptResult } from '../../../utils/debug-logger';
import { urlToGenerativePart } from '../../../utils/aiUtils';
import {
  type GenerateCodingQuestionClientInput,
  type GenerateCodingQuestionOutput,
  AICodingQuestionOutputSchema,
} from './generate-coding-question-types';
import { CodingQuestionZodSchema } from './question-generation-schemas';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 3000;

function buildEnhancedPrompt(clientInput: GenerateCodingQuestionClientInput, attemptNumber: number): string {
  const { quizContext, difficultyCode, codingLanguage, language, imageUrl } = clientInput;
  const subject = quizContext?.originalSubject || codingLanguage;

  const attemptInfo = attemptNumber > 1 ?
    `\n## DEBUG INFO - This is attempt #${attemptNumber}\nPrevious attempts failed. Pay strict attention to the JSON schema and all rules. Ensure every object in the 'testCases' array has a non-null 'expectedOutput' field.\n\n` : '';

  const imageContextInstruction = imageUrl
    ? `**Image Context:** You MUST analyze the provided image. The coding problem must be directly related to processing or interpreting the content of this image.`
    : '';

  const contextStrings = [
    `**Subject:** ${subject}`,
    quizContext?.description && `**Learning Objective:** ${quizContext.description}`,
    imageContextInstruction,
    quizContext?.plannedBloomLevelCode && `**Cognitive Level (Bloom's):** ${quizContext.plannedBloomLevelCode}`,
    quizContext?.targetMisconception && `**Target Misconception:** The problem should test against this common error: "${quizContext.targetMisconception}"`,
  ].filter(Boolean).map(s => `- ${s}`).join('\n');
  
  const exampleJson = JSON.stringify({
    prompt: "Write a function named 'add' that takes two integers and returns their sum.",
    functionSignature: "function add(a, b) { ... }",
    solutionCode: "function add(a, b) {\n  return a + b;\n}",
    testCases: [
      { "input": [1, 2], "expectedOutput": 3, "isPublic": true },
      { "input": [-1, 1], "expectedOutput": 0, "isPublic": true },
      { "input": [0, 0], "expectedOutput": 0, "isPublic": false }
    ],
    verifiedCodingLanguage: "javascript"
  }, null, 2);

  return `${attemptInfo}You are an expert programming problem designer for ${subject}.
Generate a single, high-quality Coding question.

## Core Rules
1.  **Language Purity:** All code ('functionSignature', 'solutionCode') MUST be in **${codingLanguage}**.
2.  **Context Adherence:** The problem MUST be directly related to the provided context.
3.  **Format Integrity:** You MUST return ONLY a single, valid JSON object.
4.  **Test Case Integrity:** Every test case object in the 'testCases' array MUST have a non-null and defined 'expectedOutput' field. This is a critical rule.

## CRITICAL CONTEXT FOR THIS QUESTION
${contextStrings}

## Task: Generate the Question
### Input Parameters
- **Topic for Question:** ${quizContext?.plannedTopic || 'General'}
- **Natural Language for Text:** ${language}
- **Coding Language:** ${codingLanguage}
- **Difficulty Level:** ${difficultyCode}

### Required JSON Output Format
Your response must be ONLY the JSON object, matching this exact structure:

${exampleJson}

Now, generate the JSON for the requested question.`;
}

export async function generateCodingQuestion(
  clientInput: GenerateCodingQuestionClientInput,
  apiKey: string
): Promise<GenerateCodingQuestionOutput> {
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

      const aiGeneratedContent = AICodingQuestionOutputSchema.parse(parsedJson);
      DebugLogger.logValidation(attempt, 'Zod Schema Validated', aiGeneratedContent);

      if (aiGeneratedContent.verifiedCodingLanguage && aiGeneratedContent.verifiedCodingLanguage !== clientInput.codingLanguage) {
        throw new Error(`Language mismatch: Required ${clientInput.codingLanguage}, but AI generated for ${aiGeneratedContent.verifiedCodingLanguage}.`);
      }

      const testCases: TestCase[] = aiGeneratedContent.testCases.map(tc => ({
        id: generateUniqueId('tc_'),
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isPublic: tc.isPublic,
      }));
      
      const meta: Record<string, string[]> = {};
      if (clientInput.quizContext?.originalLoId) {
          meta['learningObjectiveCodes'] = [clientInput.quizContext.originalLoId];
      }

      const completeQuestion = {
        id: generateUniqueId('coding_'),
        questionTypeCode: 'CODING',
        prompt: aiGeneratedContent.prompt,
        codingLanguage: clientInput.codingLanguage,
        functionSignature: aiGeneratedContent.functionSignature,
        solutionCode: aiGeneratedContent.solutionCode,
        testCases: testCases,
        points: 25,
        meta: Object.keys(meta).length > 0 ? meta : undefined,
        imageUrl: clientInput.imageUrl,
      };

      CodingQuestionZodSchema.parse(completeQuestion);
      
      attemptResults.push({ success: true, duration, promptLength: promptText.length, responseLength: rawText.length, promptHash });
      
      console.log(`\n✅ Coding question generation successful on attempt ${attempt} (${duration}ms)`);
      if (attempt > 1) DebugLogger.logAttemptSummary(attemptResults);
      
      return { question: completeQuestion as CodingQuestion };

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
  const errorMessage = `Failed to generate Coding question after ${MAX_RETRY_ATTEMPTS} attempts. Last error: ${lastError?.message}`;
  console.error('\n❌ Final Result: FAILED');
  console.error(errorMessage);
  return { error: errorMessage };
}