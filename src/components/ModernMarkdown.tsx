import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import CodeRunner from './renderers/CodeRunner';
import { 
  Menu, X, BookOpen, Share2, Printer, 
  Settings, ChevronRight, Hash
} from 'lucide-react';

interface ModernMarkdownProps {
  content: string;
  title?: string;
}

export default function ModernMarkdown({ content, title }: ModernMarkdownProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Generate Table of Contents
    const headingLines = content.split('\n').filter(line => line.startsWith('#'));
    const generatedHeadings = headingLines.map((line, idx) => {
      const level = line.match(/^#+/)?.[0].length || 1;
      const text = line.replace(/^#+\s+/, '');
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      return { id, text, level };
    });
    setHeadings(generatedHeadings);

    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const current = window.scrollY;
      setScrollProgress((current / total) * 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [content]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-primary-500/20">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="absolute bottom-0 left-0 h-1 bg-primary-600 transition-all duration-300 ease-out" style={{ width: `${scrollProgress}%` }} />
        
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary-600 rounded-lg">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-sm font-bold truncate max-w-[200px] sm:max-w-md bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                {title || 'Document Viewer'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all">
              <Printer className="w-4 h-4" />
              Print
            </button>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-2" />
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
              <Settings className="w-5 h-5 text-slate-400 hover:text-slate-900 dark:hover:text-white" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Nav */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="hidden lg:block sticky top-16 h-[calc(110vh-64px)] overflow-y-auto border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50"
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-6 px-2">
                  <Hash className="w-4 h-4 text-primary-600" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Contents</span>
                </div>
                <nav className="space-y-1">
                  {headings.map((h, i) => (
                    <a
                      key={i}
                      href={`#${h.id}`}
                      className={cn(
                        "group flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-all",
                        h.level === 1 ? "font-bold text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:text-primary-600",
                        h.level === 2 && "pl-6",
                        h.level >= 3 && "pl-9"
                      )}
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <article className="max-w-4xl mx-auto px-6 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => {
                  const id = children?.toString().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                  return (
                    <h1 id={id} className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tight leading-tight">
                      {children}
                    </h1>
                  );
                },
                h2: ({ children }) => {
                  const id = children?.toString().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                  return (
                    <h2 id={id} className="text-3xl font-bold text-slate-900 dark:text-white mt-16 mb-6 tracking-tight border-b dark:border-slate-800 pb-4">
                      {children}
                    </h2>
                  );
                },
                h3: ({ children }) => {
                  const id = children?.toString().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                  return <h3 id={id} className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-12 mb-4 tracking-tight">{children}</h3>;
                },
                p: ({ children }) => <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">{children}</p>,
                ul: ({ children }) => <ul className="list-none space-y-3 mb-8 ml-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-none space-y-3 mb-8 ml-2">{children}</ol>,
                li: ({ children }) => (
                  <li className="flex gap-3 text-lg text-slate-600 dark:text-slate-400">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary-600 mt-3" />
                    <span>{children}</span>
                  </li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary-500 bg-primary-50/50 dark:bg-primary-900/10 p-6 rounded-r-2xl my-8 italic text-slate-700 dark:text-slate-300 text-lg">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="my-10 overflow-hidden border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <table className="w-full text-left border-collapse">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-slate-50 dark:bg-slate-900">{children}</thead>,
                th: ({ children }) => <th className="p-4 text-sm font-bold uppercase tracking-widest text-slate-500">{children}</th>,
                td: ({ children }) => <td className="p-4 text-base border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{children}</td>,
                hr: () => <hr className="my-16 border-slate-200 dark:border-slate-800" />,
                code: ({ node, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  const value = String(children).replace(/\n$/, '');
                  
                  // Use CodeRunner for all code blocks
                  return <CodeRunner language={language} value={value} />;
                }
              }}
            >
              {content}
            </ReactMarkdown>
          </article>

          {/* Footer Nav */}
          <footer className="max-w-4xl mx-auto px-6 py-20 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-6">
                <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl">
                  <BookOpen className="w-6 h-6 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Built with Modern Markdown</div>
                  <div className="text-xs text-slate-500">Interactive viewing experience</div>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="px-6 py-2 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold hover:scale-105 transition-all">
                  Next Course
                </button>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
