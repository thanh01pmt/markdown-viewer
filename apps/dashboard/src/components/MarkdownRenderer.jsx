import { Suspense, lazy, useMemo, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { Marp } from '@marp-team/marp-core';
import { extractMetadata } from '../utils/markdown';

// Lazy-load the heavy syntax highlighter
const SyntaxHighlighter = lazy(() =>
  import('react-syntax-highlighter').then(m => ({ default: m.Prism }))
);
const oneDarkPromise = import('react-syntax-highlighter/dist/esm/styles/prism').then(m => m.oneDark);

// Polyfill process for Marp core internals
if (typeof window !== 'undefined' && !window.process) {
  window.process = { env: {} };
}

let oneDarkStyle = null;
oneDarkPromise.then(s => { oneDarkStyle = s; });

function CodeBlock({ language, children }) {
  return (
    <Suspense fallback={<pre className="code-fallback"><code>{children}</code></pre>}>
      <SyntaxHighlighter
        style={oneDarkStyle || {}}
        language={language}
        PreTag="div"
        customStyle={{ borderRadius: '8px', fontSize: '12px', margin: '12px 0' }}
      >
        {children}
      </SyntaxHighlighter>
    </Suspense>
  );
}


// SVG link icon as hast node (invisible by default, shown on hover via CSS)
const anchorIcon = {
  type: 'element',
  tagName: 'span',
  properties: { className: ['anchor-icon'], ariaHidden: 'true' },
  children: [{ type: 'text', value: '#' }],
};

function MarpRenderer({ rawContent, onToggleMode }) {
  const [useDirect, setUseDirect] = useState(false);
  
  const { html, css, error, stack, stats } = useMemo(() => {
    const content = typeof rawContent === 'string' ? rawContent.trim() : '';
    if (!content) return { html: '', css: '', stats: { htmlLen: 0, cssLen: 0 } };
    
    try {
      const marp = new Marp({ html: true });
      const rendered = marp.render(content);
      
      const res = {
        html: rendered?.html || '',
        css: rendered?.css || '',
        stats: {
          htmlLen: (rendered?.html || '').length,
          cssLen: (rendered?.css || '').length
        }
      };
      
      console.log('Marp Diagnostics:', res.stats);
      return res;
    } catch (e) {
      console.error('Marp Diagnostics Error:', e);
      return { 
        error: e.message,
        stack: e.stack,
        html: ``, 
        css: '',
        stats: { htmlLen: 0, cssLen: 0 }
      };
    }
  }, [rawContent]);

  if (error) {
    return (
      <div className="p-8 border border-red-500/30 bg-red-500/5 rounded-xl font-sans">
        <h3 className="text-xl font-bold text-red-500 mb-2">Presentation Engine Error</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button 
          onClick={onToggleMode}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors"
        >
          View as Standard Document
        </button>
        <div className="mt-6 bg-black/40 p-4 rounded-lg font-mono text-[10px] overflow-auto max-h-60 border border-white/10 text-gray-500">
          <pre>{stack}</pre>
        </div>
      </div>
    );
  }

  const iframeSrcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { 
            margin: 0; 
            padding: 40px 20px; 
            background: #0f1117; 
            display: flex; 
            flex-direction: column;
            align-items: center; 
            min-height: 100vh;
            color: white;
          }
          ${css}
          .marp-core { width: 100%; max-width: 960px; }
          section { 
            box-shadow: 0 20px 50px rgba(0,0,0,0.5); 
            border-radius: 12px; 
            overflow: hidden; 
            margin-bottom: 50px !important;
            flex-shrink: 0;
            background: white; /* Fallback for white slides */
            color: black;
          }
          section:last-child { margin-bottom: 0 !important; }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: #0f1117; }
          ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: #444; }
        </style>
      </head>
      <body>
        ${html || '<div style="padding: 20px; color: red;">No HTML content generated.</div>'}
      </body>
    </html>
  `;

  return (
    <div className="flex flex-col h-full bg-[#0f1117] rounded-xl overflow-hidden border border-white/5 font-sans">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider font-sans">Presentation View</span>
          </div>
          <div className="text-[9px] text-gray-500">
            HTML: {stats.htmlLen}B | CSS: {stats.cssLen}B
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setUseDirect(!useDirect)}
            className={`text-[9px] px-2 py-0.5 rounded border ${useDirect ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'}`}
          >
            {useDirect ? 'Direct Mode' : 'Iframe Mode'}
          </button>
          <button 
            onClick={onToggleMode}
            className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-gray-400 hover:text-white transition-all font-sans"
          >
            View as Document
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-[600px] relative overflow-auto">
        {useDirect ? (
          <div className="p-8 flex flex-col items-center">
            <style>{css}</style>
            <div className="w-full max-w-[960px] marp-direct" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        ) : (
          <iframe
            title="Marp Slide"
            srcDoc={iframeSrcDoc}
            className="w-full h-full border-none absolute inset-0"
          />
        )}
      </div>
    </div>
  );
}

export function MarkdownRenderer({ content }) {
  const [viewMode, setViewMode] = useState('auto'); // 'auto', 'slide', 'doc'
  const { processedContent, mdMeta, isMarp, rawContent } = useMemo(() => extractMetadata(content), [content]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [content]);

  const effectiveMode = viewMode === 'auto' ? (isMarp ? 'slide' : 'doc') : viewMode;

  if (effectiveMode === 'slide') {
    return <MarpRenderer rawContent={rawContent} onToggleMode={() => setViewMode('doc')} />;
  }

  return (
    <div className="md-content">
      {mdMeta.length > 0 && (
        <div className="md-meta-badges">
          {mdMeta.map((meta, i) => (
            <div key={i} className={`md-meta-badge ${meta.isPrimary ? 'sme-mandate' : ''}`}>
              <span className="md-meta-label">{meta.label}</span>
              {meta.value && <span className="md-meta-value">{meta.value}</span>}
            </div>
          ))}
        </div>
      )}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, {
            behavior: 'prepend',
            properties: { className: ['anchor-link'], ariaHidden: 'true', tabIndex: -1 },
            content: anchorIcon,
          }]
        ]}
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const code = String(children).replace(/\n$/, '');
            if (!inline && match) {
              return <CodeBlock language={match[1]}>{code}</CodeBlock>;
            }
            return <code className="inline-code" {...props}>{children}</code>;
          },
          table({ children }) {
            return <div className="md-table-wrap"><table>{children}</table></div>;
          },
          blockquote({ children }) {
            return <blockquote className="md-blockquote">{children}</blockquote>;
          },
          a({ href, children }) {
            return <a href={href} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', textDecoration: 'none' }}>{children}</a>;
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
