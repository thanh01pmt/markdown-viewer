// src/lib/interactive-quiz-kit/utils/idGenerators.ts
import type { QuizQuestion } from '../types';

/**
 * Generates a simple unique ID.
 * @param prefix Optional prefix for the ID.
 * @returns A string representing the unique ID.
 */
export function generateUniqueId(prefix: string = 'id_'): string {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

/**
 * A simple hash function to create a short, non-cryptographic hash from a string.
 * Used to detect changes in question content.
 * @param str The string to hash.
 * @returns A short hash string.
 */
const hashCode = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return ('0000' + (hash & 0xffff).toString(16)).slice(-4);
};

/**
 * Extracts the pedagogically significant content from a question for hashing.
 * This includes the prompt, options, and correct answers, but excludes metadata like points or explanation.
 * @param question The QuizQuestion object.
 * @returns A standardized string representing the core content.
 */
const getQuestionContentString = (question: QuizQuestion): string => {
  let content = question.prompt;
  switch (question.questionTypeCode) {
    case 'MULTIPLE_CHOICE':
      content += question.options.map(o => o.text).join('');
      content += question.correctAnswerId;
      break;
    case 'MULTIPLE_RESPONSE':
      content += question.options.map(o => o.text).join('');
      content += [...question.correctAnswerIds].sort().join('');
      break;
    case 'TRUE_FALSE':
      content += String(question.correctAnswer);
      break;
    case 'SHORT_ANSWER':
      content += [...question.acceptedAnswers].sort().join('');
      break;
    case 'NUMERIC':
      content += `${question.answer}|${question.tolerance ?? 0}`;
      break;
    // Add other question types here as needed...
    default:
      // For complex types, a JSON stringify of the core fields is a safe default
      content += JSON.stringify(question);
      break;
  }
  return content.replace(/\s+/g, ''); // Normalize by removing whitespace
};

interface QuestionMetadataForCode {
    subjectCode?: string;
    topicCode?: string;
    bloomLevelCode?: string;
    questionTypeCode?: string;
}

/**
 * Generates a unique, descriptive, and immutable code for a question based on its content and metadata.
 * Format: SUBJECT-TOPIC-BLOOM-TYPE-CONTENTHASH-RANDOM
 * @param metadata An object containing the codes for subject, topic, bloom level, and question type.
 * @param questionConfig The full QuizQuestion object.
 * @returns A formatted, uppercase question code.
 */
export function generateQuestionCode(metadata: QuestionMetadataForCode, questionConfig: QuizQuestion): string {
    const subject = (metadata.subjectCode || 'NOSUB').toUpperCase();
    const topic = (metadata.topicCode || 'NOTOP').toUpperCase();
    const bloom = (metadata.bloomLevelCode || 'NOBLM').toUpperCase();
    const type = (metadata.questionTypeCode || 'NOTYPE').toUpperCase();

    const contentString = getQuestionContentString(questionConfig);
    const contentHash = hashCode(contentString).toUpperCase();
    
    const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();

    const finalCode = `${subject}-${topic}-${bloom}-${type}-${contentHash}-${randomString}`;

    // Final sanitization for safety, although inputs should be clean.
    return finalCode.replace(/[^A-Z0-9-]/g, '_');
}