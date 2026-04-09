import { useStore } from '../store/useStore';

export function LessonSidebar() {
  const { lessons, activeLesson, selectLesson, clearLesson } = useStore();

  if (!lessons.length) {
    return (
      <div className="lesson-sidebar">
        <div className="sidebar-hdr">
          <span className="sidebar-title">HP7 · Lessons</span>
        </div>
        <div className="empty" style={{ padding: '16px' }}>Chưa load lesson files.</div>
      </div>
    );
  }

  return (
    <div className="lesson-sidebar">
      <div className="sidebar-hdr">
        <span className="sidebar-title">_shared/LESSONS</span>
        <span className="badge badge-done">{lessons.length} files</span>
      </div>
      <div className="sidebar-list">
        {lessons.map((lesson) => {
          const isActive = activeLesson?.sha === lesson.sha;
          const name = lesson.name.replace('.md', '');
          return (
            <button
              key={lesson.sha}
              className={`sidebar-item ${isActive ? 'sidebar-item--active' : ''}`}
              onClick={() => isActive ? clearLesson() : selectLesson(lesson)}
            >
              <span className="sidebar-item-dot" />
              <span className="sidebar-item-name">{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
