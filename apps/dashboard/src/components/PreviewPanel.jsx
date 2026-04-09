import { useState } from 'react';
import { useStore } from '../store/useStore';
import { MarkdownRenderer } from './MarkdownRenderer';
import { REPO } from '../config';

export function PreviewPanel({ showOutline, onToggleOutline, bodyRef }) {
  const { activeLesson, lessonContent, lessonLoading, clearLesson } = useStore();
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'raw'

  if (!activeLesson) {
    return (
      <div className="preview-empty">
        <div className="preview-empty-icon">📄</div>
        <div className="preview-empty-title">Chọn một bài học để xem</div>
        <div className="preview-empty-sub">Danh sách bài nằm ở thanh bên trái</div>
      </div>
    );
  }

  const githubUrl = `https://github.com/${REPO.owner}/${REPO.repo}/blob/${REPO.branch}/${activeLesson.path}`;
  const wordCount = lessonContent ? lessonContent.split(/\s+/).filter(Boolean).length : 0;
  const readTime = Math.max(1, Math.round(wordCount / 200));
  // Derive status from filename pattern
  const status = activeLesson.name?.includes('.draft') ? 'pending' : 'done';

  return (
    <div className="preview-panel">
      {/* Header */}
      <div className="preview-hdr">
        <div className="preview-breadcrumb">
          <span>pathway-aiot</span>
          <span className="breadcrumb-sep">›</span>
          <span>_shared/LESSONS</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">{activeLesson.name}</span>
        </div>
        <div className="preview-actions">
          <button
            className={`tab-btn ${viewMode === 'preview' ? 'tab-btn--active' : ''}`}
            onClick={() => setViewMode('preview')}
          >Preview</button>
          <button
            className={`tab-btn ${viewMode === 'raw' ? 'tab-btn--active' : ''}`}
            onClick={() => setViewMode('raw')}
          >Raw MD</button>
          <button 
            className={`tab-btn ${showOutline ? 'tab-btn--active' : ''}`} 
            onClick={onToggleOutline}
            title="Toggle Outline"
          >
            {showOutline ? '▥ Outline On' : '▯ Outline Off'}
          </button>
          <a href={githubUrl} target="_blank" rel="noreferrer" className="tab-btn">
            GitHub ↗
          </a>
          <button className="tab-btn" onClick={clearLesson}>✕</button>
        </div>
      </div>

      {/* Meta */}
      <div className="preview-meta">
        <span className={`badge badge-${status}`}>{status}</span>
        {!lessonLoading && (
          <>
            <span className="meta-stat">{wordCount.toLocaleString()} từ</span>
            <span className="meta-sep">·</span>
            <span className="meta-stat">~{readTime} phút đọc</span>
          </>
        )}
      </div>

      {/* Body */}
      <div className="preview-body" ref={bodyRef}>
        {lessonLoading ? (
          <div className="preview-loading">
            <div className="spinner" />
            <span>Đang tải từ GitHub...</span>
          </div>
        ) : viewMode === 'raw' ? (
          <pre className="raw-view">{lessonContent}</pre>
        ) : (
          <div className="md-content">
            <MarkdownRenderer content={lessonContent} />
          </div>
        )}
      </div>
    </div>
  );
}
