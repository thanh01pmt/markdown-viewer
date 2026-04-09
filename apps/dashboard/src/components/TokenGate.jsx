import { useState } from 'react';
import { useStore } from '../store/useStore';

export function TokenGate({ children }) {
  const { token, setToken, fetchAll, error, loading, lastFetched } = useStore();
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(!lastFetched);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim()) setToken(input.trim());
    await fetchAll();
    setOpen(false);
  };

  const handlePublic = async () => {
    await fetchAll();
    setOpen(false);
  };

  if (open) {
    return (
      <div className="token-gate">
        <div className="token-card">
          <div className="token-header">
            <div className="token-logo">⬡</div>
            <h1 className="token-title">PATHWAY-AIoT 2026</h1>
            <p className="token-sub">
              Dashboard học liệu cho lộ trình <strong>HP7 → HP12</strong>.
              Kết nối với repo <code>thanh01pmt/my-agents</code> (public).
            </p>
          </div>

          <div className="token-divider" />

          <form onSubmit={handleSubmit} className="token-form">
            <label className="token-label">GitHub Personal Access Token <span className="token-optional">(tuỳ chọn)</span></label>
            <input
              className="token-input"
              type="password"
              placeholder="ghp_xxxx... · tăng rate limit 60→5000 req/h"
              value={input}
              onChange={e => setInput(e.target.value)}
              autoComplete="off"
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '⟳ Đang kết nối...' : 'Kết nối với Token'}
            </button>
          </form>

          <div className="token-or">
            <span>hoặc</span>
          </div>

          <button className="btn-secondary" onClick={handlePublic} disabled={loading}>
            {loading ? '⟳ Đang tải dữ liệu...' : '🔓 Kết nối Public (không cần token)'}
          </button>

          {error && (
            <div className="token-error">
              <span>⚠</span> {error}
            </div>
          )}

          <div className="token-footer">
            Token chỉ được lưu trong <code>localStorage</code> trình duyệt của bạn.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <button
        className="fab-settings"
        onClick={() => setOpen(true)}
        title="Cài đặt kết nối GitHub"
      >
        ⚙
      </button>
    </>
  );
}
