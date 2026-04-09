import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { MetricCard } from '../components/MetricCard';
import { PipelineTable } from '../components/PipelineTable';
import { RoadmapGrid } from '../components/RoadmapGrid';
import { LessonSidebar } from '../components/LessonSidebar';
import { PreviewPanel } from '../components/PreviewPanel';
import { AlignmentMatrix } from '../components/AlignmentMatrix';

const TABS = ['Dashboard', 'Lesson Viewer', 'Alignment Matrix'];

export function DashboardPage() {
  const { status, matrix, lessons, loading, error, lastFetched, refresh, fetchAll } = useStore();
  const [tab, setTab] = useState('Dashboard');

  useEffect(() => { if (!lastFetched) fetchAll(); }, []);

  const stats = status?.stats || {};
  const pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;
  const hpPct = stats.hpTotal ? Math.round((stats.hpDone / stats.hpTotal) * 100) : 0;
  const pendingItem = status?.pipelineRows.find(r => r.status === 'pending');

  return (
    <div className="dashboard">
      {/* ── Header ── */}
      <header className="dash-header">
        <div className="dash-header-left">
          <h1 className="dash-title">PATHWAY-AIoT 2026</h1>
          <div className="dash-sub">
            <span className="repo-chip">thanh01pmt / my-agents</span>
            <span className="dash-path">packages/the-ultimate-curriculum-agent-os/projects/pathway-aiot</span>
            {lastFetched && (
              <span className="dash-updated">
                &nbsp;· ⟳ {new Date(lastFetched).toLocaleTimeString('vi-VN')}
              </span>
            )}
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
              onClick={() => setTab(t)}
            >
              {t}
              {t === 'Alignment Matrix' && matrix.length > 0 && (
                <span className="nav-tab-count">{matrix.length}</span>
              )}
              {t === 'Lesson Viewer' && lessons.length > 0 && (
                <span className="nav-tab-count">{lessons.length}</span>
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
              label="Lesson files"
              value={lessons.length || '—'}
              sub="trong _shared/LESSONS/"
              pct={lessons.length > 0 ? 100 : 0}
              color="#f59e0b"
            />
            <MetricCard
              label="Phase hiện tại"
              value={pendingItem?.phase || 'Done ✓'}
              sub={pendingItem?.artifact || 'Toàn bộ pipeline xong'}
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
                <span>Lộ trình 12 học phần</span>
                <span className="panel-count">{stats.hpDone}/{stats.hpTotal} HP</span>
              </div>
              <RoadmapGrid roadmap={status.roadmap} />
            </div>
          </section>

          {status.changelog.length > 0 && (
            <section className="panel changelog-panel">
              <div className="panel-hdr">
                <span>Nhật ký thay đổi</span>
                <span className="panel-count">{status.changelog.length} mục</span>
              </div>
              <div className="changelog-list">
                {[...status.changelog].reverse().map((entry, i) => (
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

      {/* ── Lesson Viewer tab ── */}
      {tab === 'Lesson Viewer' && (
        <section className="panel lesson-panel">
          <div className="panel-hdr">
            <span>Lesson Preview · _shared/LESSONS/</span>
            <span className="panel-count">{lessons.length} files</span>
          </div>
          <div className="lesson-layout">
            <LessonSidebar />
            <PreviewPanel />
          </div>
        </section>
      )}

      {/* ── Alignment Matrix tab ── */}
      {tab === 'Alignment Matrix' && (
        <section className="panel">
          <div className="panel-hdr">
            <span>Alignment Matrix · ALIGNMENT_MATRIX.md</span>
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
            <h2 className="welcome-title">PATHWAY-AIoT 2026</h2>
            <p className="welcome-sub">Nhấn kết nối để tải dữ liệu từ GitHub</p>
          </div>
        </div>
      )}
    </div>
  );
}
