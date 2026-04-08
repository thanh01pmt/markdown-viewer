// FILE: src/lib/interactive-quiz-kit/react-ui/components/common/RichTextEditor.tsx
// ================================================================================
// VERSION 4 - FIXED LOWLIGHT IMPORT ERROR

'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { common, createLowlight } from 'lowlight';
import type { RichContentString } from '../../../types';
import { EditorToolbar } from './EditorToolbar';

// Import languages for syntax highlighting
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml'; // for HTML
import typescript from 'highlight.js/lib/languages/typescript';
import javaLang from 'highlight.js/lib/languages/java';

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

// Register additional languages with lowlight
lowlight.register('javascript', javascript);
lowlight.register('python', python);
lowlight.register('css', css);
lowlight.register('html', html);
lowlight.register('typescript', typescript);
lowlight.register('java', javaLang);

interface RichTextEditorProps {
  value: RichContentString;
  onChange: (content: RichContentString) => void;
  className?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  className,
  minHeight = '150px',
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable code block from starter kit to use the one with highlighting
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image.configure({
        inline: false,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      // We store the content as HTML as it's the most direct output from TipTap.
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose dark:prose-invert max-w-none focus:outline-none p-3`,
      },
    },
  });

  // Effect to update editor content when the external value changes
  useEffect(() => {
    if (editor) {
      const isSame = editor.getHTML() === value;
      if (isSame) {
        return;
      }
      // Use `setContent` to update the editor's content.
      // The second argument `false` prevents firing the `onUpdate` callback, avoiding an infinite loop.
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  return (
    <div className={`border border-input rounded-md ${className}`}>
      <EditorToolbar editor={editor} />
      <EditorContent
        editor={editor}
        style={{ minHeight }}
        className="overflow-y-auto"
      />
    </div>
  );
};