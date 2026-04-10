import { Suspense, lazy, useMemo, useEffect } from 'react';
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

function MarpRenderer({ rawContent }) {
  const { html, css, error } = useMemo(() => {
    const content = typeof rawContent === 'string' ? rawContent.trim() : '';
    if (!content) return { html: '', css: '' };
    
    try {
      const marp = new Marp({ html: true });
      const rendered = marp.render(content);
      return {
        html: rendered?.html || '',
        css: rendered?.css || '',
      };
    } catch (e) {
      console.error('Marp render error:', e);
      return { error: e.message, html: '', css: '' };
    }
  }, [rawContent]);

  if (error) {
    return (
      <div className="marp-error">
        <div className="marp-error-icon">⚠️</div>
        <h3>Không thể render slide</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="marp-wrapper">
      <style>{css}</style>
      <div className="marp-slides" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

export function MarkdownRenderer({ content, forcedMode = 'slide' }) {
  const { processedContent, mdMeta, isMarp, rawContent } = useMemo(() => extractMetadata(content), [content]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [content]);

  // Use forcedMode from PreviewPanel, default to doc for non-Marp files
  const effectiveMode = isMarp ? forcedMode : 'doc';

  if (isMarp && effectiveMode === 'slide') {
    return (
      <div className="is-marp-presentation" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <MarpRenderer rawContent={rawContent} />
      </div>
    );
  }

  return (
    <div className={`md-content ${effectiveMode === 'doc' ? 'is-doc' : ''}`}>
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
