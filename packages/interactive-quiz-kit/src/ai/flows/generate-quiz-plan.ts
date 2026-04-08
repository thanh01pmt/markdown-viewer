// FILE: src/lib/interactive-quiz-kit/ai/flows/generate-quiz-plan.ts
// ================================================================================
// UPDATED: The flow now accepts an `imageContexts` library and instructs the AI
// to associate planned questions with relevant images by including an `imageId`.

'use client';

import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { QuestionTypeStrings } from '../../types';
import { extractJsonFromMarkdown } from '../../utils/jsonUtils';
import {
  type GenerateQuizPlanClientInput,
  type GenerateQuizPlanOutput,
  GenerateQuizPlanOutputSchema
} from './generate-quiz-plan-types';

//================================================================//
// LOGGING UTILITIES
//================================================================//

interface PlanGenerationLog {
  timestamp: string;
  phase: string;
  data: any;
  duration?: number;
}

class QuizPlanLogger {
  private logs: PlanGenerationLog[] = [];
  private startTime: number = Date.now();

  log(phase: string, data: any, duration?: number) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      phase,
      data,
      duration
    });
    
    // Console log for immediate feedback
    if (duration !== undefined) {
      console.log(`[${phase}] Completed in ${duration}ms:`, data);
    } else {
      console.log(`[${phase}]:`, data);
    }
  }

  getLogs() {
    return this.logs;
  }

  getTotalDuration() {
    return Date.now() - this.startTime;
  }
}

//================================================================//
// ENHANCED HELPER FUNCTIONS
//================================================================//

function generateQuestionTypeSelectionGuidance(): string {
  return `
QUESTION TYPE SELECTION BEST PRACTICES:

**TRUE_FALSE (true_false)**
- Best for: Binary concepts, fact verification, common misconceptions
- Bloom levels: Primarily Remembering, Understanding
- Use when: Testing definitive statements, clarifying misconceptions
- Example: "Photosynthesis only occurs during daytime" (targets timing misconception)

**MULTIPLE CHOICE (multiple_choice)**
- Best for: Concept selection, process understanding, comparison
- Bloom levels: All levels, especially Understanding and Applying
- Use when: Testing conceptual understanding with clear alternatives
- Example: "Which factor most affects enzyme activity?" (applying knowledge)

**MULTIPLE RESPONSE (multiple_response)**
- Best for: Identifying multiple correct factors, comprehensive understanding
- Bloom levels: Understanding, Analyzing, Evaluating
- Use when: Multiple correct answers exist, testing thorough knowledge
- Example: "Select all factors that influence plant growth" (analyzing components)

**FILL IN THE BLANKS (fill_in_the_blanks)**
- Best for: Key terminology, formulas, specific facts
- Bloom levels: Remembering, Understanding
- Use when: Testing precise recall of important terms/concepts
- Example: "The process of _____ converts light energy to chemical energy"

**NUMERIC (numeric)**
- Best for: Calculations, quantitative problems, formula application
- Bloom levels: Applying, Analyzing
- Use when: Mathematical computations are required
- Example: "Calculate the molarity of a 2L solution containing 0.5 moles of NaCl"

**MATCHING (matching)**
- Best for: Connecting related concepts, terminology pairs
- Bloom levels: Remembering, Understanding
- Use when: Testing relationships between terms and definitions
- Example: Match organelles with their functions

**SEQUENCE (sequence)**
- Best for: Process steps, chronological order, procedural knowledge
- Bloom levels: Understanding, Applying, Analyzing
- Use when: Order or sequence is critical to understanding
- Example: "Arrange the steps of mitosis in correct order"

**DRAG AND DROP (drag_and_drop)**
- Best for: Categorization, classification, spatial relationships
- Bloom levels: Understanding, Applying, Analyzing
- Use when: Grouping or organizing information is key
- Example: "Classify these compounds as acids, bases, or neutral"

**SHORT ANSWER (short_answer)**
- Best for: Explanations, definitions, problem-solving steps
- Bloom levels: Understanding, Applying, Analyzing, Evaluating, Creating
- Use when: Requiring explanatory responses, open-ended thinking
- Example: "Explain why enzymes are specific to certain substrates"

**CODING (coding)**
- Best for: Programming problems, algorithm implementation
- Bloom levels: Applying, Analyzing, Evaluating, Creating
- Use when: Technical implementation or code analysis is required
- Example: "Write a function to calculate factorial recursively"
`;
}

function generateAdvancedBloomGuidance(): string {
  return `
ADVANCED BLOOM'S TAXONOMY & QUESTION TYPE OPTIMIZATION:

**REMEMBERING (Knowledge Recall)**
- Primary types: true_false, fill_in_the_blanks, matching
- Secondary types: multiple_choice (simple recall)
- Focus: Facts, terms, basic concepts, definitions
- Misconception addressing: Use true_false to clarify common confusions

**UNDERSTANDING (Comprehension)**
- Primary types: multiple_choice, short_answer, matching
- Secondary types: multiple_response, sequence
- Focus: Explanations, interpretations, examples, classifications
- Best for: "Explain why...", "What does this mean...", "Give an example..."

**APPLYING (Using Knowledge)**
- Primary types: numeric, short_answer, sequence, coding
- Secondary types: multiple_choice, drag_and_drop
- Focus: Problem-solving, implementing procedures, using methods
- Best for: Calculations, step-by-step processes, practical applications

**ANALYZING (Breaking Down Information)**
- Primary types: multiple_response, short_answer, sequence, coding
- Secondary types: drag_and_drop, multiple_choice
- Focus: Identifying components, relationships, cause-effect
- Best for: "What are the factors...", "How do these relate...", "Break down..."

**EVALUATING (Making Judgments)**
- Primary types: short_answer, multiple_response, coding
- Secondary types: multiple_choice (with justification)
- Focus: Critiquing, judging, comparing alternatives, decision-making
- Best for: "Which is better and why...", "Evaluate the approach...", "Critique..."

**CREATING (Producing New Work)**
- Primary types: short_answer, coding, sequence
- Secondary types: drag_and_drop (design tasks)
- Focus: Designing, planning, producing, constructing
- Best for: "Design a solution...", "Create a plan...", "Develop a strategy..."
`;
}

function generateDiversityRules(): string {
  return `
ENHANCED DIVERSITY & QUALITY ASSURANCE RULES:

**Question Type Distribution Strategy:**
1. Never place more than 3 consecutive questions of the same type
2. Distribute question types based on their cognitive complexity
3. For quizzes with 10+ questions, use at least 4 different question types
4. For quizzes with 20+ questions, use at least 6 different question types
5. Balance quick-answer types (true_false, multiple_choice) with deeper types (short_answer, coding)

**Intelligent Difficulty Progression:**
1. Opening (20%): Start with confidence-building questions (Remembering/Understanding)
2. Building (40%): Gradually increase complexity (Understanding/Applying)
3. Peak (30%): Most challenging questions (Analyzing/Evaluating/Creating)
4. Closing (10%): Moderate challenge to end positively

**Misconception-Driven Planning:**
- When common misconceptions are provided, prioritize question types that can effectively address them
- Use true_false for binary misconceptions
- Use multiple_choice for concept selection misconceptions
- Use short_answer for complex misconceptions requiring explanation

**Contextual Intelligence:**
- Programming/Technical topics: Favor coding, numeric, short_answer
- Process-oriented topics: Favor sequence, short_answer, drag_and_drop
- Conceptual topics: Favor multiple_choice, multiple_response, true_false
- Factual topics: Favor fill_in_the_blanks, matching, true_false
`;
}

function calculateOptimalDistribution(
  totalQuestions: number, 
  availableTypes: string[]
): Record<string, number> {
  const baseCount = Math.floor(totalQuestions / availableTypes.length);
  const remainder = totalQuestions % availableTypes.length;
  
  const distribution: Record<string, number> = {};
  availableTypes.forEach((type, index) => {
    distribution[type] = baseCount + (index < remainder ? 1 : 0);
  });
  
  return distribution;
}

//================================================================//
// MAIN ENHANCED FUNCTION
//================================================================//

export async function generateQuizPlan(
  clientInput: GenerateQuizPlanClientInput,
  apiKey: string,
  imageContexts: any[] = []
): Promise<GenerateQuizPlanOutput & { logs: PlanGenerationLog[] }> {
  const logger = new QuizPlanLogger();
  
  try {
    logger.log('VALIDATION_START', {
      totalQuestions: clientInput.totalQuestions,
      availableTypes: clientInput.selectedQuestionTypes,
      topicCount: clientInput.topics.length,
      bloomLevelCount: clientInput.bloomLevels.length
    });

    // Enhanced validation with logging
    const totalTopicRatio = clientInput.topics.reduce((sum, t) => sum + t.ratio, 0);
    if (Math.abs(totalTopicRatio - 100) > 1) {
      throw new Error(`Total topic ratio must be 100%. Current sum: ${totalTopicRatio.toFixed(1)}%`);
    }
    
    const totalBloomRatio = clientInput.bloomLevels.reduce((sum, b) => sum + b.ratio, 0);
    if (Math.abs(totalBloomRatio - 100) > 1) {
      throw new Error(`Total Bloom level ratio must be 100%. Current sum: ${totalBloomRatio.toFixed(1)}%`);
    }

    logger.log('VALIDATION_SUCCESS', {
      topicRatioSum: totalTopicRatio,
      bloomRatioSum: totalBloomRatio
    });

    // Initialize AI with logging
    const aiStartTime = Date.now();
    const ai = new GoogleGenerativeAI(apiKey);
    
    const modelName = 'gemini-2.5-pro';
    const generationConfig: any = {
      temperature: 0.8,
      responseMimeType: 'application/json',
      thinkingConfig: {
        thinkingBudget: 4096,
      },
    };
    
    logger.log('AI_INITIALIZATION', { model: modelName }, Date.now() - aiStartTime);

    const { language, totalQuestions, numCodingQuestions = 0 } = clientInput;

    // Enhanced prompt preparation with logging
    const promptStartTime = Date.now();
    
    const topicsDistribution = clientInput.topics.map(t => {
      let topicString = `- Topic Context: "${t.topic}", LoId: "${t.originalLoId || 'nil'}", Subject: "${t.originalSubject || 'nil'}", Category: "${t.originalCategory || 'nil'}", Topic: "${t.originalTopic || 'nil'}", Ratio: ${t.ratio}%`;
      if (t.commonMisconceptions && t.commonMisconceptions.length > 0) {
        topicString += `\n    - Common Misconceptions: [${t.commonMisconceptions.join(', ')}]`;
      }
      return topicString;
    }).join('\n    ');
    
    const bloomDistribution = clientInput.bloomLevels.map(b => 
      `- Level: "${b.level}", Ratio: ${b.ratio}%`
    ).join('\n    ');
    
    // === BẮT ĐẦU SỬA ĐỔI ===
    // Lọc động các loại câu hỏi dựa trên yêu cầu về câu hỏi coding
    // SHORT ANSWER và CODING chỉ được phép khi có yêu cầu câu hỏi coding
    let questionTypesForPrompt = [...clientInput.selectedQuestionTypes];
    if (numCodingQuestions === 0) {
      questionTypesForPrompt = questionTypesForPrompt.filter(
        type => type !== 'SHORT_ANSWER' && type !== 'CODING'
      );
    }
    const allowedQuestionTypes = questionTypesForPrompt.map(t => `'${t}'`).join(', ');
    // === KẾT THÚC SỬA ĐỔI ===
    
    const codingRequirement = numCodingQuestions > 0
      ? `\n**CRITICAL CODING REQUIREMENT**: Exactly ${numCodingQuestions} questions in the plan MUST be of type 'CODING'. These should typically be at 'APPLY' or higher Bloom levels and focus on implementation, debugging, or algorithm design.`
      : '';

      const imageContextSection = (imageContexts && imageContexts.length > 0)
      ? `
## AVAILABLE IMAGE CONTEXT LIBRARY
You have access to a library of pre-described images. When planning a question, if its subject, category, and topic match an image in this library AND the image's description is relevant to the planned question's topic, you MUST include the corresponding \`imageId\` in your output. Otherwise, leave the \`imageId\` field null or omit it.


${JSON.stringify(imageContexts.map(img => ({ imageId: img.id, subject: img.subject, category: img.category, topic: img.topic, description: img.detailedDescription })), null, 2)}

`
      : '';

    const enhancedPromptText = `You are an elite educational assessment architect with expertise in cognitive science and adaptive learning. Your mission is to create a strategically optimized quiz plan that maximizes learning effectiveness.

${generateQuestionTypeSelectionGuidance()}

${generateAdvancedBloomGuidance()}

${generateDiversityRules()}

## COMPREHENSIVE QUIZ REQUIREMENTS:

**Target Language**: ${language}
**Total Questions**: ${totalQuestions}${codingRequirement}

**Topic Distribution & Learning Context** (follow precisely):
    ${topicsDistribution}

**Cognitive Complexity Distribution** (follow precisely):
    ${bloomDistribution}

**Available Question Arsenal**: ${allowedQuestionTypes}

**Image Resources**: ${imageContextSection} 

## STRATEGIC PLANNING METHODOLOGY:

1. **Misconception Analysis**: If common misconceptions are provided, design questions specifically to address and correct them
2. **Question Type Intelligence**: Select question types based on the cognitive demands and content nature
3. **Difficulty Orchestration**: Create a learning journey that builds confidence while challenging appropriately
4. **Diversity Optimization**: Ensure variety prevents monotony and maintains engagement
5. **Context Sensitivity**: Match question types to topic characteristics (technical, conceptual, procedural)
6. **Image Context Integration**: Intelligently associate questions with relevant images from the provided library to enhance contextual understanding.

## ENHANCED OUTPUT FORMAT:

Return ONLY a JSON object with this EXACT structure:


{
  "quizPlan": [
   {
      "plannedTopic": "Specific, assessable topic derived from provided context",
      "plannedQuestionTypeCode": "question_type_from_allowed_list",
      "plannedBloomLevelCode": "bloom_level_from_requirements",
      "plannedContextId": "THEO_ABS",
      "imageId": "imgctx_12345abcde", // or null
      "targetMisconception": "Specific misconception this question addresses (or 'none' if not applicable)",
      "difficultyReason": "Strategic explanation of difficulty choice and placement",
      "topicSpecificity": "broad|focused|specific",
      "originalLoId": "corresponding_LoId_from_input",
      "originalSubject": "corresponding_Subject_from_input",
      "originalCategory": "corresponding_Category_from_input",
      "originalTopic": "corresponding_Topic_from_input"
    }
  ],
  "diversityMetrics": {
    "questionTypeDistribution": {"type1": count1, "type2": count2},
    "bloomLevelDistribution": {"level1": count1, "level2": count2},
    "maxConsecutiveSameType": number,
    "difficultyProgression": "description of how difficulty progresses",
    "misconceptionCoverage": number_of_misconceptions_addressed
  },
  "planningStrategy": {
    "overallApproach": "Brief description of the strategic approach taken",
    "keyDecisions": ["Major decision 1", "Major decision 2", "Major decision 3"]
  }
}


Execute this plan with pedagogical precision. The quiz should feel like a carefully crafted learning journey that challenges and educates simultaneously.`;

    logger.log('PROMPT_PREPARATION', {
      promptLength: enhancedPromptText.length,
      topicCount: clientInput.topics.length,
      misconceptionCount: clientInput.topics.reduce((sum, t) => sum + (t.commonMisconceptions?.length || 0), 0)
    }, Date.now() - promptStartTime);

    // AI Generation with timing
    const generationStartTime = Date.now();
    
    const contents = [
      {
        role: 'user' as const,
        parts: [
          {
            text: enhancedPromptText
          }
        ]
      }
    ];

    const aiModel = ai.getGenerativeModel({ model: modelName, generationConfig });
    const aiResult = await aiModel.generateContent({
      contents,
    });
    
    const response = aiResult.response;
    const generationDuration = Date.now() - generationStartTime;
    
    logger.log('AI_GENERATION', {
      responseLength: response.candidates?.[0]?.content?.parts?.[0]?.text?.length || 0,
      duration: generationDuration
    }, generationDuration);

    // JSON Processing with logging
    const processingStartTime = Date.now();
    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Since we're using responseMimeType: 'application/json', the response should already be JSON
    let jsonText = rawText;
    
    // Fallback to extractJsonFromMarkdown if needed
    if (!rawText.trim().startsWith('{') && !rawText.trim().startsWith('[')) {
      jsonText = extractJsonFromMarkdown(rawText);
    }
    
    logger.log('JSON_EXTRACTION', {
      rawTextLength: rawText.length,
      extractedJsonLength: jsonText.length
    });

    const aiGeneratedContent = GenerateQuizPlanOutputSchema.parse(JSON.parse(jsonText));
    logger.log('SCHEMA_VALIDATION', { success: true }, Date.now() - processingStartTime);

    // Enhanced validation with detailed logging
    const validationStartTime = Date.now();
    
    if (aiGeneratedContent.quizPlan.length !== clientInput.totalQuestions) {
      throw new Error(`AI planned for ${aiGeneratedContent.quizPlan.length} questions, but ${clientInput.totalQuestions} were requested.`);
    }

    // Question type validation
    const invalidTypes: string[] = [];
    aiGeneratedContent.quizPlan.forEach((item: any, index: number) => {
      if (!clientInput.selectedQuestionTypes.includes(item.plannedQuestionTypeCode as QuestionTypeStrings)) {
        invalidTypes.push(`Question ${index + 1}: '${item.plannedQuestionTypeCode}'`);
      }
    });

    if (invalidTypes.length > 0) {
      throw new Error(`Invalid question types found: ${invalidTypes.join(', ')}`);
    }

    // Coding questions validation
    const codingQuestions = aiGeneratedContent.quizPlan.filter(q => q.plannedQuestionTypeCode === 'CODING');
    if (numCodingQuestions > 0 && codingQuestions.length !== numCodingQuestions) {
      throw new Error(`Expected ${numCodingQuestions} coding questions, but got ${codingQuestions.length}`);
    }

    // Diversity analysis
    const diversityAnalysis = validateConsecutiveTypes(aiGeneratedContent.quizPlan);
    
    logger.log('VALIDATION_COMPLETE', {
      questionCount: aiGeneratedContent.quizPlan.length,
      codingQuestionCount: codingQuestions.length,
      maxConsecutiveType: diversityAnalysis.maxConsecutive,
      questionTypeDistribution: aiGeneratedContent.diversityMetrics?.questionTypeDistribution || {}
    }, Date.now() - validationStartTime);

    // Final output preparation
    const finalResult = {
      ...aiGeneratedContent,
      logs: logger.getLogs()
    };

    logger.log('GENERATION_COMPLETE', {
      totalDuration: logger.getTotalDuration(),
      success: true,
      finalQuestionCount: finalResult.quizPlan.length
    }, logger.getTotalDuration());

    console.log('\n=== QUIZ PLAN GENERATION SUMMARY ===');
    console.log(`✅ Successfully generated ${finalResult.quizPlan.length} questions`);
    console.log(`⏱️ Total generation time: ${logger.getTotalDuration()}ms`);
    console.log(`🎯 Question types: ${Object.keys(finalResult.diversityMetrics?.questionTypeDistribution || {}).join(', ')}`);
    console.log(`🧠 Bloom levels: ${Object.keys(finalResult.diversityMetrics?.bloomLevelDistribution || {}).join(', ')}`);
    if (numCodingQuestions > 0) {
      console.log(`💻 Coding questions: ${codingQuestions.length}/${numCodingQuestions} required`);
    }

    console.log(JSON.stringify(finalResult));
    console.log('=====================================\n');

    return finalResult;

  } catch (error: any) {
    logger.log('ERROR', {
      message: error.message,
      stack: error.stack,
      totalDuration: logger.getTotalDuration()
    });
    
    console.error('❌ Quiz Plan Generation Failed:', error.message);
    console.error('📋 Full logs available in returned object');
    
    throw new Error(`Failed to generate Quiz Plan: ${error.message}`);
  }
}

function validateConsecutiveTypes(quizPlan: any[]): {
  maxConsecutive: number;
  type: string;
  startIndex: number;
} {
  let maxConsecutive = 1;
  let maxType = quizPlan[0]?.plannedQuestionTypeCode || '';
  let maxStartIndex = 0;
  
  let currentConsecutive = 1;
  let currentType = quizPlan[0]?.plannedQuestionTypeCode || '';
  let currentStartIndex = 0;

  for (let i = 1; i < quizPlan.length; i++) {
    if (quizPlan[i].plannedQuestionTypeCode === currentType) {
      currentConsecutive++;
    } else {
      if (currentConsecutive > maxConsecutive) {
        maxConsecutive = currentConsecutive;
        maxType = currentType;
        maxStartIndex = currentStartIndex;
      }
      currentConsecutive = 1;
      currentType = quizPlan[i].plannedQuestionTypeCode;
      currentStartIndex = i;
    }
  }

  if (currentConsecutive > maxConsecutive) {
    maxConsecutive = currentConsecutive;
    maxType = currentType;
    maxStartIndex = currentStartIndex;
  }

  return {
    maxConsecutive,
    type: maxType,
    startIndex: maxStartIndex
  };
}