import React from 'react';

const STATUS_MAP = {
  done: { label: 'Done', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  pending: { label: 'In Progress', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  blocked: { label: 'Blocked', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  todo: { label: 'To Do', color: '#8b95a8', bg: 'rgba(139, 149, 168, 0.1)' },
};

export function PipelineTable({ rows }) {
  if (!rows || rows.length === 0) return <div className="empty-state">No data</div>;

  return (
    <div className="table-wrapper">
      <table className="dash-table">
        <thead>
          <tr>
            <th>Phase</th>
            <th>Artifact</th>
            <th>Status</th>
            <th>Agent</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const cfg = STATUS_MAP[row.status] || STATUS_MAP.todo;
            return (
              <tr key={i}>
                <td className="font-medium">{row.phase}</td>
                <td>{row.artifact}</td>
                <td>
                  <span className="status-badge" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                    {cfg.label}
                  </span>
                </td>
                <td className="text-muted">{row.agent}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
