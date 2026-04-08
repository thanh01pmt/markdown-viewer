// FILE: src/lib/interactive-quiz-kit/react-ui/components/ui/QuizResult.tsx
// ================================================================================
// UPDATED: Implemented a robust JavaScript-based printing mechanism.

'use client';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { QuizResultType } from '../../../types';
import { Button } from '../elements/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../elements/card';
import { CheckCircle, XCircle, BarChart2, Percent, Clock, LogOut, AlertTriangle, Wand2, Loader2, BookOpen, Star, Printer } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../elements/accordion";
import { ScrollArea } from '../elements/scroll-area';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { cn } from '../../../utils/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../elements/table";

// --- TYPE DEFINITIONS ---
type QuestionResultItem = QuizResultType['questionResults'][0];

interface QuizResultProps {
  result: QuizResultType;
  quizTitle: string;
  onExitQuiz?: () => void;
  onGenerateReview?: () => void;
  showReviewButton?: boolean;
  isReviewLoading?: boolean;
}

// --- HELPER FUNCTIONS ---
const getTruncatedPlainText = (content: string, maxLength: number = 80): string => {
  if (typeof document !== 'undefined') {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";
    return plainText.length > maxLength ? plainText.substring(0, maxLength) + "..." : plainText;
  }
  const plainText = content.replace(/<[^>]*>?/gm, '').replace(/#+\s/g, '');
  return plainText.length > maxLength ? plainText.substring(0, maxLength) + "..." : plainText;
}

const toPascalCase = (name: string | null | undefined): string => {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatTimestamp = (timestamp: number | undefined): string => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

// --- HELPER COMPONENT ---
const QuestionResultDetail: React.FC<{ qResult: QuestionResultItem, index: number }> = ({ qResult, index }) => {
  const { t } = useTranslation();
  const getAnswerDisplay = (answer: any): string => {
    if (answer === null || answer === undefined) return t('practiceFlow.results.notAnswered', 'Not Answered');
    if (typeof answer === 'boolean') return answer ? "True" : "False";
    if (Array.isArray(answer)) return answer.join(', ');
    if (typeof answer === 'object') {
      if (answer.hasOwnProperty('value')) {
        const value = (answer as { value: any }).value;
        if (value === null || value === undefined) return t('practiceFlow.results.notAnswered', 'Not Answered');
        if (typeof value === 'boolean') return value ? "True" : "False";
        if (Array.isArray(value)) return value.join(', ');
        if (typeof value === 'object') {
          return Object.entries(value).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`).join('; ');
        }
        return String(value);
      }
      return JSON.stringify(answer, null, 2);
    }
    return String(answer);
  };
  return (
    <div className="p-4 border rounded-md bg-background space-y-2 break-inside-avoid">
      <div className="flex justify-between items-start">
        <h4 className="font-semibold flex-1 pr-4">{`${index + 1}. ${getTruncatedPlainText(qResult.prompt)}`}</h4>
        {qResult.isCorrect ? (<span className="text-green-600 font-medium flex-shrink-0 flex items-center"><CheckCircle className="mr-1 h-4 w-4" /> {t('practiceFlow.results.passed', 'Passed')}</span>) : (<span className="text-destructive font-medium flex-shrink-0 flex items-center"><XCircle className="mr-1 h-4 w-4" /> {t('practiceFlow.results.failed', 'Failed')}</span>)}
      </div>
      <p className="text-sm"><span className="font-medium">{t('practiceFlow.results.yourAnswer', 'Your Answer:')}</span> {getAnswerDisplay(qResult.userAnswer)}</p>
      {!qResult.isCorrect && <p className="text-sm"><span className="font-medium">{t('practiceFlow.results.correctAnswer', 'Correct Answer:')}</span> {getAnswerDisplay(qResult.correctAnswer)}</p>}
      <p className="text-xs text-muted-foreground"><span className="font-medium">{t('practiceFlow.results.pointsEarned', 'Points Earned:')}</span> {qResult.pointsEarned.toFixed(1)}</p>
      {qResult.explanation && (<div className="mt-2 pt-2 border-t"><h5 className="text-sm font-semibold mb-1">{t('practiceFlow.results.explanationTitle', 'Explanation')}</h5><MarkdownRenderer content={qResult.explanation} className="text-sm text-muted-foreground" /></div>)}
    </div>
  );
};


// --- MAIN COMPONENT ---
export const QuizResult: React.FC<QuizResultProps> = ({ result, quizTitle, onExitQuiz, onGenerateReview, showReviewButton = false, isReviewLoading = false }) => {
  const { t } = useTranslation();

  const hasLearningObjectivePerformance = result.performanceByLearningObjective && result.performanceByLearningObjective.length > 0;
  const hasDifficultyPerformance = result.performanceByDifficulty && result.performanceByDifficulty.length > 0;
  const analyticsCardCount = (hasLearningObjectivePerformance ? 1 : 0) + (hasDifficultyPerformance ? 1 : 0);

  const studentName = toPascalCase(result.studentName);
  const completionTime = formatTimestamp(result.completionTimestamp);
  const quizResultCardId = `quiz-result-card-${result.completionTimestamp || Date.now()}`;

  const handlePrint = () => {
    const printContents = document.getElementById(quizResultCardId);
    if (!printContents) return;

    // Get the original body content
    const originalContents = document.body.innerHTML;

    // Replace body with only the printable content
    document.body.innerHTML = printContents.outerHTML;

    // Add a class to the body to trigger print styles
    document.body.classList.add('printing-active');

    window.print();

    // Restore original content
    document.body.innerHTML = originalContents;
    document.body.classList.remove('printing-active');

    // Re-trigger any scripts if needed, though for this dialog it's generally not necessary.
    // If you had complex event listeners outside React, you might need to re-attach them here.
  };

  const sortedGroupedResults = useMemo(() => {
    const groups = new Map<string, QuestionResultItem[]>();
    const OTHER_QUESTIONS_KEY = t('practiceFlow.results.otherQuestionsGroup', "Other Questions");
    result.questionResults.forEach(qResult => {
      let wasGrouped = false;
      const loCodes = qResult.meta?.learningObjectiveCodes;
      if (loCodes && loCodes.length > 0) {
        loCodes.forEach(code => {
          const groupKey = `${t('practiceFlow.results.loGroupPrefix', 'Objective')}: ${code}`;
          if (!groups.has(groupKey)) groups.set(groupKey, []);
          groups.get(groupKey)!.push(qResult);
        });
        wasGrouped = true;
      }
      if (!wasGrouped && qResult.meta?.bloomLevelCode) {
        const groupKey = `${t('practiceFlow.results.bloomGroupPrefix', 'Bloom Level')}: ${qResult.meta.bloomLevelCode}`;
        if (!groups.has(groupKey)) groups.set(groupKey, []);
        groups.get(groupKey)!.push(qResult);
        wasGrouped = true;
      }
      if (!wasGrouped && qResult.difficultyCode) {
        const groupKey = `${t('practiceFlow.results.difficultyGroupPrefix', 'Difficulty')}: ${qResult.difficultyCode.replace(/_/g, ' ')}`;
        if (!groups.has(groupKey)) groups.set(groupKey, []);
        groups.get(groupKey)!.push(qResult);
        wasGrouped = true;
      }
      if (!wasGrouped) {
        if (!groups.has(OTHER_QUESTIONS_KEY)) groups.set(OTHER_QUESTIONS_KEY, []);
        groups.get(OTHER_QUESTIONS_KEY)!.push(qResult);
      }
    });
    const groupTypeOrder = { 
      [t('practiceFlow.results.loGroupPrefix', 'Objective')]: 1, 
      [t('practiceFlow.results.bloomGroupPrefix', 'Bloom Level')]: 2, 
      [t('practiceFlow.results.difficultyGroupPrefix', 'Difficulty')]: 3 
    };
    return Array.from(groups.entries()).sort(([keyA], [keyB]) => {
      const typeA = Object.keys(groupTypeOrder).find(p => keyA.startsWith(p)) as keyof typeof groupTypeOrder | undefined;
      const typeB = Object.keys(groupTypeOrder).find(p => keyB.startsWith(p)) as keyof typeof groupTypeOrder | undefined;
      const orderA = typeA ? groupTypeOrder[typeA] : 4;
      const orderB = typeB ? groupTypeOrder[typeB] : 4;
      if (orderA !== orderB) return orderA - orderB;
      return keyA.localeCompare(keyB);
    });
  }, [result.questionResults, t]);

  // If there's only one group, open it by default
  const defaultOpenAccordion = sortedGroupedResults.length > 0 ? [sortedGroupedResults[0][0]] : [];

  // If we decide to open ALL accordions for printing, this is where the keys would be generated
  const allAccordionKeys = sortedGroupedResults.map(([groupKey]) => groupKey);


  return (
    <>
      <style>{`
        @media print {
          /* Hide scrollbars specifically for printing */
          .print-scroll-area > div {
             overflow-y: visible !important;
          }
          .print-scroll-area {
            height: auto !important;
            max-height: none !important;
          }
          /* This class is added to the body during the print process */
          .printing-active {
            padding: 2rem;
            background-color: white;
          }
          .printing-active .quiz-result-print-area {
            border: none !important;
            box-shadow: none !important;
            max-width: 100% !important;
          }
          .printing-active [data-state="closed"] > div:last-child {
            display: grid !important;
            overflow: visible !important;
          }
           .printing-active [data-state="closed"] > div:first-child > svg {
            transform: rotate(180deg) !important;
          }
        }
      `}</style>
      <Card id={quizResultCardId} className="w-full max-w-3xl mx-auto shadow-xl quiz-result-print-area">
        <CardHeader className="relative">
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 no-print" onClick={handlePrint} aria-label="Print results">
            <Printer className="h-5 w-5" />
          </Button>
          <CardTitle className="text-3xl font-headline text-center pr-12">{t('practiceFlow.results.title', 'Quiz Results: {{quizTitle}}', { quizTitle })}</CardTitle>
          <CardDescription className="text-center text-lg">
            {studentName 
              ? t('practiceFlow.results.greeting', "Here are your results, {{name}}!", { name: studentName })
              : t('practiceFlow.results.greetingGeneric', "Here are your results!")
            }
          </CardDescription>
          {completionTime && <p className="text-center text-xs text-muted-foreground mt-1">{t('practiceFlow.results.completionTime', 'Completed on: {{time}}', { time: completionTime })}</p>}
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-secondary/50">
            <CardHeader><CardTitle className="text-xl flex items-center"><BarChart2 className="mr-2 h-5 w-5 text-primary" />{t('practiceFlow.results.overallScore', 'Overall Score')}</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div><p className="text-3xl font-bold text-primary">{result.score.toFixed(1)} / {result.maxScore.toFixed(1)}</p><p className="text-sm text-muted-foreground">{t('practiceFlow.results.points', 'Points')}</p></div>
              <div><p className="text-3xl font-bold text-primary">{result.percentage.toFixed(2)}%</p><p className="text-sm text-muted-foreground">{t('practiceFlow.results.percentage', 'Percentage')}</p></div>
              <div>{result.passed !== undefined && (result.passed ? (<div className="flex flex-col items-center text-green-600"><CheckCircle className="h-10 w-10" /><p className="text-xl font-semibold mt-1">{t('practiceFlow.results.passed', 'Passed')}</p></div>) : (<div className="flex flex-col items-center text-destructive"><XCircle className="h-10 w-10" /><p className="text-xl font-semibold mt-1">{t('practiceFlow.results.failed', 'Failed')}</p></div>))}</div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-md"><Clock className="h-5 w-5 text-primary" /><span>{t('practiceFlow.results.timeSpent', 'Total time spent:')}</span><span className="font-semibold">{result.totalTimeSpentSeconds?.toFixed(0) ?? 'N/A'} {t('practiceFlow.results.timeUnit', 'seconds')}</span></div>
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-md"><Percent className="h-5 w-5 text-primary" /><span>{t('practiceFlow.results.avgTimePerQuestion', 'Average time per question:')}</span><span className="font-semibold">{result.averageTimePerQuestionSeconds?.toFixed(1) ?? 'N/A'} {t('practiceFlow.results.timeUnit', 'seconds')}</span></div>
          </div>

          <div className={cn("grid grid-cols-1 gap-6", analyticsCardCount > 1 && "lg:grid-cols-2")}>
            {hasDifficultyPerformance && (<Card><CardHeader><CardTitle className="text-xl flex items-center"><Star className="mr-2 h-5 w-5 text-primary" />{t('practiceFlow.results.performanceByDifficulty', 'By Difficulty')}</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>{t('practiceFlow.results.tableHeaders.level', 'Level')}</TableHead><TableHead className="text-center">{t('practiceFlow.results.tableHeaders.correctTotal', 'Correct/Total')}</TableHead><TableHead className="text-right">{t('practiceFlow.results.tableHeaders.percentage', 'Percentage')}</TableHead></TableRow></TableHeader><TableBody>{result.performanceByDifficulty!.map(diff => (<TableRow key={diff.difficultyCode}><TableCell className="font-medium uppercase text-xs">{diff.difficultyCode.replace(/_/g, ' ')}</TableCell><TableCell className="text-center">{diff.correctQuestions}/{diff.totalQuestions}</TableCell><TableCell className="text-right font-semibold">{diff.percentage.toFixed(2)}%</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>)}
            {hasLearningObjectivePerformance && (<Card><CardHeader><CardTitle className="text-xl flex items-center"><BookOpen className="mr-2 h-5 w-5 text-primary" />{t('practiceFlow.results.performanceByLO', 'By Learning Objective')}</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>{t('practiceFlow.results.tableHeaders.objective', 'Objective')}</TableHead><TableHead className="text-center">{t('practiceFlow.results.tableHeaders.correctTotal', 'Correct/Total')}</TableHead><TableHead className="text-right">{t('practiceFlow.results.tableHeaders.percentage', 'Percentage')}</TableHead></TableRow></TableHeader><TableBody>{result.performanceByLearningObjective!.map(lo => (<TableRow key={lo.learningObjective}><TableCell className="font-medium text-xs">{lo.learningObjective}</TableCell><TableCell className="text-center">{lo.correctQuestions}/{lo.totalQuestions}</TableCell><TableCell className="text-right font-semibold">{lo.percentage.toFixed(2)}%</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>)}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">{t('practiceFlow.results.questionBreakdown', 'Detailed Question Breakdown')}</h3>
            <Accordion type="multiple" defaultValue={defaultOpenAccordion} className="w-full">
              {sortedGroupedResults.map(([groupKey, qResults]) => (
                <AccordionItem value={groupKey} key={groupKey}>
                  <AccordionTrigger><span className="text-left font-semibold">{groupKey}</span></AccordionTrigger>
                  <AccordionContent>
                    <ScrollArea className="h-[400px] pr-4 print-scroll-area">
                      <ul className="space-y-4">{qResults.map((qResult) => (<li key={qResult.questionId}><QuestionResultDetail qResult={qResult} index={result.questionResults.findIndex(qr => qr.questionId === qResult.questionId)} /></li>))}</ul>
                    </ScrollArea>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 no-print">
          {onExitQuiz && (<Button variant="outline" onClick={onExitQuiz} className="w-full sm:w-auto"><LogOut className="mr-2 h-4 w-4" />{t('common.exit', 'Exit')}</Button>)}
          {showReviewButton && onGenerateReview && (<Button onClick={onGenerateReview} disabled={isReviewLoading} className="w-full sm:w-auto">{isReviewLoading ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<Wand2 className="mr-2 h-4 w-4" />)}{isReviewLoading ? t('practiceFlow.results.generatingReview', 'Generating Review...') : t('practiceFlow.results.generateReview', 'AI-Powered Review & Remediation')}</Button>)}
        </CardFooter>
      </Card>
    </>
  );
};