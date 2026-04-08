import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import CodeRunner from './renderers/CodeRunner';
import { 
  Menu, X, BookOpen, Share2, Printer, 
  Settings, ChevronRight, Hash, Sparkles, Beaker
} from 'lucide-react';
import '../styles/modern-markdown.css';

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
    const headingLines = content.split('\n').filter(line => line.startsWith('#') && !line.startsWith('## ')); // We can refine this
    // For simplicity, let's match #, ##, ###
    const allHeadings = content.split('\n').filter(line => /^#{1,3}\s/.test(line));
    const generatedHeadings = allHeadings.map((line) => {
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] font-sans selection:bg-primary-500/30">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 w-full bg-white/70 dark:bg-[#0B1121]/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        {/* Premium Scroll Progress */}
        <div 
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(59,130,246,0.8)] z-50" 
          style={{ width: `${scrollProgress}%` }} 
        />
        
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-xl transition-all active:scale-95"
            >
              {isSidebarOpen ? <X className="w-5 h-5 dark:text-slate-300" /> : <Menu className="w-5 h-5 dark:text-slate-300" />}
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl shadow-lg shadow-primary-500/20">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-sm font-bold truncate max-w-[200px] sm:max-w-md text-slate-800 dark:text-slate-100 uppercase tracking-widest opacity-90">
                {title || 'Document Viewer'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all">
              <Printer className="w-4 h-4" />
              Print
            </button>
            <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-2" />
            <button className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-xl transition-all">
              <Settings className="w-5 h-5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex max-w-[1600px] mx-auto">
        {/* Sidebar Nav */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0, marginLeft: -20 }}
              animate={{ width: 320, opacity: 1, marginLeft: 0 }}
              exit={{ width: 0, opacity: 0, marginLeft: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="hidden lg:block sticky top-16 h-[calc(100vh-64px)] overflow-y-auto border-r border-slate-200/50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-[#0B1121]/30 backdrop-blur-md"
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-8 px-2">
                  <Hash className="w-4 h-4 text-primary-500" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Contents</span>
                </div>
                <nav className="space-y-1">
                  {headings.map((h, i) => (
                    <a
                      key={i}
                      href={`#${h.id}`}
                      className={cn(
                        "group flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm transition-all duration-200 border border-transparent",
                        h.level === 1 ? "font-bold text-slate-900 dark:text-slate-200 mt-4 mb-2 hover:bg-white dark:hover:bg-slate-800/60 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/40 hover:text-primary-600 dark:hover:text-primary-400",
                        h.level === 2 && "pl-5",
                        h.level >= 3 && "pl-9 text-xs"
                      )}
                    >
                      <ChevronRight className={cn(
                        "w-3 h-3 transition-all",
                        h.level === 1 ? "text-primary-500" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
                      )} />
                      <span className="truncate">{h.text}</span>
                    </a>
                  ))}
                </nav>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <article className="modern-markdown max-w-[720px] mx-auto px-6 py-12 md:py-24 sm:px-12 md:px-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => {
                  const id = children?.toString().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                  return (
                    <h1 id={id} className="relative text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-12 tracking-tight leading-tight group">
                      <span className="bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 bg-clip-text text-transparent">
                        {children}
                      </span>
                    </h1>
                  );
                },
                h2: ({ children }) => {
                  const id = children?.toString().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                  return (
                    <h2 id={id} className="flex items-center gap-3 text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mt-20 mb-8 tracking-tight pb-6 border-b border-slate-200 dark:border-slate-800">
                      {children}
                    </h2>
                  );
                },
                h3: ({ children }) => {
                  const id = children?.toString().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                  return <h3 id={id} className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-12 mb-6 tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary-500 opacity-70" />
                    {children}
                  </h3>;
                },
                p: ({ children }) => <p className="text-[1.125rem] md:text-lg text-slate-600 dark:text-slate-300 leading-[1.8] mb-8 font-medium">{children}</p>,
                ul: ({ children }) => <ul className="list-none space-y-4 mb-10 ml-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal space-y-4 mb-10 ml-6 text-lg text-slate-600 dark:text-slate-300 marker:text-primary-500 marker:font-bold">{children}</ol>,
                li: ({ children }) => (
                  <li className="flex gap-4 text-[1.125rem] md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium group">
                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary-500/50 group-hover:bg-primary-500 group-hover:scale-125 transition-all mt-2.5 duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    <span>{children}</span>
                  </li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="relative border-l-4 border-indigo-500 bg-white dark:bg-[#111827] shadow-xl shadow-slate-200/20 dark:shadow-none p-8 rounded-2xl rounded-l-none my-12 italic text-slate-700 dark:text-slate-300 text-xl font-serif">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="my-12 overflow-x-auto shadow-2xl shadow-slate-200/40 dark:shadow-none ring-1 ring-slate-200 dark:ring-slate-800 rounded-2xl bg-white dark:bg-[#111827]">
                    <table className="w-full text-left border-collapse min-w-[600px]">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">{children}</thead>,
                th: ({ children }) => <th className="p-5 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{children}</th>,
                td: ({ children }) => <td className="p-5 text-[1.05rem] border-b last:border-b-0 border-slate-100 dark:border-slate-800/50 text-slate-600 dark:text-slate-300">{children}</td>,
                hr: () => <hr className="my-20 border-slate-200 dark:border-slate-800/60" />,
                code: ({ node, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  const value = String(children).replace(/\n$/, '');
                  
                  if (!match) {
                    // Inline code
                    return <code className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-primary-700 dark:text-primary-300 font-mono text-sm shadow-sm">{children}</code>;
                  }
                  
                  // Wrap CodeRunner in a gorgeous container
                  return (
                    <div className="my-10 shadow-2xl dark:shadow-none ring-1 ring-slate-200 dark:ring-slate-800 rounded-2xl overflow-hidden bg-[#0d1117] transition-all hover:shadow-primary-500/10">
                      <div className="flex items-center px-4 py-2 bg-slate-900 border-b border-slate-800">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500/80" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                          <div className="w-3 h-3 rounded-full bg-green-500/80" />
                        </div>
                        <span className="ml-4 text-xs font-mono text-slate-500 uppercase tracking-wider">{language}</span>
                      </div>
                      <div className="p-4 overflow-x-auto text-sm leading-relaxed">
                        <CodeRunner language={language} value={value} />
                      </div>
                    </div>
                  );
                }
              }}
            >
              {content}
            </ReactMarkdown>
          </article>

          {/* Footer Nav */}
          <footer className="max-w-4xl mx-auto px-6 py-20 mt-10 border-t border-slate-200/50 dark:border-slate-800/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-inner">
                  <Beaker className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">Pathway AIoT</div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Interactive Learning Experience</div>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="group relative px-8 py-3 rounded-xl bg-slate-900 dark:bg-white overflow-hidden shadow-xl hover:shadow-2xl transition-all">
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative text-white dark:text-slate-900 font-bold group-hover:text-white transition-colors">
                    Continue to Next Lesson →
                  </span>
                </button>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
