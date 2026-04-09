import { useStore } from '../store/useStore';

export function LessonSidebar({ forceType }) {
  const { 
    lessons, slides, activeLesson, selectLesson, 
    searchQuery, setSearchQuery, 
    filterHP, setFilterHP, loading
  } = useStore();

  const items = forceType === 'slide' ? slides : lessons;
  const currentType = forceType || 'lesson';

  if (loading && !items.length) {
    return (
      <div className="lesson-sidebar">
        <div className="sidebar-empty">Đang tải...</div>
      </div>
    );
  }

  const filtered = items.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHP = filterHP ? l.name.includes(filterHP) : true;
    return matchesSearch && matchesHP;
  });

  // Extract HP list for filter (HP7, HP8, ...)
  const hps = Array.from(new Set(items.map(l => l.name.match(/HP\d+/)?.[0]).filter(Boolean))).sort();

  const formatName = (name) => {
    // LESSON_HP7_01.md -> HP7 - 01
    // SLIDE_HP7_01.md -> HP7 - 01 (Slide)
    return name
      .replace('LESSON_', '')
      .replace('SLIDE_', '')
      .replace('.md', '')
      .replace(/_/g, ' - ') + (forceType === 'slide' ? ' (Slide)' : '');
  };

  return (
    <div className="lesson-sidebar">
      <div className="sidebar-filters">
        <input
          type="text"
          placeholder={forceType === 'slide' ? "Tìm slide..." : "Tìm bài học..."}
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="hp-filters">
          <button 
            className={`hp-chip ${!filterHP ? 'active' : ''}`}
            onClick={() => setFilterHP('')}
          >All</button>
          {hps.map(hp => (
            <button
              key={hp}
              className={`hp-chip ${filterHP === hp ? 'active' : ''}`}
              onClick={() => setFilterHP(hp)}
            >
              {hp}
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-list">
        {filtered.length > 0 ? (
          filtered.map(l => (
            <button
              key={l.path}
              className={`sidebar-item ${activeLesson?.path === l.path ? 'sidebar-item--active' : ''}`}
              onClick={() => selectLesson(l, currentType)}
            >
              <div className="sidebar-item-name">{formatName(l.name)}</div>
            </button>
          ))
        ) : (
          <div className="sidebar-empty">Không tìm thấy mục nào</div>
        )}
      </div>
    </div>
  );
}
