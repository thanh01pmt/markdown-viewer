// packages/interactive-quiz-kit/src/ai/flows/question-gen/generate-mrq-question.ts
'use client';

import { z } from 'zod';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import type { MultipleResponseQuestion, QuestionOption } from '../../../types';
import { generateUniqueId } from '../../../utils/idGenerators';
import { urlToGenerativePart } from '../../../utils/aiUtils';
import {
  type GenerateMRQQuestionClientInput,
  type GenerateMRQQuestionOutput,
  AIMRQOutputFieldsSchema,
} from './generate-mrq-question-types';
import { MultipleResponseQuestionZodSchema } from './question-generation-schemas';
import { DebugLogger, type AttemptResult } from '../../../utils/debug-logger';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 3000;

function buildEnhancedPrompt(clientInput: GenerateMRQQuestionClientInput, attemptNumber: number): string {
  const { quizContext, language, difficultyCode, numberOfOptions, minCorrectAnswers, maxCorrectAnswers, imageUrl } = clientInput;
  const category = quizContext?.originalCategory || 'the specified technical category';
  
  const attemptInfo = attemptNumber > 1 ?
    `\n## DEBUG INFO - This is attempt #${attemptNumber}\nPrevious attempts failed due to validation errors. Pay close attention to the number of correct answers and the JSON schema.\n\n` : '';

  const imageContextInstruction = imageUrl
    ? `**Image Context:** You MUST analyze the provided image. The question and options must be directly related to the content of this image.`
    : '';

  const contextStrings = [
    `**Required Category:** ${category} (This is the ONLY language to be used)`,
    quizContext?.description && `**Learning Objective:** ${quizContext.description}`,
    imageContextInstruction,
    quizContext?.plannedBloomLevelCode && `**Cognitive Level (Bloom's):** ${quizContext.plannedBloomLevelCode}`,
    quizContext?.targetMisconception && `**Target Misconception:** Use this to create plausible incorrect answers (distractors). The misconception is: "${quizContext.targetMisconception}"`,
    quizContext?.difficultyReason && `**Pedagogical Reason:** ${quizContext.difficultyReason}`,
  ].filter(Boolean).map(s => `- ${s}`).join('\n');

  const exampleJson = JSON.stringify({
    prompt: "Which of the following are considered programming paradigms?",
    options: [
      { "tempId": "A", "text": "Object-Oriented" },
      { "tempId": "B", "text": "Assembly" },
      { "tempId": "C", "text": "Functional" },
      { "tempId": "D", "text": "Procedural" },
      { "tempId": "E", "text": "Middleware" }
    ],
    correctTempOptionIds: ["A", "C", "D"],
    explanation: "Object-Oriented, Functional, and Procedural are all major programming paradigms. Assembly is a low-level language, and Middleware is a type of software, not a paradigm.",
    points: 10,
    difficultyCode: "MEDIUM",
    topic: "Programming Paradigms",
    verifiedCategory: category
  }, null, 2);

  return `${attemptInfo}You are an expert Question Author for advanced technical education, specializing in the programming language: ${category}.
Your sole mission is to create a high-quality, technically accurate Multiple Response Question. You must adhere to the following rules at all times.

## Core Rules (Non-negotiable)
1.  **Category Purity:** The question, options, and explanation MUST be exclusively about **${category}**.
2.  **Context Adherence:** The question's content must directly align with all provided context.
3.  **Format Integrity:** You MUST return ONLY a single, valid JSON object that strictly follows the provided schema. Do not include any extra text or comments.

## CRITICAL CONTEXT FOR THIS QUESTION
${contextStrings}

## Task: Generate the Question
Based on all the rules and context above, generate a single Multiple Response Question.

### Input Parameters
- **Topic for Question:** ${quizContext?.plannedTopic || 'General'}
- **Language for Text:** ${language}
- **Difficulty Level:** ${difficultyCode}
- **Number of Options:** Generate exactly ${numberOfOptions} options.
- **Number of Correct Answers:** The 'correctTempOptionIds' array MUST contain between ${minCorrectAnswers} and ${maxCorrectAnswers} valid IDs from the options you generate.

### Required JSON Output Format
Your response must be ONLY the JSON object, matching this exact structure and field names.

${exampleJson}

Now, generate the JSON for the requested question.`;
}

export async function generateMRQQuestion(
  clientInput: GenerateMRQQuestionClientInput,
  apiKey: string
): Promise<GenerateMRQQuestionOutput> {
  if (clientInput.minCorrectAnswers > clientInput.maxCorrectAnswers) {
    return { error: `Invalid input: minCorrectAnswers (${clientInput.minCorrectAnswers}) cannot be greater than maxCorrectAnswers (${clientInput.maxCorrectAnswers}).` };
  }
  if (clientInput.maxCorrectAnswers >= clientInput.numberOfOptions) {
    return { error: `Invalid input: maxCorrectAnswers (${clientInput.maxCorrectAnswers}) must be less than the total numberOfOptions (${clientInput.numberOfOptions}).` };
  }

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
      const modelInstance = ai.getGenerativeModel({ model, generationConfig: config });
      const aiResult = await modelInstance.generateContent({
        contents,
      });

      const response = aiResult.response;
      const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const duration = Date.now() - startTime;
      DebugLogger.logResponse(attempt, rawText);

      if (!rawText) {
        throw new Error("AI returned an empty response.");
      }

      const parsedJson = JSON.parse(rawText);
      DebugLogger.logValidation(attempt, 'JSON Parsed Successfully', parsedJson);

      const aiGeneratedContent = AIMRQOutputFieldsSchema.parse(parsedJson);
      DebugLogger.logValidation(attempt, 'Zod Schema Validated', aiGeneratedContent);
      
      if (aiGeneratedContent.options.length !== clientInput.numberOfOptions) {
          throw new Error(`AI generated ${aiGeneratedContent.options.length} options, but ${clientInput.numberOfOptions} were required.`);
      }
      const correctCount = aiGeneratedContent.correctTempOptionIds.length;
      if (correctCount < clientInput.minCorrectAnswers || correctCount > clientInput.maxCorrectAnswers) {
          throw new Error(`AI provided ${correctCount} correct answers, which is outside the required range of ${clientInput.minCorrectAnswers}-${clientInput.maxCorrectAnswers}.`);
      }
      
      if (clientInput.quizContext?.originalCategory) {
        const verifiedCategory = aiGeneratedContent.verifiedCategory?.toLowerCase();
        const requiredCategory = clientInput.quizContext.originalCategory.toLowerCase();
        if (verifiedCategory && verifiedCategory !== requiredCategory) {
          throw new Error(`Category mismatch: Required ${requiredCategory}, got ${verifiedCategory}`);
        }
      }

      const finalOptions: QuestionOption[] = [];
      const tempIdToFinalIdMap: Record<string, string> = {};
      const allTempIds = new Set<string>();
      aiGeneratedContent.options.forEach(aiOption => {
        const finalId = generateUniqueId('opt_mr_');
        finalOptions.push({ id: finalId, text: aiOption.text });
        tempIdToFinalIdMap[aiOption.tempId] = finalId;
        allTempIds.add(aiOption.tempId);
      });

      const finalCorrectAnswerIds = aiGeneratedContent.correctTempOptionIds.map(tempId => {
        if (!allTempIds.has(tempId)) {
          throw new Error(`AI provided an invalid correctTempOptionId ('${tempId}') which does not exist in the generated options.`);
        }
        return tempIdToFinalIdMap[tempId];
      });

      const meta: Record<string, string[]> = {};
      if (clientInput.quizContext?.originalLoId) {
          meta['learningObjectiveCodes'] = [clientInput.quizContext.originalLoId];
      }

      const completeQuestion: MultipleResponseQuestion = {
        id: generateUniqueId('mrq_ai_'),
        questionTypeCode: 'MULTIPLE_RESPONSE',
        prompt: aiGeneratedContent.prompt,
        options: finalOptions,
        correctAnswerIds: finalCorrectAnswerIds,
        explanation: aiGeneratedContent.explanation,
        points: aiGeneratedContent.points,
        meta: Object.keys(meta).length > 0 ? meta : undefined,
        imageUrl: clientInput.imageUrl,
      };

      const validatedQuestion = MultipleResponseQuestionZodSchema.parse(completeQuestion);
      attemptResults.push({ success: true, duration, promptLength: promptText.length, responseLength: rawText.length, promptHash });
      
      console.log(`\n✅ MRQ generation successful on attempt ${attempt} (${duration}ms)`);
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
  const errorMessage = `Failed to generate MRQ question after ${MAX_RETRY_ATTEMPTS} attempts. Last error: ${lastError?.message}`;
  console.error('\n❌ Final Result: FAILED');
  console.error(errorMessage);
  return { error: errorMessage };
}