import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { MetricCard } from '../components/MetricCard';
import { PipelineTable } from '../components/PipelineTable';
import { RoadmapGrid } from '../components/RoadmapGrid';
import { LessonSidebar } from '../components/LessonSidebar';
import { PreviewPanel } from '../components/PreviewPanel';
import { AlignmentMatrix } from '../components/AlignmentMatrix';
import { ProjectSelector } from '../components/ProjectSelector';
import { LessonOutline } from '../components/LessonOutline';
import { useRef } from 'react';

const TABS = ['Dashboard', 'Lessons', 'Slides', 'Matrix'];

export function DashboardPage() {
  const { 
    activeProject, status, matrix, lessons, slides,
    loading, error, lastFetched, refresh, fetchAll,
    lessonType, lessonContent
  } = useStore();
  
  const [tab, setTab] = useState('Dashboard');
  const [showOutline, setShowOutline] = useState(true);
  const previewBodyRef = useRef(null);

  useEffect(() => { if (!lastFetched) fetchAll(); }, [lastFetched, fetchAll]);

  // Sync tab with store lessonType if user clicks sidebar items
  useEffect(() => {
    if (tab === 'Lessons' && lessonType !== 'lesson') {
      // stay on lessons tab
    }
  }, [lessonType, tab]);

  const stats = status?.stats || {};
  const pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;
  const hpPct = stats.hpTotal ? Math.round((stats.hpDone / stats.hpTotal) * 100) : 0;
  const pendingItem = status?.pipelineRows.find(r => r.status === 'pending');

  const handleTabChange = (t) => {
    setTab(t);
    // Auto-select type based on tab
    if (t === 'Lessons') {
      // if no active lesson of this type, keep it as is
    }
  };

  return (
    <div className="dashboard">
      {/* ── Header ── */}
      <header className="dash-header">
        <div className="dash-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ProjectSelector />
            <div>
              <h1 className="dash-title">Curriculum OS</h1>
              <div className="dash-sub">
                <span className="dash-path">{activeProject}</span>
                {lastFetched && (
                  <span className="dash-updated">
                    &nbsp;· ⟳ {new Date(lastFetched).toLocaleTimeString('vi-VN')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="dash-header-right">
          {error && <span className="error-badge">⚠ {error}</span>}
          <button className="btn-refresh" onClick={refresh} disabled={loading}>
            {loading ? '⟳ Đang tải...' : '⟳ Refresh'}
          </button>
        </div>
      </header>

      {loading && <div className="loading-bar"><div className="loading-bar-fill" /></div>}

      {/* ── Tabs ── */}
      {lastFetched && (
        <div className="tab-row">
          {TABS.map(t => (
            <button
              key={t}
              className={`nav-tab ${tab === t ? 'nav-tab--active' : ''}`}
              onClick={() => handleTabChange(t)}
            >
              {t}
              {t === 'Matrix' && matrix.length > 0 && (
                <span className="nav-tab-count">{matrix.length}</span>
              )}
              {t === 'Lessons' && lessons.length > 0 && (
                <span className="nav-tab-count">{lessons.length}</span>
              )}
              {t === 'Slides' && slides.length > 0 && (
                <span className="nav-tab-count">{slides.length}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Dashboard tab ── */}
      {tab === 'Dashboard' && status && (
        <>
          <section className="metrics-row">
            <MetricCard
              label="Pipeline hoàn thành"
              value={`${stats.done}/${stats.total}`}
              sub={stats.pending ? `${stats.pending} artifact đang chờ` : 'Tất cả hoàn thành ✓'}
              pct={pct}
              color="#22c55e"
            />
            <MetricCard
              label="Học phần hoàn thành"
              value={`${stats.hpDone}/${stats.hpTotal}`}
              sub={`Lộ trình HP7 → HP12 · ${hpPct}%`}
              pct={hpPct}
              color="#3b82f6"
            />
            <MetricCard
              label="Học liệu"
              value={`${lessons.length} bài / ${slides.length} slide`}
              sub="trong _shared/ và _content/"
              pct={100}
              color="#f59e0b"
            />
            <MetricCard
              label="Phase hiện tại"
              value={pendingItem?.phase || 'Done ✓'}
              sub={pendingItem?.role ? `${pendingItem.role}: ${pendingItem.artifact}` : 'Toàn bộ pipeline xong'}
              color="#8b95a8"
            />
          </section>

          <section className="main-grid">
            <div className="panel">
              <div className="panel-hdr">
                <span>Pipeline Status</span>
                <span className="panel-count">{stats.total} artifacts</span>
              </div>
              <PipelineTable rows={status.pipelineRows} />
            </div>
            <div className="panel">
              <div className="panel-hdr">
                <span>Lộ trình HP</span>
                <span className="panel-count">{stats.hpDone}/{stats.hpTotal} HP</span>
              </div>
              <RoadmapGrid roadmap={status.roadmap} />
            </div>
          </section>

          {status.changelog.length > 0 && (
            <section className="panel changelog-panel">
              <div className="panel-hdr">
                <span>Nhật ký thay đổi (Project History)</span>
                <span className="panel-count">{status.changelog.length} mục</span>
              </div>
              <div className="changelog-list">
                {[...status.changelog].reverse().slice(0, 10).map((entry, i) => (
                  <div key={i} className="changelog-item">
                    <div className={`clog-dot ${entry.done ? 'clog-dot--done' : 'clog-dot--pend'}`} />
                    {entry.date && <span className="clog-date">{entry.date}</span>}
                    <span className="clog-text">{entry.text}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* ── Viewer (Lessons & Slides) ── */}
      {(tab === 'Lessons' || tab === 'Slides') && (
        <section className="panel lesson-panel">
          <div className="panel-hdr">
            <span>{tab} Viewer</span>
            <span className="panel-count">{tab === 'Lessons' ? lessons.length : slides.length} files</span>
          </div>
          <div className={`lesson-layout ${showOutline ? 'lesson-layout--with-outline' : ''}`}>
            <div className="lesson-sidebar-wrapper">
              <LessonSidebar forceType={tab === 'Lessons' ? 'lesson' : 'slide'} />
            </div>
            <div className="preview-panel-wrapper">
              <PreviewPanel 
                showOutline={showOutline} 
                onToggleOutline={() => setShowOutline(!showOutline)}
                bodyRef={previewBodyRef}
              />
            </div>
            <div className="lesson-outline-wrapper">
              {showOutline && (
                <LessonOutline 
                  content={lessonContent} 
                  scrollContainerRef={previewBodyRef} 
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Matrix tab ── */}
      {tab === 'Matrix' && (
        <section className="panel">
          <div className="panel-hdr">
            <span>Alignment Matrix</span>
            <span className="panel-count">{matrix.length} hàng</span>
          </div>
          <AlignmentMatrix rows={matrix} />
        </section>
      )}

      {/* ── Not yet loaded ── */}
      {!lastFetched && !loading && (
        <div className="page-center" style={{ minHeight: '60vh' }}>
          <div className="welcome-card">
            <div className="welcome-icon">⬡</div>
            <h2 className="welcome-title">{activeProject?.name || 'Curriculum Dashboard'}</h2>
            <ProjectSelector />
            <p className="welcome-sub" style={{ marginTop: '20px' }}>Chọn dự án và nhấn Refresh để tải dữ liệu</p>
          </div>
        </div>
      )}
    </div>
  );
}
