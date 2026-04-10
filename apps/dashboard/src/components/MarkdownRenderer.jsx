import { Suspense, lazy, useMemo, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { Marp } from '@marp-team/marp-core';
import { extractMetadata, getHeadings } from '../utils/markdown';
import { createPortal } from 'react-dom';
import { X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

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

// The anchor icon is no longer used as we wrap the entire heading text in the anchor link.

function MarpRenderer({ rawContent }) {
  const { html, css, error } = useMemo(() => {
    const content = typeof rawContent === 'string' ? rawContent.trim() : '';
    if (!content) return { html: '', css: '' };
    
    try {
      const marp = new Marp({ html: true, container: false });
      
      // Inject custom utility CSS for better split layout support
      // and ensuring our index.css plays nice with Marp's defaults
      const customTheme = `
        /* marp-core default theme overrides */
        section {
          background-color: transparent !important;
        }
        
        /* Ensure split background container takes 50% */
        section[data-marpit-advanced-background="background"] {
          display: flex !important;
          flex-direction: row !important;
        }
        
        section[data-marpit-advanced-background="background"] > .marpit-advanced-background-container {
          flex: 0 0 50% !important;
          z-index: 0;
        }
        
        section[data-marpit-advanced-background="background"] > .marpit-advanced-background-container + * {
          flex: 1 !important;
          z-index: 1;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
        }
      `;
      
      const rendered = marp.render(content, { css: customTheme });
      const marpHeadings = getHeadings(content);
      let processedHtml = rendered?.html || '';

      // Post-process HTML to inject IDs into headings for outline navigation
      if (processedHtml && marpHeadings.length > 0) {
        let headingIndex = 0;
        // More robust regex to find h1, h2, h3 tags and inject id
        processedHtml = processedHtml.replace(/<(h[1-3])(\s+[^>]*)?>([\s\S]*?)<\/h[1-3]>/gi, (match, tag, attrs, text) => {
          if (headingIndex < marpHeadings.length) {
            const h = marpHeadings[headingIndex++];
            let otherAttrs = attrs || '';
            // Strip existing id if present so our injected id takes precedence
            otherAttrs = otherAttrs.replace(/\s+id=["'][^"']*["']/i, '');
            return `<${tag}${otherAttrs} id="${h.id}">${text}</${tag}>`;
          }
          return match;
        });
      }

      return {
        html: processedHtml,
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

function ImageModal({ src, alt, onClose }) {
  useEffect(() => {
    // Prevent scrolling behind modal
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const [scale, setScale] = useState(1);
  const [isMaximized, setIsMaximized] = useState(false);

  return createPortal(
    <div className="img-modal-overlay" onClick={onClose}>
      <div className="img-modal-hdr" onClick={e => e.stopPropagation()}>
        <span className="img-modal-title">{alt || 'Xem ảnh'}</span>
        <div className="img-modal-actions">
          <button className="img-modal-btn" onClick={() => setScale(s => Math.max(0.5, s - 0.2))}>
            <ZoomOut size={16} />
          </button>
          <span className="img-modal-scale">{Math.round(scale * 100)}%</span>
          <button className="img-modal-btn" onClick={() => setScale(s => Math.min(3, s + 0.2))}>
            <ZoomIn size={16} />
          </button>
          <button className={`img-modal-btn ${isMaximized ? 'active' : ''}`} onClick={() => {
            setIsMaximized(!isMaximized);
            setScale(1);
          }}>
            <Maximize2 size={16} />
          </button>
          <div className="img-modal-sep" />
          <button className="img-modal-btn close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
      </div>
      <div className="img-modal-body">
        <div className="img-modal-scroll">
          <img 
            src={src} 
            alt={alt} 
            style={{ 
              transform: `scale(${scale})`,
              maxWidth: isMaximized ? 'none' : '90vw',
              maxHeight: isMaximized ? 'none' : '85vh',
              transition: 'transform 0.2s ease-out, max-width 0.2s, max-height 0.2s',
              cursor: scale > 1 ? 'move' : 'default'
            }}
            onClick={e => e.stopPropagation()} 
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

function MarkdownImage({ src, alt }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="md-img-container">
        <img 
          src={src} 
          alt={alt} 
          onClick={() => setModalOpen(true)}
          title="Click để phóng to"
        />
        {alt && <span className="md-img-caption">{alt}</span>}
      </div>
      {modalOpen && (
        <ImageModal src={src} alt={alt} onClose={() => setModalOpen(false)} />
      )}
    </>
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
            behavior: 'wrap',
            properties: { className: ['anchor-link'], ariaHidden: 'true', tabIndex: -1 }
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
          img({ src, alt }) {
            return <MarkdownImage src={src} alt={alt} />;
          }
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
