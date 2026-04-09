import React from 'react';

export function MetricCard({ label, value, pct, color }) {
  return (
    <div className="metric-card glass" style={{ padding: '1.5rem', borderRadius: '12px', borderLeft: `4px solid ${color}` }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{value}</span>
        {pct !== undefined && <span style={{ fontSize: '0.9rem', color }}>{Math.round(pct)}%</span>}
      </div>
    </div>
  );
}