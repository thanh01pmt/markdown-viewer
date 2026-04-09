import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useStore } from '../store/useStore';

export function StatsCharts({ data }) {
  const { theme } = useStore();
  const axisColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const tooltipBg = theme === 'dark' ? '#1e293b' : '#ffffff';

  return (
    <div className="stats-chart" style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ 
                backgroundColor: tooltipBg, 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '8px',
                color: theme === 'dark' ? '#fff' : '#0f172a'
            }} 
          />
          <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
