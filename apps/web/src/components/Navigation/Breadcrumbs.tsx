import React from 'react';

interface BreadcrumbsProps {
  programId: string;
  type?: string;
  slug?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ programId, type, slug }) => {
  const formatLabel = (txt: string) => {
    return txt.split(/[-_]/).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <nav className="flex items-center space-x-2 text-sm font-medium text-foreground/50 mb-6">
      <a href="/" className="hover:text-primary-500 transition-colors">Home</a>
      
      <div className="flex items-center space-x-2">
        <span className="text-foreground/20">/</span>
        <span className="text-foreground/70">{formatLabel(programId)}</span>
      </div>

      {type && (
        <div className="flex items-center space-x-2">
          <span className="text-foreground/20">/</span>
          <span className="text-foreground/70">{formatLabel(type)}</span>
        </div>
      )}

      {slug && (
        <div className="flex items-center space-x-2">
          <span className="text-foreground/20">/</span>
          <span className="font-semibold text-primary-600 dark:text-primary-400">
            {formatLabel(slug)}
          </span>
        </div>
      )}
    </nav>
  );
};
