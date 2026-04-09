import { useEffect, useState, useRef, useMemo } from 'react';
import GithubSlugger from 'github-slugger';

export function LessonOutline({ content, scrollContainerRef, isDialog, onClose }) {
  const [activeId, setActiveId] = useState(null);
  const [filterText, setFilterText] = useState('');
  const observerRef = useRef(null);

  const headings = useMemo(() => {
    if (!content) return [];
    const slugger = new GithubSlugger();
    // Strip frontmatter before parsing headings
    const stripped = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, '');
    const matches = Array.from(stripped.matchAll(/^(#{1,3})\s+(.+)$/gm));
    return matches.map(m => {
      const level = m[1].length;
      const text = m[2].trim();
      const id = slugger.slug(text);
      return { level, text, id };
    });
  }, [content]);

  const filtered = useMemo(() => {
    if (!filterText) return headings;
    return headings.filter(h =>
      h.text.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [headings, filterText]);

  useEffect(() => {
    if (headings.length === 0) return;
    if (observerRef.current) observerRef.current.disconnect();

    const handleIntersect = (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
          break;
        }
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      root: scrollContainerRef?.current || null,
      rootMargin: '-10% 0px -75% 0px',
      threshold: 0,
    });

    headings.forEach(h => {
      const el = document.getElementById(h.id);
      if (el) observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings, scrollContainerRef]);

  const handleItemClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const container = scrollContainerRef?.current;
      if (container) {
        const top = el.offsetTop - 24;
        container.scrollTo({ top, behavior: 'smooth' });
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setActiveId(id);
      if (isDialog && onClose) onClose();
    }
  };

  if (headings.length === 0) return null;

  const inner = (
    <div className="outline-inner">
      <div className="outline-hdr">
        <span>Outline</span>
        {isDialog && (
          <button className="outline-close-btn" onClick={onClose} title="Đóng">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
            </svg>
          </button>
        )}
      </div>
      <div className="outline-filter">
        <input
          type="text"
          placeholder="Filter headings"
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          className="outline-filter-input"
        />
      </div>
      <div className="outline-list">
        {filtered.map((h, i) => (
          <a
            key={`${h.id}-${i}`}
            href={`#${h.id}`}
            className={`outline-item outline-item--h${h.level} ${activeId === h.id ? 'outline-item--active' : ''}`}
            onClick={(e) => handleItemClick(e, h.id)}
          >
            {h.text}
          </a>
        ))}
        {filtered.length === 0 && (
          <div className="outline-empty">Không tìm thấy</div>
        )}
      </div>
    </div>
  );

  if (isDialog) {
    return (
      <div className="outline-dialog-overlay" onClick={onClose}>
        <div className="outline-dialog" onClick={e => e.stopPropagation()}>
          {inner}
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-outline">
      {inner}
    </div>
  );
}
