import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import AuditBadge from './AuditBadge';

const STATUS_CFG = {
  done:    { label: 'Done',    cls: 'badge-done' },
  pending: { label: 'Pending', cls: 'badge-pending' },
  todo:    { label: 'Todo',      cls: 'badge-todo' },
  blocked: { label: 'Blocked', cls: 'badge-blocked' },
};

export function AlignmentMatrix({ rows, onSelectLesson }) {
  const { audits } = useStore();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getAudit = (lessonName) => {
    if (!lessonName) return null;
    return audits.find(a => 
      (a.Lesson && lessonName.includes(a.Lesson)) || 
      (a.ID && lessonName.includes(a.ID))
    );
  };

  const filteredRows = useMemo(() => {
    if (!rows) return [];
    return rows.filter(r => {
      const q = query.toLowerCase();
      const matchQuery = 
        (r.lesson || '').toLowerCase().includes(q) ||
        (r.objective || '').toLowerCase().includes(q) ||
        (r.content || '').toLowerCase().includes(q);
      
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [rows, query, statusFilter]);

  const stats = useMemo(() => {
    if (!rows?.length) return { total: 0, done: 0, pct: 0 };
    const total = rows.length;
    const done = rows.filter(r => r.status === 'done').length;
    return { total, done, pct: Math.round((done / total) * 100) };
  }, [rows]);

  if (!rows?.length) return (
    <div className="empty">Chưa có dữ liệu Alignment Matrix — kiểm tra file <code>ALIGNMENT_MATRIX.md</code>.</div>
  );

  return (
    <div className="matrix-tab-container">
      <div className="matrix-controls">
        <div className="matrix-filters-row">
          <div className="matrix-search-wrap">
            <span className="matrix-search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Tìm kiếm bài học, mục tiêu hoặc nội dung..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="matrix-status-filters">
            <button 
              className={`status-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All
            </button>
            {Object.entries(STATUS_CFG).map(([k, v]) => (
              <button 
                key={k}
                className={`status-filter-btn ${statusFilter === k ? 'active' : ''}`}
                onClick={() => setStatusFilter(k)}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="matrix-summary-bar">
          <div className="matrix-summary-stat">
            <b>Completeness:</b> {stats.done} / {stats.total} bài học ({stats.pct}%)
          </div>
          <div className="matrix-progress-track">
            <div className="matrix-progress-fill" style={{ width: `${stats.pct}%` }} />
          </div>
          <div className="matrix-summary-stat" style={{ marginLeft: 'auto' }}>
            Hiển thị <b>{filteredRows.length}</b> kết quả
          </div>
        </div>
      </div>

      <div className="matrix-wrap">
        <table className="matrix-table">
          <thead>
            <tr>
              <th>ID/Lesson</th>
              <th style={{ width: '25%' }}>Objective</th>
              <th>Key Content</th>
              <th>Learning Activities</th>
              <th>Assessments</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, i) => {
              const cfg = STATUS_CFG[row.status] || STATUS_CFG.todo;
              return (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <a className="matrix-lesson-link" onClick={() => onSelectLesson?.(row.lesson)}>
                        {row.lesson}
                      </a>
                      <AuditBadge 
                        score={getAudit(row.lesson)?.Score} 
                        placeholders={getAudit(row.lesson)?.Placeholders} 
                      />
                    </div>
                  </td>
                  <td className="matrix-cell matrix-cell--objective">{row.objective}</td>
                  <td className="matrix-cell">{row.content}</td>
                  <td className="matrix-cell">{row.activity}</td>
                  <td className="matrix-cell">{row.assessment}</td>
                  <td>
                    <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                  </td>
                </tr>
              );
            })}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
                  Không tìm thấy kết quả nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
