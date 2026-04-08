// FILE: src/lib/interactive-quiz-kit/ai/flows/generate-quiz-from-text.ts
// ================================================================================
// VERSION CHUYỂN ĐỔI: Sử dụng @google/generative-ai để chạy trên trình duyệt.

'use client';

import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateUniqueId } from '../../utils/idGenerators';
import type { QuizQuestion } from '../../types';
import {
  type GenerateQuizFromTextClientInput,
  type GenerateQuizFromTextOutput,
  GenerateQuizFromTextOutputSchema,
} from './generate-quiz-from-text-types';
import { extractJsonFromMarkdown } from '../../utils/jsonUtils';

const AnyGeneratedQuestionSchema = GenerateQuizFromTextOutputSchema.shape.generatedQuestions.element;
type AnyGeneratedQuestion = z.infer<typeof AnyGeneratedQuestionSchema>;


export async function generateQuizFromText(
  clientInput: GenerateQuizFromTextClientInput,
  apiKey: string
): Promise<GenerateQuizFromTextOutput> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    const { language, documentContent, numQuestions, questionTypes } = clientInput;
    const allowedTypes = questionTypes || ['MULTIPLE_CHOICE', 'TRUE_FALSE'];

    const promptText = `
You are an expert educator. Your task is to create a quiz with exactly ${numQuestions} questions based SOLELY on the provided document content.

**DOCUMENT CONTENT:**
---
${documentContent}
---

**QUIZ REQUIREMENTS:**
1.  **Total Questions:** Generate exactly ${numQuestions} questions.
2.  **Language:** All content (prompts, options, explanations) must be in ${language}.
3.  **Content Source:** All questions MUST be derived directly from the provided DOCUMENT CONTENT. Do not use any external knowledge.
4.  **Question Types:** Use a mix of the following question types: ${allowedTypes.join(', ')}. Prioritize 'MULTIPLE_CHOICE'.
5.  **Key Concepts:** Focus on the most important facts, definitions, and concepts within the text.
6.  **Explanations:** Provide a brief, clear explanation for each question, referencing the source text.

**OUTPUT FORMAT:**
Return the response as a single JSON object with a key "generatedQuestions" containing an array of exactly ${numQuestions} question objects. Do NOT include any other text or markdown formatting outside of the JSON object.

**Example of the JSON structure:**

{
  "generatedQuestions": [
    {
      "questionTypeCode": "MULTIPLE_CHOICE",
      "prompt": "Based on the text, what is the primary function of a mitochondria?",
      "options": [
        { "tempId": "A", "text": "Cellular respiration" },
        { "tempId": "B", "text": "Photosynthesis" },
        { "tempId": "C", "text": "Protein synthesis" }
      ],
      "correctTempOptionId": "A",
      "explanation": "The document states that mitochondria are the powerhouses of the cell, responsible for cellular respiration.",
      "points": 10,
      "difficultyCode": "MEDIUM",
      "topic": "Cell Biology"
    },
    {
      "questionTypeCode": "TRUE_FALSE",
      "prompt": "The document indicates that the cell wall is found in both plant and animal cells.",
      "correctAnswer": false,
      "explanation": "The text specifies that the cell wall is a feature of plant cells, not animal cells.",
      "points": 10,
      "difficultyCode": "EASY",
      "topic": "Cell Biology"
    }
  ]
}


Now, generate the JSON response.`;
    
    const modelName = 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });
    const contents = [{ role: 'user' as const, parts: [{ text: promptText }] }];

    const result = await model.generateContent({
      contents: contents,
    });

    const response = result.response;
    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!rawText) {
      throw new Error("AI returned an empty response.");
    }
    
    const jsonText = extractJsonFromMarkdown(rawText);
    const aiGeneratedContent = JSON.parse(jsonText);

    if (!aiGeneratedContent.generatedQuestions || !Array.isArray(aiGeneratedContent.generatedQuestions)) {
      throw new Error("AI did not return a valid 'generatedQuestions' array.");
    }

    const finalQuestions: AnyGeneratedQuestion[] = [];
    for (const rawQuestion of aiGeneratedContent.generatedQuestions) {
      try {
        const questionId = generateUniqueId(`${rawQuestion.questionTypeCode}_`);
        let finalQuestion: Partial<AnyGeneratedQuestion> | null = null;

        switch (rawQuestion.questionTypeCode) {
          case 'MULTIPLE_CHOICE': {
            const tempOptions = rawQuestion.options || [];
            const finalOptions = tempOptions.map((opt: { text: string; tempId: string }) => ({
              id: generateUniqueId('opt_'),
              text: opt.text,
              tempId: opt.tempId,
            }));
            const correctTempId = rawQuestion.correctTempOptionId;
            const correctFinalOption = finalOptions.find((opt: { tempId: string }) => opt.tempId === correctTempId);
            
            if (!correctFinalOption) {
              console.warn(`Skipping MCQ due to invalid correctTempOptionId: ${correctTempId}`);
              continue;
            }

            finalQuestion = {
              ...rawQuestion,
              id: questionId,
              options: finalOptions.map(({ tempId, ...rest }: { tempId: string, id: string, text: string }) => rest),
              correctAnswerId: correctFinalOption.id,
            };
            break;
          }
          case 'TRUE_FALSE':
          case 'SHORT_ANSWER': {
            finalQuestion = { ...rawQuestion, id: questionId };
            break;
          }
          default:
            console.warn(`Unsupported question type generated by AI: ${rawQuestion.questionTypeCode}. Skipping.`);
            continue;
        }

        const validatedQuestion = AnyGeneratedQuestionSchema.parse(finalQuestion);
        finalQuestions.push(validatedQuestion);

      } catch (error) {
        console.error("Error processing a single generated question:", error, "Question data:", rawQuestion);
      }
    }

    return { generatedQuestions: finalQuestions };

  } catch (error: any) {
    console.error('Error generating quiz from text:', error);
    if (error instanceof z.ZodError) {
      throw new Error(`AI output validation failed: ${error.message}`);
    }
    throw new Error(`Failed to generate quiz from text: ${error.message}`);
  }
}