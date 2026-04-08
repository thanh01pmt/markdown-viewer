import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  code: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ code }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter',
    });

    if (containerRef.current) {
      containerRef.current.innerHTML = code;
      mermaid.contentLoaded();
    }
  }, [code]);

  return (
    <div className="my-8 flex justify-center overflow-hidden rounded-2xl bg-white/5 p-8 border border-white/10 backdrop-blur-sm">
      <div ref={containerRef} className="mermaid w-full max-w-2xl flex justify-center" />
    </div>
  );
};
