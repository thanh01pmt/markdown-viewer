import { useEffect, useState, useRef, useMemo } from 'react';

export function LessonOutline({ content, scrollContainerRef }) {
  const [activeId, setActiveId] = useState(null);
  const observerRef = useRef(null);

  const headings = useMemo(() => {
    if (!content) return [];
    const matches = Array.from(content.matchAll(/^(#{1,3})\s+(.+)$/gm));
    return matches.map(m => {
      const level = m[1].length;
      const text = m[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // remove special chars
        .trim()
        .replace(/[-\s]+/g, '-'); // replace spaces/hyphens with single hyphen

      return { level, text, id };
    });
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    if (observerRef.current) observerRef.current.disconnect();

    const handleIntersect = (entries) => {
      const visibleEntry = entries.find(entry => entry.isIntersecting);
      if (visibleEntry) {
        setActiveId(visibleEntry.target.id);
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      root: scrollContainerRef?.current || null,
      rootMargin: '-10% 0px -80% 0px',
      threshold: 0
    });

    headings.forEach(h => {
      const el = document.getElementById(h.id);
      if (el) observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings, scrollContainerRef]);

  if (headings.length === 0) return null;

  return (
    <div className="lesson-outline">
      <div className="outline-hdr">Outline</div>
      <div className="outline-list">
        {headings.map((h, i) => (
          <a
            key={`${h.id}-${i}`}
            href={`#${h.id}`}
            className={`outline-item outline-item--h${h.level} ${activeId === h.id ? 'outline-item--active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {h.text}
          </a>
        ))}
      </div>
    </div>
  );
}
