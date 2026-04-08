export interface QuizQuestion {
  question_id: string;
  question_text: string;
  question_type: 'mcq' | 'true_false' | 'short_answer' | 'multiple_choice' | 'fill_in_the_blank' | 'matching' | 'ordering' | 'essay';
  options?: string[];
  correct_answer: string | string[];
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  bloom_level?: string;
  lo_code?: string;
  matching_pairs?: { left: string; right: string }[];
}

export interface QuizData {
  questions: QuizQuestion[];
  total_questions?: number;
}

export function parseQuizContent(content: string): QuizData {
  const lines = content.split('\n');
  const questions: QuizQuestion[] = [];
  
  let currentQuestion: Partial<QuizQuestion> = {};
  let inOptions = false;
  let inPairs = false;
  let lastKey: string | null = null;
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (line.match(/^###\s+Item/i)) {
      if (currentQuestion.question_id) {
        questions.push(currentQuestion as QuizQuestion);
      }
      currentQuestion = {};
      inOptions = false;
      inPairs = false;
      lastKey = null;
      return;
    }

    const kvMatch = line.match(/^[-*]\s+\*\*(.+?):\s*\*\*\s*(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1].toLowerCase();
      const value = kvMatch[2].trim();
      inOptions = false;
      inPairs = false;
      lastKey = null;

      if (key === 'id') currentQuestion.question_id = value;
      else if (key === 'type') currentQuestion.question_type = value.toLowerCase().replace(/\s+/g, '_') as QuizQuestion['question_type'];
      else if (key === 'question') {
        currentQuestion.question_text = value;
        lastKey = 'question';
      }
      else if (key === 'correct answer') currentQuestion.correct_answer = value;
      else if (key === 'explanation') {
        currentQuestion.explanation = value;
        lastKey = 'explanation';
      }
      else if (key === 'bloom level') currentQuestion.bloom_level = value;
      else if (key === 'options') {
        inOptions = true;
        currentQuestion.options = [];
        lastKey = 'options';
      }
      else if (key === 'pairs' || key === 'matching pairs') {
        inPairs = true;
        currentQuestion.matching_pairs = [];
        lastKey = 'pairs';
      }
      return;
    }

    if (inOptions && currentQuestion.options) {
      const optMatch = line.match(/^\s*[-*]\s+(.+)$/);
      if (optMatch) {
        const cleanOption = optMatch[1].replace(/^[A-Z0-9]+\.\s*/, '').trim();
        currentQuestion.options.push(cleanOption);
        return;
      }
    }

    if (inPairs && currentQuestion.matching_pairs) {
      const pairMatch = line.match(/^\s*[-*]\s+(.+?)\s*(?:->|:)\s*(.+)$/);
      if (pairMatch) {
        currentQuestion.matching_pairs.push({
          left: pairMatch[1].trim(),
          right: pairMatch[2].trim()
        });
        return;
      }
    }

    if (lastKey && !line.match(/^###/) && !kvMatch) {
      if (lastKey === 'question') {
        currentQuestion.question_text = (currentQuestion.question_text ? currentQuestion.question_text + '\n' : '') + trimmed;
      } else if (lastKey === 'explanation') {
        currentQuestion.explanation = (currentQuestion.explanation ? currentQuestion.explanation + '\n' : '') + trimmed;
      }
    }
  });

  if (currentQuestion.question_id) {
    questions.push(currentQuestion as QuizQuestion);
  }

  return {
    questions,
    total_questions: questions.length
  };
}
