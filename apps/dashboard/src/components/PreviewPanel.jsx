import React from 'react';
import { useStore } from '../store/useStore';
import MarkdownRenderer from './MarkdownRenderer';

export function PreviewPanel() {
  const { activeLesson, lessonContent, lessonLoading, clearLesson } = useStore();

  if (!activeLesson) {
    return (
      <div className="preview-empty">
        <div className="empty-icon">📂</div>
        <p>Select a lesson to preview its content</p>
      </div>
    );
  }

  return (
    <div className="preview-panel">
      <div className="preview-header">
        <h2>{activeLesson.name.replace('.md', '')}</h2>
        <button onClick={clearLesson} className="btn-close">×</button>
      </div>
      <div className="preview-content">
        {lessonLoading ? (
          <div className="loading-spinner">Loading lesson...</div>
        ) : (
          <MarkdownRenderer content={lessonContent} />
        )}
      </div>
    </div>
  );
}