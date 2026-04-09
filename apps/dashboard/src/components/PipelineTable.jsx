const STATUS_CONFIG = {
  done:    { label: 'Completed', cls: 'badge-done' },
  pending: { label: 'Pending',   cls: 'badge-pending' },
  blocked: { label: 'Blocked',   cls: 'badge-blocked' },
  todo:    { label: 'Todo',      cls: 'badge-todo' },
};

export function PipelineTable({ rows }) {
  if (!rows?.length) return <div className="empty">Chưa có dữ liệu pipeline.</div>;

  return (
    <div className="pipeline-scroll">
      {rows.map((row, i) => {
        const cfg = STATUS_CONFIG[row.status] || STATUS_CONFIG.todo;
        const isPhase = /^Phase/i.test(row.phase);
        return (
          <div key={i} className={`pipeline-row ${isPhase ? 'pipeline-row--phase' : ''}`}>
            <span className="pipeline-phase">{row.phase}</span>
            <span className={`pipeline-name ${isPhase ? 'font-medium' : ''}`}>{row.artifact}</span>
            <span className="pipeline-agent">{row.agent}</span>
            <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
          </div>
        );
      })}
    </div>
  );
}
