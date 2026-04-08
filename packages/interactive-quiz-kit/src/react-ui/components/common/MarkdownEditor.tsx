// FILE: src/lib/interactive-quiz-kit/react-ui/components/common/MarkdownEditor.tsx
// ================================================================================

'use client';

import React, { useEffect } from 'react';
import { Editor, rootCtx, defaultValueCtx, editorViewOptionsCtx, editorViewCtx, serializerCtx } from '@milkdown/kit/core';
import { Milkdown, useEditor } from '@milkdown/react';
import { gfm } from '@milkdown/kit/preset/gfm';
import { usePluginViewFactory } from '@prosemirror-adapter/react';
// import { slash, SlashView } from './SlashCommand';
import type { MarkdownString } from '../../../types';

interface MarkdownEditorProps {
  value: MarkdownString;
  onChange: (markdown: MarkdownString) => void;
  className?: string;
  minHeight?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  className = '',
  minHeight = '150px',
}) => {
  const pluginViewFactory = usePluginViewFactory();

  const editorInfo = useEditor(
    (root) =>
      Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, root);
          ctx.set(defaultValueCtx, value);
          // ctx.set(slash.key, {
          //   view: pluginViewFactory({ component: SlashView }),
          // });
          ctx.update(editorViewOptionsCtx, (prev) => ({
            ...prev,
            attributes: { class: 'milkdown-editor' },
          }));
          ctx.get(editorViewCtx).props.dispatchTransaction = (tr) => {
            const { state } = ctx.get(editorViewCtx);
            const nextState = state.apply(tr);
            ctx.get(editorViewCtx).updateState(nextState);
            
            if (tr.docChanged) {
              const serializer = ctx.get(serializerCtx);
              const markdown = serializer(nextState.doc);
              onChange(markdown);
            }
          };
        })
        .use(gfm),
        //.use(slash),
    [value, onChange] // Re-create editor if value/onChange changes
  );

  // Effect to handle external value changes
  useEffect(() => {
    const editor = editorInfo.get();
    if (!editor) return;

    editor.action(ctx => {
        const view = ctx.get(editorViewCtx);
        const serializer = ctx.get(serializerCtx);
        const currentMarkdown = serializer(view.state.doc);

        if (currentMarkdown !== value) {
            // This is a more robust way to update content in Milkdown
            const { state } = view;
            const tr = state.tr.replaceWith(0, state.doc.content.size, state.schema.text(value));
            view.dispatch(tr);
        }
    });
  }, [value, editorInfo]);


  return (
    <div
      className={`milkdown-container ${className}`}
      style={{
        minHeight,
        border: '1px solid hsl(var(--border))',
        borderRadius: '0.375rem',
        overflow: 'hidden',
      }}
    >
      <Milkdown />
    </div>
  );
};