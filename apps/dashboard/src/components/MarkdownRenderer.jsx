import { Suspense, lazy, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';


// Lazy-load the heavy syntax highlighter
const SyntaxHighlighter = lazy(() =>
  import('react-syntax-highlighter').then(m => ({ default: m.Prism }))
);
const oneDarkPromise = import('react-syntax-highlighter/dist/esm/styles/prism').then(m => m.oneDark);

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

function extractMetadata(content) {
  if (!content) return { processedContent: '', mdMeta: [] };

  let stripped = content;
  let mdMeta = [];

  // Strip standard YAML frontmatter: --- ... ---
  const fmRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?/;
  const fmMatch = stripped.match(fmRegex);
  if (fmMatch) {
    stripped = stripped.replace(fmRegex, '');
  }

  // Strip HTML comments and extract metadata
  const htmlCommentRegex = /<!--([\s\S]*?)-->/g;
  stripped = stripped.replace(htmlCommentRegex, (match, innerText) => {
    const text = innerText.trim();
    if (text.includes('SME_MANDATE') || text.includes(':')) {
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      lines.forEach(line => {
        if (line.includes('[SME_MANDATE]')) {
          mdMeta.push({ label: 'SME MANDATE', isPrimary: true });
          return;
        }
        
        const parts = line.split('|');
        let currentKey = null;
        let currentValue = '';

        for (let i = 0; i < parts.length; i++) {
          const part = parts[i].trim();
          const colonIdx = part.indexOf(':');
          
          if (colonIdx > 0 && colonIdx < 30) { 
             if (currentKey) {
               mdMeta.push({ label: currentKey, value: currentValue.trim() });
             }
             currentKey = part.substring(0, colonIdx).trim();
             currentValue = part.substring(colonIdx + 1).trim();
          } else {
             if (currentKey) {
               currentValue += currentValue ? ' | ' + part : part;
             } else if (part && part.length < 50) {
               mdMeta.push({ label: part });
             }
          }
        }
        if (currentKey) {
           mdMeta.push({ label: currentKey, value: currentValue.trim() });
        }
      });
    }
    return ''; 
  });

  // Strip @content annotation lines
  stripped = stripped.replace(/^@\S+[^\n]*\n?/gm, (match) => {
    const cleaned = match.replace(/^@\S+\s*\|\s*/, '');
    const parts = cleaned.split('|');
    let currentKey = null;
    let currentValue = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      const colonIdx = part.indexOf(':');
      if (colonIdx > 0 && colonIdx < 30) {
        if (currentKey) mdMeta.push({ label: currentKey, value: currentValue.trim() });
        currentKey = part.substring(0, colonIdx).trim();
        currentValue = part.substring(colonIdx + 1).trim();
      } else {
        if (currentKey) {
           currentValue += currentValue ? ' | ' + part : part;
        } else if (part && part.length < 50) {
           mdMeta.push({ label: part });
        }
      }
    }
    if (currentKey) mdMeta.push({ label: currentKey, value: currentValue.trim() });

    return '';
  });

  // Strip leading blank lines
  stripped = stripped.replace(/^\s+/, '');

  return { processedContent: stripped, mdMeta };
}

// SVG link icon as hast node (invisible by default, shown on hover via CSS)
const anchorIcon = {
  type: 'element',
  tagName: 'span',
  properties: { className: ['anchor-icon'], ariaHidden: 'true' },
  children: [{ type: 'text', value: '#' }],
};

export function MarkdownRenderer({ content }) {
  const { processedContent, mdMeta } = useMemo(() => extractMetadata(content), [content]);

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
