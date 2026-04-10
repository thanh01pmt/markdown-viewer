import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { useStore } from '../store/useStore';

export function useSearch(query) {
  const { lessons, slides, matrix, assets, codeFiles } = useStore();

  const searchData = useMemo(() => {
    const data = [];

    // Index Lessons
    (lessons || []).forEach(l => {
      data.push({
        id: l.path,
        type: 'lesson',
        title: l.name,
        subtitle: l.path,
        original: l
      });
    });

    // Index Slides
    (slides || []).forEach(s => {
      data.push({
        id: s.path,
        type: 'slide',
        title: s.name,
        subtitle: s.path,
        original: s
      });
    });

    // Index Matrix
    (matrix || []).forEach(m => {
      data.push({
        id: `matrix-${m.lessonId}`,
        type: 'matrix',
        title: m.lessonId,
        subtitle: m.objective,
        meta: `${m.standard} ${m.resources} ${m.deliverables}`,
        original: m
      });
    });

    // Index Assets
    (assets || []).forEach(a => {
      data.push({
        id: a.path,
        type: 'asset',
        title: a.displayName || a.name,
        subtitle: a.path,
        original: a
      });
    });

    // Index Code
    (codeFiles || []).forEach(c => {
      data.push({
        id: c.path,
        type: 'code',
        title: c.displayName || c.name,
        subtitle: c.path,
        original: c
      });
    });

    return data;
  }, [lessons, slides, matrix, assets, codeFiles]);

  const fuse = useMemo(() => {
    return new Fuse(searchData, {
      keys: [
        { name: 'title', weight: 1.0 },
        { name: 'subtitle', weight: 0.7 },
        { name: 'meta', weight: 0.4 }
      ],
      threshold: 0.3,
      includeMatches: true,
      ignoreLocation: true
    });
  }, [searchData]);

  const results = useMemo(() => {
    if (!query) return [];
    return fuse.search(query).map(r => r.item);
  }, [fuse, query]);

  return { results };
}
