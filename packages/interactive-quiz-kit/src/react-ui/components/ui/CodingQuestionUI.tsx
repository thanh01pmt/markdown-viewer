'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import type { CodingQuestion, UserAnswerType } from '../../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../elements/card';
import { Button } from '../elements/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../elements/tabs';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { CodeEvaluationService, type EvaluationResult } from '../../../services/CodeEvaluationService';
import { CheckCircle2, XCircle, Loader2, Play, Terminal, Info, ChevronRight, Settings, ExternalLink } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { cn } from '../../../utils/utils';
import { 
  APIKeyService, 
  GEMINI_API_KEY_SERVICE_NAME, 
  JUDGE0_PRIMARY_API_KEY_SERVICE_NAME, 
  JUDGE0_PRIMARY_API_URL_SERVICE_NAME,
  JUDGE0_FALLBACK_API_KEY_SERVICE_NAME,
  JUDGE0_FALLBACK_API_URL_SERVICE_NAME
} from '../../../services/APIKeyService';

interface CodingQuestionUIProps {
  question: CodingQuestion;
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null;
  showCorrectAnswer?: boolean;
  showExecutionSettings?: boolean;
}

const getMonacoLanguage = (lang: string) => {
  switch (lang) {
    case 'cpp': return 'cpp';
    case 'c': return 'cpp';
    case 'javascript': return 'javascript';
    case 'python': return 'python';
    case 'lua': return 'lua';
    case 'swift': return 'swift';
    case 'csharp': return 'csharp';
    default: return 'plaintext';
  }
};

export const CodingQuestionUI: React.FC<CodingQuestionUIProps> = ({
  question,
  onAnswerChange,
  userAnswer,
  showCorrectAnswer = false,
  showExecutionSettings,
}) => {
  const [code, setCode] = useState<string>('');
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<EvaluationResult[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [keys, setKeys] = useState({
    gemini: '',
    judge0PrimaryUrl: '',
    judge0PrimaryKey: '',
    judge0FallbackUrl: '',
    judge0FallbackKey: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    // Load existing keys
    setKeys({
      gemini: APIKeyService.getAPIKey(GEMINI_API_KEY_SERVICE_NAME) || '',
      judge0PrimaryUrl: APIKeyService.getAPIKey(JUDGE0_PRIMARY_API_URL_SERVICE_NAME) || '',
      judge0PrimaryKey: APIKeyService.getAPIKey(JUDGE0_PRIMARY_API_KEY_SERVICE_NAME) || '',
      judge0FallbackUrl: APIKeyService.getAPIKey(JUDGE0_FALLBACK_API_URL_SERVICE_NAME) || '',
      judge0FallbackKey: APIKeyService.getAPIKey(JUDGE0_FALLBACK_API_KEY_SERVICE_NAME) || ''
    });
  }, []);

  const handleSaveKeys = () => {
    APIKeyService.saveAPIKey(GEMINI_API_KEY_SERVICE_NAME, keys.gemini);
    APIKeyService.saveAPIKey(JUDGE0_PRIMARY_API_URL_SERVICE_NAME, keys.judge0PrimaryUrl);
    APIKeyService.saveAPIKey(JUDGE0_PRIMARY_API_KEY_SERVICE_NAME, keys.judge0PrimaryKey);
    APIKeyService.saveAPIKey(JUDGE0_FALLBACK_API_URL_SERVICE_NAME, keys.judge0FallbackUrl);
    APIKeyService.saveAPIKey(JUDGE0_FALLBACK_API_KEY_SERVICE_NAME, keys.judge0FallbackKey);
    setShowSettings(false);
    toast({
      title: "Settings Saved",
      description: "Execution providers have been updated.",
    });
  };

  useEffect(() => {
    const initialCode = typeof userAnswer === 'string' ? userAnswer : question.functionSignature || '';
    setCode(initialCode);
  }, [question.id, userAnswer, question.functionSignature]);

  const handleCodeChange = (value: string | undefined) => {
    const newValue = value || '';
    setCode(newValue);
    onAnswerChange(newValue);
  };

  const handleRunPublicTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    try {
      const evaluationService = new CodeEvaluationService();
      const results = await evaluationService.evaluatePublicTestCases(question, code);
      setTestResults(results);
    } catch (error) {
      toast({
        title: "Evaluation Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  return (
    <Card className="w-full border-none shadow-none bg-transparent">
      <CardHeader className="p-0 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight mb-2">
              <MarkdownRenderer content={question.prompt} />
            </CardTitle>
            {question.points && (
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                  {question.points} Points
                </span>
                <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium border">
                  {question.codingLanguage.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          { (showExecutionSettings ?? process.env.NEXT_PUBLIC_SHOW_EXECUTION_SETTINGS === 'true') && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowSettings(!showSettings)}
                className="rounded-full border-white/10 hover:bg-white/5"
              >
                <Settings className="w-4 h-4 mr-2" />
                Execution Settings
              </Button>
            </div>
          )}
        </div>
        
        {showSettings && (
          <Card className="mt-4 border-primary/20 bg-primary/5 animate-in slide-in-from-top-2 duration-200">
            <CardContent className="p-4 space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-60">Gemini API Key (interpreted fallback)</label>
                  <input 
                    type="password" 
                    value={keys.gemini}
                    onChange={(e) => setKeys({...keys, gemini: e.target.value})}
                    placeholder="AI fallback key..."
                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-1.5 text-sm focus:border-primary/50 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-60">Judge0 Primary URL (Self-hosted)</label>
                    <input 
                      type="text" 
                      value={keys.judge0PrimaryUrl}
                      onChange={(e) => setKeys({...keys, judge0PrimaryUrl: e.target.value})}
                      placeholder="https://your-server.com"
                      className="w-full bg-black/20 border border-white/10 rounded px-3 py-1.5 text-sm focus:border-primary/50 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-60">Judge0 Primary Key</label>
                    <input 
                      type="password" 
                      value={keys.judge0PrimaryKey}
                      onChange={(e) => setKeys({...keys, judge0PrimaryKey: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded px-3 py-1.5 text-sm focus:border-primary/50 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-60">Judge0 Fallback URL (RapidAPI)</label>
                    <input 
                      type="text" 
                      value={keys.judge0FallbackUrl}
                      onChange={(e) => setKeys({...keys, judge0FallbackUrl: e.target.value})}
                      placeholder="https://judge0-ce.p.rapidapi.com"
                      className="w-full bg-black/20 border border-white/10 rounded px-3 py-1.5 text-sm focus:border-primary/50 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-60">Judge0 Fallback Key</label>
                    <input 
                      type="password" 
                      value={keys.judge0FallbackKey}
                      onChange={(e) => setKeys({...keys, judge0FallbackKey: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded px-3 py-1.5 text-sm focus:border-primary/50 outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button size="sm" onClick={handleSaveKeys}>Apply Changes</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardHeader>

      <CardContent className="p-0 space-y-6">
        {/* Editor Section */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative border border-white/10 rounded-xl overflow-hidden bg-[#1e1e1e] shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                <span className="ml-2 text-xs font-mono text-muted-foreground uppercase tracking-widest opacity-50">
                  solution.{question.codingLanguage}
                </span>
              </div>
            </div>
            <Editor
              height="350px"
              language={getMonacoLanguage(question.codingLanguage)}
              value={code}
              theme="vs-dark"
              onChange={handleCodeChange}
              options={{
                readOnly: showCorrectAnswer,
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
              }}
            />
          </div>
        </div>

        {/* Actions Section */}
        {!showCorrectAnswer && (
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleRunPublicTests} 
              disabled={isRunningTests}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 px-6"
            >
              {isRunningTests ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4 fill-current" />
              )}
              {isRunningTests ? "Evaluating..." : "Run Test Cases"}
            </Button>
            <span className="text-xs text-muted-foreground italic">
              * Verification uses tiered execution (Native {'>'} Lite {'>'} AI)
            </span>
          </div>
        )}

        {/* Results Console */}
        <div className="space-y-3">
          <Tabs defaultValue="console" className="w-full">
            <div className="flex items-center justify-between mb-2">
              <TabsList className="bg-muted/50 p-1 rounded-lg border h-auto">
                <TabsTrigger value="console" className="px-4 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Terminal className="w-3.5 h-3.5 mr-2" />
                  Console
                </TabsTrigger>
                {showCorrectAnswer && (
                  <TabsTrigger value="solution" className="px-4 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    <Info className="w-3.5 h-3.5 mr-2" />
                    Reference Solution
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <TabsContent value="console" className="mt-0 focus-visible:outline-none">
              <div className={cn(
                "rounded-xl border border-border bg-muted/30 dark:bg-black/40 backdrop-blur-md overflow-hidden min-h-[160px] flex flex-col",
                testResults.length > 0 ? "h-auto" : "h-[160px]"
              )}>
                <div className="flex items-center px-4 py-2 border-b border-border bg-muted/50 dark:bg-white/5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Execution Output</span>
                </div>
                
                <div className="p-4 flex-1 font-mono text-sm">
                  {testResults.length > 0 ? (
                    <div className="grid gap-3">
                      {testResults.map((result, index) => (
                        <div key={result.testCaseId} className="group animate-in fade-in slide-in-from-left-2 duration-300">
                          <div className={cn(
                            "flex items-start p-3 rounded-lg border transition-all shadow-sm",
                            result.passed 
                              ? "bg-green-50/50 dark:bg-green-500/5 border-green-500/30 text-green-700 dark:text-green-400" 
                              : "bg-red-50/50 dark:bg-red-500/5 border-red-500/30 text-red-700 dark:text-red-400"
                          )}>
                            <div className="mt-1 mr-3 shrink-0">
                              {result.passed ? (
                                <CheckCircle2 className="h-5 w-5 fill-green-500/20" />
                              ) : (
                                <XCircle className="h-5 w-5 fill-red-500/20" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-sm">Test Case #{index + 1}</span>
                                <span className={cn(
                                  "text-[10px] uppercase font-black px-1.5 py-0.5 rounded tracking-tighter",
                                  result.passed ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
                                )}>
                                  {result.passed ? 'Accepted' : 'Failed'}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 gap-2 opacity-90">
                                <div className="text-xs font-medium leading-relaxed">
                                  <span className="opacity-60 mr-2 font-mono">{'>'}</span>
                                  {result.reasoning}
                                </div>
                                {!result.passed && (
                                  <div className="mt-3 p-3 bg-muted/40 dark:bg-black/40 rounded-lg border border-border text-[11px] overflow-x-auto shadow-inner">
                                    <div className="flex gap-6">
                                      <div>
                                        <div className="text-muted-foreground mb-1 uppercase text-[9px] font-extrabold tracking-widest">Input</div>
                                        <code className="text-foreground/90 font-mono font-bold">{Array.isArray(question.testCases[index].input) ? question.testCases[index].input.join(', ') : question.testCases[index].input}</code>
                                      </div>
                                      <div>
                                        <div className="text-muted-foreground mb-1 uppercase text-[9px] font-extrabold tracking-widest">Expected</div>
                                        <code className="text-green-600 dark:text-green-400 font-mono font-bold">{String(question.testCases[index].expectedOutput)}</code>
                                      </div>
                                      <div>
                                        <div className="text-muted-foreground mb-1 uppercase text-[9px] font-extrabold tracking-widest">Actual</div>
                                        <code className="text-red-600 dark:text-red-400 font-mono font-bold">{String(result.actualOutput)}</code>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 py-8 italic text-xs">
                      <Terminal className="h-8 w-8 mb-3 opacity-20" />
                      <p>{isRunningTests ? "Processing internal execution pipeline..." : "Run tests to see diagnostic output"}</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {showCorrectAnswer && (
              <TabsContent value="solution" className="mt-0 focus-visible:outline-none">
                 <div className="relative border border-white/10 rounded-xl overflow-hidden bg-[#1e1e1e] shadow-2xl">
                    <div className="flex items-center px-4 py-2 bg-[#252526] border-b border-white/5">
                      <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest opacity-50">reference_solution.{question.codingLanguage}</span>
                    </div>
                    <Editor
                      height="300px"
                      language={getMonacoLanguage(question.codingLanguage)}
                      value={question.solutionCode}
                      theme="vs-dark"
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 13,
                        scrollBeyondLastLine: false,
                        padding: { top: 12, bottom: 12 },
                      }}
                    />
                  </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {showCorrectAnswer && question.explanation && (
          <div className="relative p-6 rounded-xl border border-primary/20 bg-primary/5 group transition-all">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-xl opacity-50" />
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-bold uppercase tracking-widest text-primary/80">Conceptual Breakdown</h4>
            </div>
            <MarkdownRenderer content={question.explanation} className="text-sm leading-relaxed text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};