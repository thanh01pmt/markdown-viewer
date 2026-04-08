import React, { useState } from 'react';

export interface NavItem {
  title: string;
  slug: string;
  type: string;
}

interface SidebarProps {
  programId: string;
  lessons: NavItem[];
  slides: NavItem[];
  activities: NavItem[];
  currentSlug?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  programId, 
  lessons, 
  slides, 
  activities, 
  currentSlug 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sections = [
    { 
      title: 'Lessons', 
      items: lessons, 
      icon: '📖', 
      color: 'bg-primary-500', 
      textColor: 'text-primary-500',
      type: 'lessons'
    },
    { 
      title: 'Slides', 
      items: slides, 
      icon: '🖼️', 
      color: 'bg-amber-500', 
      textColor: 'text-amber-500',
      type: 'slides'
    },
    { 
      title: 'Activities', 
      items: activities, 
      icon: '💻', 
      color: 'bg-emerald-500', 
      textColor: 'text-emerald-500',
      type: 'activities'
    },
  ].filter(s => s.items.length > 0);

  const isActive = (itemSlug: string, type: string) => {
    return currentSlug === itemSlug;
  };

  return (
    <aside 
      className={`relative transition-all duration-500 ease-in-out border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl h-screen sticky top-0 flex flex-col ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 z-10 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-slate-400 hover:text-primary-500"
      >
        <span className={`text-xs transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
          ◀
        </span>
      </button>

      {/* Header */}
      <div className={`p-6 mb-2 flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
          <span className="text-white text-xs font-bold">CP</span>
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              {programId}
            </h2>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Course Platform</p>
          </div>
        )}
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto px-3 space-y-8 scrollbar-hide pb-8">
        {sections.map((section) => (
          <div key={section.title} className="space-y-2">
            {!isCollapsed ? (
              <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                {section.title}
              </h3>
            ) : (
              <div className="h-0.5 w-6 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full" />
            )}
            
            <nav className="space-y-1">
              {section.items.map((item) => (
                <a
                  key={item.slug}
                  href={`/${programId}/${section.type}/${item.slug}`}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                    isActive(item.slug, section.type)
                      ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={item.title}
                >
                  {/* Indicator Line */}
                  {isActive(item.slug, section.type) && (
                    <div className="absolute left-0 w-1 h-5 bg-primary-500 rounded-r-full" />
                  )}

                  <span className={`text-lg shrink-0 transition-transform duration-300 group-hover:scale-125 ${
                    isActive(item.slug, section.type) ? 'scale-110' : 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100'
                  }`}>
                    {section.icon}
                  </span>

                  {!isCollapsed && (
                    <span className={`text-sm font-medium truncate ${
                      isActive(item.slug, section.type) ? 'font-semibold' : ''
                    }`}>
                      {item.title}
                    </span>
                  )}

                  {/* Tooltip for Collapsed State */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-[10px] font-medium rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                      {item.title}
                    </div>
                  )}
                </a>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer / User Profile Placeholder */}
      <div className={`p-4 mt-auto border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/10 ${isCollapsed ? 'items-center' : ''}`}>
         {!isCollapsed ? (
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
             <div className="space-y-1">
               <div className="w-20 h-2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
               <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
             </div>
           </div>
         ) : (
           <div className="w-8 h-8 mx-auto rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
         )}
      </div>
    </aside>
  );
};
