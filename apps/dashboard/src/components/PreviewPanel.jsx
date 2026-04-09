import { useState } from 'react';
import { useStore } from '../store/useStore';
import { MarkdownRenderer } from './MarkdownRenderer';
import { REPO } from '../config';

export function PreviewPanel({ showOutline, onToggleOutline, bodyRef }) {
  const { activeLesson, lessonContent, lessonLoading, clearLesson } = useStore();
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'raw'
  const [copying, setCopying] = useState(false);

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
  const lineCount = lessonContent ? lessonContent.split('\n').length : 0;
  const kbSize = lessonContent ? (new Blob([lessonContent]).size / 1024).toFixed(2) : 0;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  const handleCopy = () => {
    if (!lessonContent) return;
    navigator.clipboard.writeText(lessonContent);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  return (
    <div className="preview-panel">
      {/* GitHub-like Breadcrumb Header */}
      <div className="preview-page-header">
        <nav className="preview-breadcrumb">
          <a href="#" className="breadcrumb-link">{REPO.repo}</a>
          <span className="breadcrumb-sep">/</span>
          <a href="#" className="breadcrumb-link">_shared</a>
          <span className="breadcrumb-sep">/</span>
          <a href="#" className="breadcrumb-link">LESSONS</a>
          <span className="breadcrumb-sep">/</span>
          <h1 className="breadcrumb-active">{activeLesson.name}</h1>
        </nav>
      </div>

      {/* Box Container */}
      <div className="preview-box">
        {/* Box Header */}
        <div className="preview-box-header">
          <div className="preview-box-header-left">
            {!lessonLoading && (
              <span className="preview-file-meta">
                {lineCount} lines · {wordCount} words · {kbSize} KB · ~{readTime} min read
              </span>
            )}
          </div>
          
          <div className="preview-box-header-center">
            <div className="segmented-control">
              <button 
                className={`segmented-btn ${viewMode === 'preview' ? 'active' : ''}`}
                onClick={() => setViewMode('preview')}
              >
                Preview
              </button>
              <button 
                className={`segmented-btn ${viewMode === 'raw' ? 'active' : ''}`}
                onClick={() => setViewMode('raw')}
              >
                Code
              </button>
            </div>
          </div>

          <div className="preview-box-header-right">
            <div className="preview-actions-group">
              <a href={githubUrl} target="_blank" rel="noreferrer" className="action-btn">
                Raw
              </a>
              <button 
                className="action-icn-btn" 
                title={copying ? "Copied!" : "Copy raw file"} 
                onClick={handleCopy}
              >
                {copying ? (
                  <svg aria-hidden="true" focusable="false" className="octicon octicon-check text-green" viewBox="0 0 16 16" width="16" height="16" fill="var(--green)">
                    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
                  </svg>
                ) : (
                  <svg aria-hidden="true" focusable="false" className="octicon octicon-copy" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                    <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
                    <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
                  </svg>
                )}
              </button>
            </div>

            <div className="preview-actions-group outline-group">
              <button
                className={`action-icn-btn ${showOutline ? 'active' : ''}`}
                onClick={onToggleOutline}
                title="Outline"
              >
                <svg aria-hidden="true" focusable="false" className="octicon octicon-list-unordered" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                  <path d="M5.75 2.5h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1 0-1.5Zm0 5h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1 0-1.5Zm0 5h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1 0-1.5ZM2 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-6a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM2 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path>
                </svg>
              </button>
              
              <button className="action-icn-btn close-btn" title="Close" onClick={clearLesson}>
                <svg aria-hidden="true" focusable="false" className="octicon octicon-x" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                  <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Box Body */}
        <div className="preview-box-body" ref={bodyRef}>
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
    </div>
  );
}
