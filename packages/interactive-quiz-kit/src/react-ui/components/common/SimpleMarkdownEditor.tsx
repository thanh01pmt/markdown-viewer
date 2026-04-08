// src/react-ui/components/common/SimpleMarkdownEditor.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../elements/tabs';
import { Textarea } from '../elements/textarea';
import { MarkdownRenderer } from './MarkdownRenderer';
import type { MarkdownString } from '../../../types';
import { Skeleton } from '../elements/skeleton';

interface SimpleMarkdownEditorProps {
  value: MarkdownString;
  onChange: (markdown: MarkdownString) => void;
  className?: string;
  minHeight?: string;
  placeholder?: string;
}

export const SimpleMarkdownEditor: React.FC<SimpleMarkdownEditorProps> = ({
  value,
  onChange,
  className = '',
  minHeight = '150px',
  placeholder = 'Enter content here... Markdown is supported.',
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className={`simple-markdown-editor ${className}`}>
      <Tabs defaultValue="write" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="write" className="mt-2">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="font-mono text-sm"
            style={{ minHeight }}
          />
        </TabsContent>
        <TabsContent value="preview" className="mt-2">
          <div
            className="p-3 border rounded-md bg-muted/20"
            style={{ minHeight }}
          >
            {isMounted ? (
              value ? (
                <MarkdownRenderer content={value} />
              ) : (
                <p className="text-muted-foreground">Preview will appear here.</p>
              )
            ) : (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};