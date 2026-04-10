import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useSearch } from '../hooks/useSearch';
import { 
  FileText, 
  Presentation, 
  Table, 
  FileCode, 
  Search, 
  X,
  Command,
  ArrowRight
} from 'lucide-react';

export function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const { selectLesson } = useStore();
  const { results = [] } = useSearch(query);

  const handleSelect = useCallback((item) => {
    if (item.type === 'lesson' || item.type === 'slide') {
      selectLesson(item.original, item.type);
    } else if (item.type === 'matrix') {
      // Logic for matrix navigation can be added if DashboardPage supports deep linking to matrix cells
    }
    onClose();
  }, [selectLesson, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setQuery('');
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(results.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(results.length, 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, handleSelect, onClose]);

  const getIcon = (type) => {
    switch (type) {
      case 'lesson': return <FileText size={18} />;
      case 'slide': return <Presentation size={18} />;
      case 'matrix': return <Table size={18} />;
      case 'code': return <FileCode size={18} />;
      default: return <Search size={18} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="command-palette-overlay" onClick={onClose}>
          <motion.div 
            className="command-palette"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="cp-header">
              <Search className="cp-search-icon" size={20} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search anything... (lessons, slides, code)"
                spellCheck={false}
              />
              <X className="cp-close" size={18} onClick={onClose} />
            </div>

            <div className="cp-results custom-scrollbar">
              {results.length > 0 ? (
                results.map((item, idx) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className={`cp-item ${idx === selectedIndex ? 'active' : ''}`}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => handleSelect(item)}
                  >
                    <div className={`cp-item-icon ${item.type}`}>
                      {getIcon(item.type)}
                    </div>
                    <div className="cp-item-content">
                      <div className="cp-item-title">{item.title}</div>
                      <div className="cp-item-subtitle">{item.subtitle}</div>
                    </div>
                    {idx === selectedIndex && (
                      <div className="cp-item-hint">
                        <ArrowRight size={12} />
                      </div>
                    )}
                  </div>
                ))
              ) : query ? (
                <div className="cp-empty">
                  No results found for "{query}"
                </div>
              ) : (
                <div className="cp-tips">
                  <div className="cp-tip">
                    <Command size={14} /> <span>Press K to search from anywhere</span>
                  </div>
                  <div className="cp-tip">
                    <ArrowRight size={14} /> <span>Type to filter lessons, slides, and code</span>
                  </div>
                </div>
              )}
            </div>

            <div className="cp-footer">
              <div className="cp-legend">
                <span><kbd>↑↓</kbd> to navigate</span>
                <span><kbd>↵</kbd> to select</span>
                <span><kbd>esc</kbd> to close</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
