import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { parseQuizContent, type QuizData, type QuizQuestion } from '../../lib/quiz-parser';
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Award } from 'lucide-react';

interface QuizRendererProps {
  content: string;
  title?: string;
  className?: string;
}

export default function QuizRenderer({ content, title, className }: QuizRendererProps) {
  const [data] = useState<QuizData>(parseQuizContent(content));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const question = data.questions[currentIdx];
  const isLast = currentIdx === data.questions.length - 1;

  const handleSelect = (option: string) => {
    if (showResult) return;
    setSelectedAnswers(prev => ({ ...prev, [question.question_id]: option }));
  };

  const next = () => {
    if (isLast) {
      setIsFinished(true);
    } else {
      setShowResult(false);
      setCurrentIdx(i => i + 1);
    }
  };

  const score = data.questions.filter(q => selectedAnswers[q.question_id] === q.correct_answer).length;

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <Award className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
        <p className="text-slate-500 mb-8 text-lg">You scored {score} out of {data.questions.length}</p>
        
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 mb-8 inline-block min-w-[300px]">
          <div className="text-4xl font-bold text-primary-600 mb-1">
            {Math.round((score / data.questions.length) * 100)}%
          </div>
          <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Final Score</div>
        </div>

        <div>
          <button 
            onClick={() => {
              setCurrentIdx(0);
              setSelectedAnswers({});
              setShowResult(false);
              setIsFinished(false);
            }}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold hover:scale-105 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            Restart Quiz
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      <div className="flex items-center justify-between mb-8">
        <div className="text-sm font-bold text-primary-600 uppercase tracking-widest">
          Question {currentIdx + 1} of {data.questions.length}
        </div>
        <div className="h-2 w-32 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-500 transition-all duration-500" 
            style={{ width: `${((currentIdx + 1) / data.questions.length) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
            {question.question_text}
          </h3>

          <div className="space-y-3">
            {question.options?.map((option, idx) => {
              const isSelected = selectedAnswers[question.question_id] === option;
              const isCorrect = option === question.correct_answer;
              const showCheck = showResult && isCorrect;
              const showError = showResult && isSelected && !isCorrect;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(option)}
                  disabled={showResult}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group",
                    isSelected 
                      ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/20" 
                      : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600",
                    showCheck && "border-green-500 bg-green-50/50 dark:bg-green-900/20",
                    showError && "border-red-500 bg-red-50/50 dark:bg-red-900/20",
                    showResult && !isSelected && !isCorrect && "opacity-50"
                  )}
                >
                  <span className={cn(
                    "font-medium",
                    isSelected ? "text-primary-700 dark:text-primary-300" : "text-slate-600 dark:text-slate-400",
                    showCheck && "text-green-700 dark:text-green-300",
                    showError && "text-red-700 dark:text-red-300"
                  )}>
                    {option}
                  </span>
                  {showCheck && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {showError && <XCircle className="w-5 h-5 text-red-500" />}
                </button>
              );
            })}
          </div>

          {showResult && question.explanation && (
            <motion.div 
              initial={{ opacity: 0.5, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400"
            >
              <span className="font-bold text-slate-900 dark:text-white block mb-1">Explanation:</span>
              {question.explanation}
            </motion.div>
          )}

          <div className="pt-4">
            {!showResult ? (
              <button
                disabled={!selectedAnswers[question.question_id]}
                onClick={() => setShowResult(true)}
                className="w-full py-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-primary-900/20 transition-all active:scale-95"
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={next}
                className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 group transition-all active:scale-95"
              >
                {isLast ? "See Performance" : "Next Question"}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
