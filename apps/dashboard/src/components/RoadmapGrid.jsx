import React from 'react';

export function RoadmapGrid({ roadmap }) {
  if (!roadmap || roadmap.length === 0) return <div className="empty-state">No roadmap items</div>;

  return (
    <div className="roadmap-grid">
      {roadmap.map((item, i) => (
        <div key={i} className={`roadmap-item ${item.done ? 'roadmap-item--done' : ''}`}>
          <div className="roadmap-icon">{item.done ? '✓' : '⬡'}</div>
          <div className="roadmap-info">
            <div className="roadmap-label">{item.label}</div>
            <div className="roadmap-sub">{item.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}