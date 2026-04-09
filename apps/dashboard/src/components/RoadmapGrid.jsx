import { useStore } from '../store/useStore';

export function RoadmapGrid({ roadmap }) {
  const { setFilterHP, filterHP } = useStore();

  if (!roadmap?.length) return <div className="empty">Chưa có dữ liệu lộ trình.</div>;

  const handleHPClick = (label) => {
    const match = label.match(/HP\d+/);
    if (match) {
      const hpCode = match[0];
      setFilterHP(filterHP === hpCode ? '' : hpCode);
    }
  };

  return (
    <div className="roadmap-grid">
      {roadmap.map((hp, i) => (
        <div 
          key={i} 
          className={`roadmap-item ${hp.done ? 'roadmap-item--done' : ''} ${filterHP && hp.label.includes(filterHP) ? 'roadmap-item--active' : ''}`}
          onClick={() => handleHPClick(hp.label)}
          style={{ cursor: 'pointer' }}
        >
          <div className="roadmap-item-top">
            <span className="roadmap-id">{hp.id}</span>
            <span className={`roadmap-dot ${hp.done ? 'dot-done' : 'dot-todo'}`} />
          </div>
          <div className="roadmap-name">{hp.label.replace(/^HP\d+:\s*/, '')}</div>
          <div className="roadmap-track">
            <div className="roadmap-fill" style={{ width: hp.done ? '100%' : '0%' }} />
          </div>
          <span className={`badge ${hp.done ? 'badge-done' : 'badge-todo'}`}>
            {hp.done ? 'Done' : 'Todo'}
          </span>
        </div>
      ))}
    </div>
  );
}
