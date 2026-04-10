import React from 'react';

const AuditBadge = ({ score, placeholders }) => {
  if (score === undefined) return null;

  const getColor = (s) => {
    if (s >= 90) return '#10b981'; // Green
    if (s >= 70) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <div className="audit-badge" style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '6px',
      fontFamily: 'inherit'
    }}>
      <div 
        style={{ 
          backgroundColor: getColor(score), 
          color: 'white', 
          padding: '2px 8px', 
          borderRadius: '12px', 
          fontSize: '0.7rem',
          fontWeight: '700',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          textShadow: '0 1px 1px rgba(0,0,0,0.1)'
        }}
      >
        {score}%
      </div>
      {placeholders > 0 && (
        <span 
          title={`${placeholders} placeholders pending ([ ])`} 
          style={{ 
            fontSize: '0.9rem',
            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))',
            cursor: 'help'
          }}
        >
          🚧
        </span>
      )}
    </div>
  );
};

export default AuditBadge;
