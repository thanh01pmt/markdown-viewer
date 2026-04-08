// FILE: src/lib/interactive-quiz-kit/react-ui/components/common/RichTextRenderer.tsx
// ================================================================================

'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { MarkdownString } from '../../../types';

interface RichTextRendererProps {
  content: MarkdownString;
  className?: string;
}

/**
 * A specialized component to render Markdown content.
 * It supports GitHub Flavored Markdown, syntax highlighting for code blocks,
 * and mathematical formulas using KaTeX.
 * It also provides custom rendering for images and a placeholder for videos
 * to ensure they are responsive and styled correctly.
 */
export const RichTextRenderer: React.FC<RichTextRendererProps> = ({ content, className }) => {
  if (!content) {
    return null;
  }

  return (
    <div className={`prose dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
        components={{
          // Override the default image component to make it responsive
          img: ({ node, ...props }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              {...props}
              style={{ maxWidth: '100%', height: 'auto', borderRadius: '0.5rem', margin: '1rem 0' }}
              alt={props.alt || ''}
            />
          ),
          // Override the default table to add some styling
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto">
              <table {...props} className="my-4 w-full text-sm" />
            </div>
          ),
          // Override default blockquote for better styling
          blockquote: ({ node, ...props }) => (
            <blockquote
              {...props}
              className="border-l-4 border-primary bg-muted/50 p-4 my-4 italic"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};