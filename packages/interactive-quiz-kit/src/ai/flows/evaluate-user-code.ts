// FILE: src/lib/interactive-quiz-kit/ai/flows/evaluate-user-code.ts
// ================================================================================
// VERSION CHUYỂN ĐỔI: Sử dụng @google/generative-ai để chạy trên trình duyệt.

'use client';

import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractJsonFromMarkdown } from '../../utils/jsonUtils';
import {
  type EvaluateUserCodeClientInput,
  type EvaluateUserCodeOutput,
  EvaluateUserCodeOutputSchema,
} from './evaluate-user-code-types';

//================================================================//
// MAIN FUNCTION
//================================================================//

export async function evaluateUserCode(
  clientInput: EvaluateUserCodeClientInput,
  apiKey: string
): Promise<EvaluateUserCodeOutput> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    const { language, problemPrompt, userCode, testCase } = clientInput;

    const promptText = `
You are an expert Code Judge and Teaching Assistant for a ${language} programming course.
Your task is to evaluate a student's code submission for a specific problem against a single test case.

## Problem Description
${problemPrompt}

## Student's Code Submission
${language}
${userCode}


## Test Case to Evaluate
- Input(s): ${JSON.stringify(testCase.input)}
- Expected Output: ${JSON.stringify(testCase.expectedOutput)}

## Your Task
1.  **Analyze Execution:** Mentally execute the student's code with the provided input(s).
2.  **Determine Output:** Figure out what the actual output of the code would be.
3.  **Compare:** Compare the actual output with the expected output.
4.  **Handle Errors:** If the code has a syntax error or would crash, treat it as a failure.
5.  **Provide Reasoning:** Briefly explain your conclusion. If it failed, explain why (e.g., "incorrect result", "infinite loop", "syntax error on line 5").

**CRITICAL JSON OUTPUT FORMAT:**
Return ONLY the JSON object with this EXACT structure.


{
  "passed": false,
  "actualOutput": 5,
  "reasoning": "The function correctly summed the numbers but did not filter for only even numbers."
}


Return only the JSON response.`;
    
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

    return EvaluateUserCodeOutputSchema.parse(aiGeneratedContent);

  } catch (error: any) {
    console.error('Error evaluating user code:', error);
    if (error instanceof z.ZodError) {
      throw new Error(`AI evaluation output validation failed: ${error.message}`);
    }
    return {
      passed: false,
      actualOutput: "Evaluation Error",
      reasoning: `The AI judge failed to process the code. Error: ${error.message}`
    };
  }
}