import { useEffect, useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { MetricCard } from '../components/MetricCard';
import { PipelineTable } from '../components/PipelineTable';
import { RoadmapGrid } from '../components/RoadmapGrid';
import { LessonSidebar } from '../components/LessonSidebar';
import { PreviewPanel } from '../components/PreviewPanel';
import { AlignmentMatrix } from '../components/AlignmentMatrix';
import { ProjectSelector } from '../components/ProjectSelector';
import { DocOutline } from '../components/DocOutline';
import { SlideOutline } from '../components/SlideOutline';

const TABS = ['Dashboard', 'Lessons', 'Slides', 'Matrix'];

export function DashboardPage() {
  const { 
    activeProject, status, matrix, lessons, slides,
    loading, error, lastFetched, refresh, fetchAll,
    lessonType, lessonContent, setTokenGateOpen
  } = useStore();
  
  const [tab, setTab] = useState('Dashboard');
  const [showOutline, setShowOutline] = useState(true);
  const [showOutlineDialog, setShowOutlineDialog] = useState(false);
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
    <div className="app-layout">
      {/* ── Sidebar ── */}
      <aside className="app-sidebar">
        <div className="app-sidebar-header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h1 className="dash-title">Curriculum OS</h1>
            <div className="dash-sub">
              <div>{activeProject}</div>
              {lastFetched && (
                <div className="dash-updated">
                  ⟳ {new Date(lastFetched).toLocaleTimeString('vi-VN')}
                </div>
              )}
            </div>
          </div>
          <ProjectSelector />
        </div>

        <nav className="app-sidebar-nav">
          {lastFetched && TABS.map(t => (
            <button
              key={t}
              className={`sidebar-tab-btn ${tab === t ? 'active' : ''}`}
              onClick={() => handleTabChange(t)}
            >
              <span>{t}</span>
              {t === 'Matrix' && matrix.length > 0 && (
                <span className="sidebar-tab-count">{matrix.length}</span>
              )}
              {t === 'Lessons' && lessons.length > 0 && (
                <span className="sidebar-tab-count">{lessons.length}</span>
              )}
              {t === 'Slides' && slides.length > 0 && (
                <span className="sidebar-tab-count">{slides.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="app-sidebar-footer">
          {error && <div className="error-badge">⚠ {error}</div>}
          <button className="btn-refresh" onClick={refresh} disabled={loading} style={{ width: '100%' }}>
            {loading ? '⟳ Đang tải...' : '⟳ Refresh'}
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => setTokenGateOpen(true)} 
            style={{ width: '100%', padding: '8px', fontSize: '13px' }}
          >
            ⚙ Settings / Token
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="app-main">
        {loading && <div className="loading-bar"><div className="loading-bar-fill" /></div>}
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
                onToggleOutline={() => {
                  // On desktop: toggle sidebar; detected via CSS class
                  if (window.innerWidth <= 900) {
                    setShowOutlineDialog(true);
                  } else {
                    setShowOutline(!showOutline);
                  }
                }}
                bodyRef={previewBodyRef}
              />
            </div>
            {/* Right sidebar outline — desktop only */}
            <div className="lesson-outline-wrapper">
              {showOutline && (
                tab === 'Slides' ? (
                  <SlideOutline 
                    content={lessonContent} 
                    scrollContainerRef={previewBodyRef} 
                  />
                ) : (
                  <DocOutline 
                    content={lessonContent} 
                    scrollContainerRef={previewBodyRef} 
                  />
                )
              )}
            </div>
            {/* Dialog outline — mobile only */}
            {showOutlineDialog && (
              tab === 'Slides' ? (
                <SlideOutline 
                  content={lessonContent}
                  scrollContainerRef={previewBodyRef}
                  isDialog
                  onClose={() => setShowOutlineDialog(false)}
                />
              ) : (
                <DocOutline 
                  content={lessonContent}
                  scrollContainerRef={previewBodyRef}
                  isDialog
                  onClose={() => setShowOutlineDialog(false)}
                />
              )
            )}
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
      </main>
    </div>
  );
}
