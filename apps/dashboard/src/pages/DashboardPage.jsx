import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { PipelineTable } from '../components/PipelineTable';
import { RoadmapGrid } from '../components/RoadmapGrid';
import { MetricCard } from '../components/MetricCard';
import { LessonSidebar } from '../components/LessonSidebar';
import { PreviewPanel } from '../components/PreviewPanel';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function DashboardPage() {
  const { status, matrix, changelog, loading, error, fetchAll } = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading && !status) return <div className="loading-screen">Loading dashboard data...</div>;
  if (error) return <div className="error-screen">Error: {error}</div>;

  return (
    <div className="app-container">
      <header className="header">
        <div className="brand">
          <span className="logo">🛡️</span>
          <h1>Curriculum Dashboard</h1>
        </div>
        <div className="header-actions">
          <button onClick={fetchAll} className="btn-refresh" title="Refresh Data">🔄 Refresh</button>
        </div>
      </header>

      <nav className="tabs-nav">
        <div className="tabs">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'lessons', label: 'Lessons', icon: '📚' },
            { id: 'matrix', label: 'Matrix', icon: '🎯' },
            { id: 'changelog', label: 'Changelog', icon: '📝' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'tab-btn--active' : ''}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && status && (
          <div className="view-fade-in">
            <div className="metric-grid">
              <MetricCard 
                label="Pipeline Progress" 
                value={`${status.stats.done}/${status.stats.total}`} 
                pct={Math.round((status.stats.done / status.stats.total) * 100)}
                sub="Artifacts Completed"
              />
              <MetricCard 
                label="Roadmap Milestone" 
                value={`${status.stats.hpDone}/${status.stats.hpTotal}`} 
                pct={Math.round((status.stats.hpDone / status.stats.hpTotal) * 100)}
                sub="High-level Goals Reached"
                color="#10b981"
              />
            </div>

            <section className="section">
              <div className="section-header">
                <h2>Pipeline Trạng thái</h2>
                <span className="badge">Current Sprint</span>
              </div>
              <PipelineTable rows={status.pipelineRows} />
            </section>

            <section className="section">
              <div className="section-header">
                <h2>Lộ trình Dự án</h2>
              </div>
              <RoadmapGrid roadmap={status.roadmap} />
            </section>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="lesson-container view-fade-in">
            <LessonSidebar />
            <PreviewPanel />
          </div>
        )}

        {activeTab === 'matrix' && (
          <div className="matrix-view view-fade-in">
            <section className="section">
               <div className="section-header">
                  <h2>Alignment Matrix</h2>
                  <p>Check pedagogical consistency across all lessons.</p>
               </div>
               <PipelineTable rows={matrix} /> 
            </section>
          </div>
        )}

        {activeTab === 'changelog' && (
          <div className="changelog-view view-fade-in">
             <section className="section">
                <div className="section-header">
                  <h2>Project Changelog</h2>
                </div>
                <div className="changelog-paper">
                   <MarkdownRenderer content={changelog} />
                </div>
             </section>
          </div>
        )}
      </main>
    </div>
  );
}