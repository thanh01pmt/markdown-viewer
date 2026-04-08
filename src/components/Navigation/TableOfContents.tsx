import React, { useEffect, useState } from 'react';

export const TableOfContents: React.FC = () => {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

  useEffect(() => {
    // Tìm các thẻ H2 trong bài viết (chúng ta quy định H1 là tiêu đề chính, TOC bắt đầu từ H2)
    const elements = Array.from(document.querySelectorAll('h2, h3'));
    const items = elements.map((el, index) => {
      // Đảm bảo mỗi heading có một ID để scroll
      if (!el.id) {
        el.id = `section-${index}`;
      }
      return {
        id: el.id,
        text: el.textContent || '',
        level: parseInt(el.tagName.replace('H', ''))
      };
    });
    setHeadings(items);
  }, []);

  if (headings.length === 0) return null;

  return (
    <div className="hidden xl:block fixed right-8 top-8 w-64 max-h-[80vh] overflow-y-auto">
      <h4 className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-4 px-2">
        Trong chương này
      </h4>
      <nav className="space-y-1">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={`block py-1.5 px-2 text-sm transition-all duration-200 border-l-2 hover:bg-primary-500/5 ${
              heading.level === 3 ? 'ml-4 border-transparent text-foreground/40' : 'border-transparent text-foreground/60'
            } hover:text-primary-600 hover:border-primary-500`}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  );
};
