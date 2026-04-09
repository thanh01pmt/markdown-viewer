export function MetricCard({ label, value, sub, pct, color = '#3266ad' }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value" style={{ color }}>{value}</div>
      {sub && <div className="metric-sub">{sub}</div>}
      {pct !== undefined && (
        <div className="metric-bar">
          <div className="metric-bar-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
      )}
    </div>
  );
}
