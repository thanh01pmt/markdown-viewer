import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Play, RotateCcw, Copy, Check, Terminal } from 'lucide-react';
import SlideRenderer from './SlideRenderer';
import QuizRenderer from './QuizRenderer';
import ActivityRenderer from './ActivityRenderer';

interface CodeRunnerProps {
  language: string;
  value: string;
}

export default function CodeRunner({ language, value }: CodeRunnerProps) {
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Special Renders
  if (language === 'slides-md') return <SlideRenderer content={value} className="rounded-2xl overflow-hidden shadow-2xl" />;
  if (language === 'quiz-md') return <QuizRenderer content={value} className="p-8 bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 shadow-xl" />;
  if (language === 'activity-md') return <ActivityRenderer content={value} className="p-2" />;

  // Standard Code Runner
  const handleRun = () => {
    setIsRunning(true);
    // Simulate execution
    setTimeout(() => {
      if (language === 'javascript' || language === 'js') {
        try {
          // In a real app, this would be a safe sandbox or backend call
          setOutput(`Execution successful.\nOutput: [Simulated result of your code]`);
        } catch (e) {
          setOutput(`Error: ${e instanceof Error ? e.message : String(e)}`);
        }
      } else {
        setOutput(`Language "${language}" execution is simulated in this preview.`);
      }
      setIsRunning(false);
    }, 800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="group relative my-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-2xl transition-all">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button 
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-3 py-1 bg-primary-600 hover:bg-primary-500 text-white rounded-md text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
          >
            {isRunning ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-3 h-3 fill-current" />
            )}
            Run
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="p-1">
        <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto selection:bg-primary-500/30">
          <code>{value}</code>
        </pre>
      </div>

      {/* Output Console */}
      {output && (
        <div className="border-t border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Output</span>
            <button 
                onClick={() => setOutput(null)}
                className="text-slate-500 hover:text-white"
            >
                <RotateCcw className="w-3 h-3" />
            </button>
          </div>
          <pre className="text-sm font-mono text-primary-400 whitespace-pre-wrap">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
