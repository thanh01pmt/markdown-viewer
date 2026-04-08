// FILE: src/lib/interactive-quiz-kit/react-ui/components/ui/BlocklyProgrammingQuestionUI.tsx
// ================================================================================
// VERSION 2 - INTEGRATED MarkdownRenderer

'use client';
import React, { useEffect, useRef, useState, useCallback, useImperativeHandle } from 'react';
import type { BlocklyProgrammingQuestion, UserAnswerType } from '../../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../elements/card';
import { MarkdownRenderer } from '../common/MarkdownRenderer'; // *** NEW IMPORT ***

// ... (toàn bộ logic loadScript và useBlocklyLoader không thay đổi)
const loadScript = (src: string, async = true): Promise<void> => {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      const readyState = (existingScript as any).readyState;
      if (readyState && readyState !== 'loaded' && readyState !== 'complete') {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject(new Error(`Error event for existing script: ${src}`)));
      } else if ((window as any).Blockly && src.includes('blockly.min.js') && (window as any).Blockly.Blocks && (window as any).Blockly.JavaScript) {
        resolve(); 
      } else if ((window as any).Blockly && src.includes('blockly.min.js') && !(window as any).Blockly.Blocks && src.includes('blocks.min.js')) {
         existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject(new Error(`Error event for existing script (blocks): ${src}`)));
      } else if ((window as any).Blockly && src.includes('blockly.min.js') && !(window as any).Blockly.JavaScript && src.includes('javascript.min.js')) {
         existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject(new Error(`Error event for existing script (JS gen): ${src}`)));
      }
      else {
        resolve();
      }
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = async;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load new script: ${src}`));
    document.head.appendChild(script);
  });
};

const loadBlocklyScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof (window as any).Blockly?.Blocks !== 'undefined' &&
        typeof (window as any).Blockly?.JavaScript !== 'undefined') {
      resolve();
      return;
    }

    const cdnOptions = [
      {
        name: 'cdnjs',
        mainSrc: 'https://cdnjs.cloudflare.com/ajax/libs/blockly/9.0.0/blockly.min.js',
        blocksSrc: 'https://cdnjs.cloudflare.com/ajax/libs/blockly/9.0.0/blocks.min.js',
        generatorSrc: 'https://cdnjs.cloudflare.com/ajax/libs/blockly/9.0.0/javascript.min.js',
        mediaPath: 'https://cdnjs.cloudflare.com/ajax/libs/blockly/9.0.0/media/'
      },
      {
        name: 'unpkg',
        mainSrc: 'https://unpkg.com/blockly@9.0.0/blockly.min.js',
        blocksSrc: 'https://unpkg.com/blockly@9.0.0/blocks.min.js',
        generatorSrc: 'https://unpkg.com/blockly@9.0.0/javascript.min.js',
        mediaPath: 'https://unpkg.com/blockly@9.0.0/media/'
      },
      {
        name: 'jsdelivr',
        mainSrc: 'https://cdn.jsdelivr.net/npm/blockly@9.0.0/blockly.min.js',
        blocksSrc: 'https://cdn.jsdelivr.net/npm/blockly@9.0.0/blocks.min.js',
        generatorSrc: 'https://cdn.jsdelivr.net/npm/blockly@9.0.0/javascript.min.js',
        mediaPath: 'https://cdn.jsdelivr.net/npm/blockly@9.0.0/media/'
      }
    ];

    const tryLoadFromCDN = async (cdnIndex: number): Promise<void> => {
      if (cdnIndex >= cdnOptions.length) {
        throw new Error('All Blockly CDN loading options failed');
      }
      const cdn = cdnOptions[cdnIndex];
      try {
        await loadScript(cdn.mainSrc);
        const BlocklyGlobal = (window as any).Blockly;
        if (typeof BlocklyGlobal === 'undefined') throw new Error(`Blockly global not found from ${cdn.name}.`);
        
        if (BlocklyGlobal.utils?.global?.setPaths) {
            BlocklyGlobal.utils.global.setPaths(cdn.mediaPath);
        } else if (BlocklyGlobal.utils?.global) {
            BlocklyGlobal.utils.global.blocklyPath = cdn.mediaPath;
            BlocklyGlobal.MEDIA = cdn.mediaPath;
        } else {
            BlocklyGlobal.MEDIA = cdn.mediaPath;
        }
        await Promise.all([loadScript(cdn.blocksSrc), loadScript(cdn.generatorSrc)]);
        if (typeof BlocklyGlobal.Blocks === 'undefined') throw new Error(`Blockly.Blocks not found from ${cdn.name}.`);
        if (typeof BlocklyGlobal.JavaScript === 'undefined') throw new Error(`Blockly.JavaScript not found from ${cdn.name}.`);
        resolve(); 
      } catch (error) {
        await tryLoadFromCDN(cdnIndex + 1); 
      }
    };
    tryLoadFromCDN(0).catch(reject);
  });
};

const useBlocklyLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const attemptLoad = useCallback(() => {
    setLoadError(null); 
    setIsReady(false);  
    loadBlocklyScript()
      .then(() => {
        setIsReady(true); setIsLoading(false); setLoadError(null);
      })
      .catch((error) => {
        setLoadError(error.message || "Unknown error loading Blockly.");
        setIsLoading(false); setIsReady(false);
      });
  }, []);

  useEffect(() => {
    if (isLoading && !isReady && !loadError) attemptLoad();
  }, [isLoading, isReady, loadError, attemptLoad]);

  const retry = useCallback(() => {
    setLoadError(null); setIsReady(false); setIsLoading(true); 
  }, []);

  return { isLoading, loadError, isReady, retry };
};


interface BlocklyProgrammingQuestionUIProps {
  question: BlocklyProgrammingQuestion;
  onAnswerChange: (answer: UserAnswerType) => void; 
  userAnswer: UserAnswerType | null; 
  showCorrectAnswer?: boolean;
}

export interface BlocklyProgrammingQuestionUIRef {
  getWorkspaceXml: () => string | null;
}

export const BlocklyProgrammingQuestionUI = React.forwardRef<BlocklyProgrammingQuestionUIRef, BlocklyProgrammingQuestionUIProps>(({
  question,
  userAnswer, 
  showCorrectAnswer = false,
}, ref) => {
  const blocklyDivRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<any>(null);
  const [isInitializingComponent, setIsInitializingComponent] = useState(false);
  const [componentError, setComponentError] = useState<string | null>(null);

  const { isLoading: blocklyLoading, loadError: blocklyLoadError, isReady: blocklyReady, retry } = useBlocklyLoader();

  // ... (useImperativeHandle và các logic khác không thay đổi)
  useImperativeHandle(ref, () => ({
    getWorkspaceXml: () => {
      if (workspaceRef.current && blocklyReady) {
        const LocalBlockly = (window as any).Blockly;
        if (!LocalBlockly?.Xml?.workspaceToDom || !LocalBlockly?.Xml?.domToText) {
          console.warn("Blockly.Xml methods not available for XML serialization in getWorkspaceXml.");
          return null;
        }
        try {
          const xml = LocalBlockly.Xml.workspaceToDom(workspaceRef.current);
          return LocalBlockly.Xml.domToText(xml);
        } catch (e) {
          console.error("Error serializing Blockly workspace to XML in getWorkspaceXml:", e);
          return null;
        }
      }
      return null;
    },
  }));

  const initializeBlocklyWorkspace = useCallback(() => {
    if (!blocklyReady || !blocklyDivRef.current) return;

    const LocalBlockly = (window as any).Blockly;
    if (!LocalBlockly?.inject || !LocalBlockly?.Xml || !LocalBlockly?.Events || !LocalBlockly?.Themes) {
      setComponentError("Blockly library not fully loaded."); 
      setIsInitializingComponent(false); 
      return;
    }
    setComponentError(null);
    
    let newXmlToLoad: string | null = null;
    if (showCorrectAnswer && question.solutionWorkspaceXML) {
      newXmlToLoad = question.solutionWorkspaceXML;
    } else if (typeof userAnswer === 'string' && userAnswer.trim().startsWith('<xml')) {
      newXmlToLoad = userAnswer;
    } else if (question.initialWorkspace) {
      newXmlToLoad = question.initialWorkspace;
    }

    if (workspaceRef.current) {
      let currentWorkspaceXML = '';
      try {
        currentWorkspaceXML = LocalBlockly.Xml.domToText(LocalBlockly.Xml.workspaceToDom(workspaceRef.current));
      } catch (e) { /* ignore */ }

      const readOnlyStateMatches = workspaceRef.current.options.readOnly === showCorrectAnswer;

      if (currentWorkspaceXML === newXmlToLoad && readOnlyStateMatches) {
        setIsInitializingComponent(false);
        return; 
      }
      
      if (currentWorkspaceXML === newXmlToLoad && !readOnlyStateMatches) {
        workspaceRef.current.updateOptions({ readOnly: showCorrectAnswer, trashcan: !showCorrectAnswer });
        setIsInitializingComponent(false);
        return;
      }
    }
    
    setIsInitializingComponent(true);

    if (workspaceRef.current?.dispose) {
      try { 
        workspaceRef.current.dispose(); 
      } catch (e) { 
        console.error("Error disposing previous workspace:", e); 
      }
      workspaceRef.current = null;
    }
    
    try {
      const toolbox = question.toolboxDefinition || `<xml><category name="Logic" colour="210"><block type="controls_if"></block></category></xml>`;
      
      const workspace = LocalBlockly.inject(blocklyDivRef.current, {
        toolbox: toolbox, 
        scrollbars: true, 
        trashcan: !showCorrectAnswer, 
        readOnly: showCorrectAnswer,
        zoom: { 
          controls: true, 
          wheel: true, 
          startScale: 0.9, 
          maxScale: 3, 
          minScale: 0.3, 
          scaleSpeed: 1.2 
        },
        grid: { 
          spacing: 20, 
          length: 3, 
          colour: '#374151', 
          snap: true 
        },
        theme: LocalBlockly.Themes.Classic || undefined,
        move: {
          scrollbars: {
            horizontal: true,
            vertical: true
          },
          drag: true,
          wheel: true
        },
        renderer: 'geras'
      });
      
      workspaceRef.current = workspace;

      if (newXmlToLoad) {
        try {
          const dom = LocalBlockly.Xml.textToDom(newXmlToLoad);
          LocalBlockly.Xml.domToWorkspace(dom, workspace);
        } catch (e) {
          console.error("Error loading XML to workspace:", e, "XML:", newXmlToLoad);
          setComponentError("Error loading blocks.");
        }
      }

      if (workspace.scrollCenter) workspace.scrollCenter();
      if (LocalBlockly.svgResize) LocalBlockly.svgResize(workspace);

      setTimeout(() => {
        if (workspace && LocalBlockly.svgResize) {
          LocalBlockly.svgResize(workspace);
        }
      }, 100);

    } catch (e) {
      console.error("Error initializing Blockly workspace:", e);
      setComponentError(`Init failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsInitializingComponent(false);
    }
  }, [
    blocklyReady, 
    question.toolboxDefinition, 
    question.initialWorkspace, 
    question.solutionWorkspaceXML, 
    showCorrectAnswer, 
    userAnswer
  ]); 

  useEffect(() => {
    if (blocklyReady && blocklyDivRef.current) {
      initializeBlocklyWorkspace();
    }
    return () => {
      if (workspaceRef.current?.dispose) {
        try { 
          workspaceRef.current.dispose(); 
        } catch (disposeError) { 
          console.error("Error during Blockly workspace disposal on unmount:", disposeError); 
        }
        workspaceRef.current = null;
      }
    };
  }, [blocklyReady, initializeBlocklyWorkspace]);

  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (workspaceRef.current && blocklyReady) {
          const LocalBlockly = (window as any).Blockly;
          if (LocalBlockly?.svgResize) {
            LocalBlockly.svgResize(workspaceRef.current);
          }
        }
      }, 150);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [blocklyReady]);

  const workspaceHeight = showCorrectAnswer ? '300px' : '450px'; 
  const workspaceContainerId = `blockly-workspace-container-${question.id}`;

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader className="p-0 pb-4">
        {/* *** CHANGED: Use MarkdownRenderer for the prompt *** */}
        <CardTitle className="text-xl mb-1 font-body">
          <MarkdownRenderer content={question.prompt} />
        </CardTitle>
        {question.points && <CardDescription className="text-sm text-muted-foreground">Points: {question.points}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0">
        {/* ... (phần hiển thị loading/error không thay đổi) ... */}
        {blocklyLoading && (
          <div 
            style={{ 
              height: workspaceHeight, 
              width: '100%', 
              borderRadius: '0.375rem', 
              border: '1px solid hsl(var(--border))', 
              backgroundColor: 'hsl(var(--background))' 
            }} 
            className="flex items-center justify-center"
          >
            <div className="text-center">
              <p className="text-muted-foreground animate-pulse mb-2">Loading Blockly Environment...</p>
              <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        )}
        
        {blocklyLoadError && !blocklyLoading && (
          <div 
            style={{ 
              height: workspaceHeight, 
              width: '100%', 
              borderRadius: '0.375rem', 
              border: '1px solid hsl(var(--destructive))', 
              backgroundColor: 'hsl(var(--card))' 
            }} 
            className="flex items-center justify-center p-4"
          >
            <div className="text-destructive text-center">
              <p className="font-semibold text-lg">Failed to load Blockly</p>
              <p className="text-sm mt-2 mb-3">{blocklyLoadError}</p>
              <div className="space-x-2"> 
                <button 
                  onClick={retry} 
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors text-sm"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        )}
        
        {!blocklyLoading && !blocklyLoadError && (
          <div
            id={workspaceContainerId}
            ref={blocklyDivRef}
            style={{
              height: workspaceHeight, 
              width: '100%', 
              borderRadius: '0.375rem', 
              border: `1px solid ${componentError ? 'hsl(var(--destructive))' : 'hsl(var(--border))'}`,
              backgroundColor: 'hsl(var(--card))', 
              position: 'relative',
              userSelect: 'none',
              overflow: 'hidden'
            }}
            aria-label={`Blockly programming workspace for question: ${question.prompt}`}
          >
            {/* ... (phần hiển thị initializing/componentError không thay đổi) ... */}
          </div>
        )}
        
        {showCorrectAnswer && question.explanation && (
          <div className="mt-4 p-3 bg-accent/20 border border-accent rounded-md">
            <p className="text-sm font-semibold text-accent-foreground">Explanation:</p>
            {/* *** CHANGED: Use MarkdownRenderer for the explanation *** */}
            <MarkdownRenderer content={question.explanation} className="text-sm text-accent-foreground/80" />
          </div>
        )}
      </CardContent>
    </Card>
  );
});

BlocklyProgrammingQuestionUI.displayName = 'BlocklyProgrammingQuestionUI';