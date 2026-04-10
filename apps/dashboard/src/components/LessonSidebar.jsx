import { useStore } from '../store/useStore';
import AuditBadge from './AuditBadge';

export function LessonSidebar({ forceType }) {
  const { 
    lessons, slides, assets, codeFiles, activeLesson, selectLesson, 
    searchQuery, setSearchQuery, 
    filterHP, setFilterHP, loading,
    groupMode, activeLessonPack, audits
  } = useStore();

  let items = forceType === 'slide' ? slides : 
              forceType === 'asset' ? assets : 
              forceType === 'code' ? codeFiles : lessons;
  let currentType = forceType || 'lesson';

  if (groupMode === 'pack') {
    items = [];
    if (activeLessonPack) {
      lessons.forEach(l => {
        if (l.name.includes(activeLessonPack)) items.push({ ...l, type: 'lesson' });
      });
      slides.forEach(s => {
        if (s.name.includes(activeLessonPack)) items.push({ ...s, type: 'slide' });
      });
      assets.forEach(a => {
        if (a.name.includes(activeLessonPack)) items.push({ ...a, type: 'asset' });
      });
      codeFiles.forEach(c => {
        if (c.name.includes(activeLessonPack)) items.push({ ...c, type: 'code' });
      });
    }
  }

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

  const formatName = (l) => {
    const name = l.displayName || l.name;
    const type = l.type || currentType;
    return name
      .replace('LESSON_', '')
      .replace('SLIDE_', '')
      .replace('.md', '')
      .replace('.sh', '')
      .replace('.py', '')
      .replace('.cpp', '')
      .replace(/_/g, ' ') + 
      (type === 'slide' ? ' (Slide)' : 
       type === 'asset' ? ' (Asset)' : 
       type === 'code' ? ' (Code)' : '');
  };

  const getAudit = (itemName) => {
    const id = itemName.match(/HP\d+_\d+/)?.[0];
    return audits.find(a => a.Lesson === id || a.ID === id || itemName.includes(a.Lesson));
  };

  return (
    <div className="lesson-sidebar">
      <div className="sidebar-filters">
        <input
          type="text"
          placeholder={
            forceType === 'slide' ? "Tìm slide..." : 
            forceType === 'asset' ? "Tìm asset..." : 
            forceType === 'code' ? "Tìm code..." : "Tìm bài học..."
          }
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
              onClick={() => selectLesson(l, l.type || currentType)}
            >
              <div className="sidebar-item-name">{formatName(l)}</div>
              {l.type !== 'slide' && currentType !== 'slide' && (
                <AuditBadge score={getAudit(l.name)?.Score} placeholders={getAudit(l.name)?.Placeholders} />
              )}
            </button>
          ))
        ) : (
          <div className="sidebar-empty">
            {groupMode === 'pack' ? (activeLessonPack ? "Bài này chưa có học liệu" : "Chọn một bài ở sidebar trái") : "Không tìm thấy mục nào"}
          </div>
        )}
      </div>
    </div>
  );
}
