import React, { useState } from 'react';
import ModernMarkdown from './components/ModernMarkdown';
import { 
  FileText, Plus, Search, Layers, 
  Clock, Star, ExternalLink, Zap
} from 'lucide-react';
import { cn } from './lib/utils';

const SAMPLES = [
  {
    id: 'intro',
    title: 'Welcome to Markdown Viewer',
    excerpt: 'Explore the capabilities of this modern markdown experience.',
    content: `# Welcome to Modern Markdown
This is a premium viewing experience designed for interactivity.

## Interactive Slides
Below is a slide deck rendered directly from markdown.

\`\`\`slides-md
# Slide 1: Welcome
- Explore interactive slides
- Move with arrows or click

---

# Slide 2: Multi-purpose
- Reusable components
- Premium design
\`\`\`

## Quick Quizzes
Test your knowledge with integrated quizzes.

\`\`\`quiz-md
### Item 1
- **ID:** intro-quiz-1
- **Type:** MCQ
- **Question:** What is the primary benefit of this tool?
- **Options:**
  - Simple text viewing
  - Interactive learning components
  - Static HTML output
- **Correct Answer:** Interactive learning components
- **Explanation:** This tool transforms static markdown into dynamic, interactive experiences like slides and quizzes.
\`\`\`

## Hands-on Activities
Follow step-by-step guides with progress tracking.

\`\`\`activity-md
### Activity 1
- **Title:** Try the sidebar
- **Type:** project
- **Duration:** 2
- **Instructions:** Check the left sidebar for navigation.
- Steps:
  - **Step:** 1
  - **Instruction:** Click the menu button in the header.
  - **Hint:** It's in the top-left corner.
  - **Step:** 2
  - **Instruction:** Navigate through the headings.
\`\`\`
`
  },
  {
    id: 'features',
    title: 'Advanced Features Guide',
    excerpt: 'A deep dive into advanced typography and layouts.',
    content: '# Advanced Features\n\nCheckout the layouts and tables...'
  }
];

export default function App() {
  const [activeDoc, setActiveDoc] = useState<typeof SAMPLES[0] | null>(null);
  const [search, setSearch] = useState('');

  if (activeDoc) {
    return (
      <>
        <button 
          onClick={() => setActiveDoc(null)}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900/10 hover:bg-slate-900/20 backdrop-blur-md rounded-full text-xs font-bold transition-all"
        >
          Close Document
        </button>
        <ModernMarkdown content={activeDoc.content} title={activeDoc.title} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-20">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.05),transparent)] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

      <div className="max-w-[1400px] mx-auto px-6 pt-20">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3 fill-current" />
              v1.0.0 Stable
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none bg-gradient-to-b from-slate-950 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
              Markdown<br />Redefined.
            </h1>
            <p className="text-xl text-slate-500 max-w-xl">
              A premium, interactive environment for viewing and interacting with markdown-based education content.
            </p>
          </div>
          <button className="flex items-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-bold shadow-2xl shadow-primary-900/20 transition-all hover:scale-105 active:scale-95">
            <Plus className="w-5 h-5" />
            New Document
          </button>
        </div>

        {/* Dashboard Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Your Documents</h2>
                <div className="h-px w-12 bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Filter local files..."
                  className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {SAMPLES.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setActiveDoc(doc)}
                  className="group relative flex flex-col text-left p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-900/5"
                >
                  <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl w-fit group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1">
                    {doc.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Clock className="w-3 h-3" />
                      2 mins ago
                    </div>
                    <Star className="w-4 h-4 text-slate-300 group-hover:text-yellow-500 transition-colors" />
                  </div>
                </button>
              ))}

              <button className="flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl hover:border-primary-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all group">
                <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-primary-600" />
                </div>
                <span className="mt-4 text-sm font-bold text-slate-500">Add to Workspace</span>
              </button>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Library Insights</h2>
            
            <div className="p-6 bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl text-white space-y-4 shadow-xl shadow-primary-900/20">
              <Layers className="w-8 h-8" />
              <div>
                <h4 className="text-xl font-bold">Document Stats</h4>
                <p className="text-primary-100 text-sm opacity-80">Overview of your learning assets.</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  <div className="text-2xl font-black">12</div>
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">Modules</div>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  <div className="text-2xl font-black">48</div>
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">Quizzes</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
              <h4 className="font-bold mb-4">Quick Links</h4>
              <div className="space-y-3">
                {['Documentation', 'Community Scripts', 'UI Kit Highlights'].map(item => (
                  <a key={item} href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 group transition-all">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-primary-600">{item}</span>
                    <ExternalLink className="w-4 h-4 text-slate-300" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
