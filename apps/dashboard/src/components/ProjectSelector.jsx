import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';

export function ProjectSelector() {
  const { activeProject, projects, setProjectByPath } = useStore();
  const currentProject = projects.find(p => p.path === activeProject) || { name: activeProject, path: activeProject };
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = projects.filter(p => 
    p?.name?.toLowerCase().includes(search.toLowerCase()) || 
    p?.path?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="project-selector" ref={dropdownRef}>
      <button className="proj-sel-btn" onClick={() => setIsOpen(!isOpen)}>
        <span className="proj-sel-icon">⬢</span>
        <span className="proj-sel-name">{currentProject?.name || 'Chọn dự án...'}</span>
        <span className="proj-sel-caret">▼</span>
      </button>

      {isOpen && (
        <div className="proj-sel-dropdown">
          <div className="proj-sel-search">
            <input 
              type="text" 
              placeholder="Tìm dự án..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="proj-sel-list">
            {filtered.length > 0 ? (
              filtered.map(p => (
                <div 
                  key={p.path} 
                  className={`proj-sel-item ${activeProject === p.path ? 'proj-sel-item--active' : ''}`}
                  onClick={() => {
                    setProjectByPath(p.path);
                    setIsOpen(false);
                  }}
                >
                  <div className="proj-item-name">{p.name}</div>
                  <div className="proj-item-path" style={{ fontSize: '10px', opacity: 0.5 }}>{p.path}</div>
                </div>
              ))
            ) : (
              <div className="proj-sel-empty">Không tìm thấy dự án</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
