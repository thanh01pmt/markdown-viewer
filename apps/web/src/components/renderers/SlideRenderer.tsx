import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight, Maximize, Minimize, HelpCircle } from 'lucide-react';
import ModernMarkdown from '../ModernMarkdown';

interface SlideRendererProps {
  content: string;
  title?: string;
  className?: string;
}

interface ParsedSlide {
  title: string;
  content: string;
  notes?: string;
}

export default function SlideRenderer({ content, title, className }: SlideRendererProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Strip Marp frontmatter if it exists at the start
  const cleanContent = content.replace(/^---[\s\S]*?---\n/, '');

  // Parse slides separated by ---
  const slides: ParsedSlide[] = cleanContent.split('\n---\n').map((block) => {
    const lines = block.trim().split('\n');
    let slideTitle = '';
    let slideContent = '';
    let notes = '';

    const notesIndex = lines.findIndex(l => l.startsWith('Note:'));
    if (notesIndex !== -1) {
      notes = lines.slice(notesIndex).join('\n').replace('Note:', '').trim();
    }

    const contentLines = notesIndex !== -1 ? lines.slice(0, notesIndex) : lines;
    
    if (contentLines[0]?.startsWith('#')) {
      slideTitle = contentLines[0].replace(/^#+\s*/, '');
      slideContent = contentLines.slice(1).join('\n').trim();
    } else {
      slideContent = contentLines.join('\n').trim();
    }

    return { title: slideTitle, content: slideContent, notes };
  });

  const totalSlides = slides.length;

  const next = useCallback(() => setCurrentSlide(s => Math.min(s + 1, totalSlides - 1)), [totalSlides]);
  const prev = useCallback(() => setCurrentSlide(s => Math.max(s - 1, 0)), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'f') setIsFullscreen(f => !f);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev]);

  return (
    <div className={cn(
      "relative bg-slate-950 flex flex-col items-center justify-center transition-all duration-500",
      isFullscreen ? "fixed inset-0 z-[100]" : "h-full w-full",
      className
    )}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-5xl px-12 py-16 flex flex-col items-center text-center"
        >
          {slides[currentSlide]?.title && (
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-8 tracking-tight max-w-4xl mx-auto">
              {slides[currentSlide].title}
            </h2>
          )}
          <div className="text-left w-full mx-auto">
            <ModernMarkdown content={slides[currentSlide]?.content || ''} />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Layer */}
      <div className="absolute bottom-10 left-0 right-0 px-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <button 
            onClick={prev} 
            disabled={currentSlide === 0}
            className="p-3 rounded-full bg-slate-800/50 text-white disabled:opacity-30 hover:bg-slate-700 transition-all border border-slate-700/50 backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-slate-500 font-mono text-sm tabular-nums">
            <span className="text-white font-bold">{currentSlide + 1}</span> / {totalSlides}
          </div>
          <button 
            onClick={next} 
            disabled={currentSlide === totalSlides - 1}
            className="p-3 rounded-full bg-slate-800/50 text-white disabled:opacity-30 hover:bg-slate-700 transition-all border border-slate-700/50 backdrop-blur-sm"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
           <button 
            onClick={() => setShowHelp(!showHelp)}
            className="p-3 rounded-full bg-slate-800/50 text-slate-400 hover:text-white transition-all border border-slate-700/50 backdrop-blur-sm"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900">
        <motion.div 
          className="h-full bg-primary-500"
          initial={false}
          animate={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
        />
      </div>
    </div>
  );
}
