import { Suspense, lazy } from 'react';
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

export function MarkdownRenderer({ content }) {
  return (
    <div className="md-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, { 
            behavior: 'prepend',
            properties: { className: ['anchor-link'] },
            content: { type: 'text', value: '#' }
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
        {content}
      </ReactMarkdown>
    </div>
  );
}
