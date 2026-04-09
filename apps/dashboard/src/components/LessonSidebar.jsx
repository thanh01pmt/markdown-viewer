import React from 'react';
import { useStore } from '../store/useStore';

export function LessonSidebar() {
  const { lessons, activeLesson, selectLesson } = useStore();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Bài học ({lessons.length})</h3>
      </div>
      <div className="sidebar-list">
        {lessons.map((lesson) => (
          <button
            key={lesson.path}
            onClick={() => selectLesson(lesson)}
            className={`list-item ${activeLesson?.path === lesson.path ? 'list-item--active' : ''}`}
          >
            {lesson.name.replace('.md', '')}
          </button>
        ))}
      </div>
    </div>
  );
}