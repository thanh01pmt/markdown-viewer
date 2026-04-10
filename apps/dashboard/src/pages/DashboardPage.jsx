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
import { CommandPalette } from '../components/CommandPalette';
import { Search } from 'lucide-react';

const TABS = ['Dashboard', 'Lessons', 'Slides', 'Assets', 'Code', 'Matrix', 'Audits'];

export function DashboardPage() {
  const { 
    activeProject, status, matrix, lessons, slides, assets, codeFiles, audits,
    loading, error, lastFetched, refresh, fetchAll,
    lessonType, lessonContent, setTokenGateOpen,
    renderMode,
    groupMode, setGroupMode, activeLessonPack, setActiveLessonPack,
    selectLesson
  } = useStore();
  
  const [tab, setTab] = useState('Dashboard');
  const [collapsedModules, setCollapsedModules] = useState({});
  const [showOutline, setShowOutline] = useState(true);
  const [showOutlineDialog, setShowOutlineDialog] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const previewBodyRef = useRef(null);

  useEffect(() => { if (!lastFetched) fetchAll(); }, [lastFetched, fetchAll]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
  };

  const handleMatrixSelect = (lessonId) => {
    if (!lessonId) return;
    // Clean up lessonId for robust matching (e.g. "HP7_1" -> "HP7_1")
    const cleanId = lessonId.trim();
    
    // 1. Try to find in lessons
    const lesson = lessons.find(l => l.name.includes(cleanId));
    if (lesson) {
      selectLesson(lesson, 'lesson');
      setTab('Lessons');
      return;
    }

    // 2. Try to find in slides
    const slide = slides.find(s => s.name.includes(cleanId));
    if (slide) {
      selectLesson(slide, 'slide');
      setTab('Slides');
      return;
    }
    
    console.warn(`Could not find lesson or slide for ID: ${cleanId}`);
  };

  // Lesson Pack Logic
  const lessonPacks = Array.from(new Set([
    ...lessons.map(l => l.name.match(/HP\d+_\d+/)?.[0]),
    ...slides.map(s => s.name.match(/HP\d+_\d+/)?.[0])
  ].filter(Boolean))).sort();

  const packsByModule = lessonPacks.reduce((acc, packId) => {
    const mod = packId.split('_')[0];
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(packId);
    return acc;
  }, {});

  const formatPackName = (id) => id.replace('_', ' - ');

  const toggleModule = (mod) => {
    setCollapsedModules(prev => ({ ...prev, [mod]: !prev[mod] }));
  };

  return (
    <div className="app-layout">
      {/* ── Sidebar ── */}
      <aside className="app-sidebar">
        <div className="app-sidebar-header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h1 className="dash-title">LM Dashboard </h1>
            <div className="dash-sub">
              <div>{activeProject}</div>
              {lastFetched && (
                <div className="dash-updated">
                  ⟳ {new Date(lastFetched).toLocaleTimeString('vi-VN')}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}><ProjectSelector /></div>
            <button 
              className="action-icn-btn" 
              onClick={() => setIsCommandPaletteOpen(true)}
              title="Search (Cmd+K)"
              style={{ border: '1px solid var(--border2)', background: 'var(--bg3)' }}
            >
              <Search size={16} />
            </button>
          </div>
          
          <div className="segmented-control" style={{ width: '100%', marginTop: '4px' }}>
            <button 
              className={`segmented-btn ${groupMode === 'type' ? 'active' : ''}`}
              onClick={() => setGroupMode('type')}
              style={{ flex: 1 }}
            >
              Doc Type
            </button>
            <button 
              className={`segmented-btn ${groupMode === 'pack' ? 'active' : ''}`}
              onClick={() => setGroupMode('pack')}
              style={{ flex: 1 }}
            >
              Lesson Pack
            </button>
          </div>
        </div>

        <nav className="app-sidebar-nav">
          {lastFetched && groupMode === 'type' && TABS.map(t => (
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
              {t === 'Assets' && assets.length > 0 && (
                <span className="sidebar-tab-count">{assets.length}</span>
              )}
              {t === 'Code' && codeFiles.length > 0 && (
                <span className="sidebar-tab-count">{codeFiles.length}</span>
              )}
            </button>
          ))}

          {lastFetched && groupMode === 'pack' && (
            <>
              <button
                className={`sidebar-tab-btn ${tab === 'Dashboard' ? 'active' : ''}`}
                onClick={() => handleTabChange('Dashboard')}
              >
                <span>Dashboard</span>
              </button>
              
              <div className="sidebar-group-label">
                Lesson Packs
              </div>

              {Object.entries(packsByModule).map(([mod, packs]) => {
                const isCollapsed = collapsedModules[mod];
                return (
                  <div key={mod} className="sidebar-module-group">
                    <div className="sidebar-module-header" onClick={() => toggleModule(mod)}>
                      <span className={`chevron-icon ${isCollapsed ? 'collapsed' : ''}`}>▼</span>
                      <span>{mod}</span>
                    </div>
                    {!isCollapsed && packs.map(p => (
                      <button
                        key={p}
                        className={`sidebar-tab-btn ${activeLessonPack === p ? 'active' : ''}`}
                        onClick={() => {
                          setActiveLessonPack(p);
                          setTab('Lessons'); // Default to lessons view when pack selected
                        }}
                        style={{ paddingLeft: '24px' }}
                      >
                        <span>{formatPackName(p)}</span>
                      </button>
                    ))}
                  </div>
                );
              })}

              <button
                className={`sidebar-tab-btn ${tab === 'Matrix' ? 'active' : ''}`}
                onClick={() => handleTabChange('Matrix')}
                style={{ marginTop: '8px' }}
              >
                <span>Matrix</span>
              </button>
            </>
          )}
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
        
        {/* Critical Alerts Banner */}
        {tab === 'Dashboard' && status?.escalated?.length > 0 && (
          <div className="alert-banner">
            <span style={{ fontSize: '1.5rem' }}>⛔</span>
            <div>
              <b>Escalated Issues ({status.escalated.length})</b>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
                {status.escalated.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </div>
        )}
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

      {/* ── Viewer (Lessons, Slides, Assets, Code) ── */}
      {(tab === 'Lessons' || tab === 'Slides' || tab === 'Assets' || tab === 'Code') && (
        <section className="panel lesson-panel">
          <div className="panel-hdr">
            <span>{tab} Viewer</span>
            <span className="panel-count">
              {tab === 'Lessons' ? lessons.length : 
               tab === 'Slides' ? slides.length : 
               tab === 'Assets' ? assets.length : 
               codeFiles.length} files
            </span>
          </div>
        <div className={`lesson-layout ${showOutline ? 'lesson-layout--with-outline' : ''}`}>
            <div className="lesson-sidebar-wrapper">
              <LessonSidebar 
                forceType={
                  tab === 'Lessons' ? 'lesson' : 
                  tab === 'Slides' ? 'slide' : 
                  tab === 'Assets' ? 'asset' : 'code'
                } 
              />
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
                renderMode === 'slide' ? (
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
              renderMode === 'slide' ? (
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
        <section className="panel panel--flex">
          <div className="panel-hdr">
            <span>Alignment Matrix</span>
            <span className="panel-count">{matrix.length} hàng</span>
          </div>
          <AlignmentMatrix rows={matrix} onSelectLesson={handleMatrixSelect} />
        </section>
      )}

      {/* ── Audits tab ── */}
      {tab === 'Audits' && (
        <section className="panel">
          <div className="panel-hdr">
            <span>Báo cáo Chất lượng & Tài nguyên</span>
            <span className="panel-count">{audits.length} báo cáo</span>
          </div>
          <div style={{ padding: '1.5rem' }}>
            {audits.length > 0 ? (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '1.25rem' 
              }}>
                {audits.map((a, i) => (
                  <div key={i} className="panel" style={{ 
                    padding: '1.25rem', 
                    border: '1px solid var(--border2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'transform 0.2s',
                    cursor: 'default'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text1)' }}>
                        {a.Lesson || a.ID || `Audit #${i+1}`}
                      </div>
                      <AuditBadge score={a.Score} placeholders={a.Placeholders} />
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(a.Materials || a.Vật_liệu || []).map((m, j) => (
                        <span key={j} className="resource-tag">📦 {m}</span>
                      ))}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: 'auto', borderTop: '1px solid var(--border3)', paddingTop: '8px' }}>
                      {a.Hardware && <div style={{ marginBottom: '4px' }}><b>Hardware:</b> {a.Hardware.join(', ')}</div>}
                      {a.Software && <div><b>Software:</b> {a.Software.join(', ')}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty">
                Chưa có dữ liệu audit. <br/>
                Hệ thống tìm kiếm các file <code>RESOURCE_AUDIT_*.json</code> trong thư mục <code>_reports/</code>.
              </div>
            )}
          </div>
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

      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
    </div>
  );
}
