
'use client';
import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import type { ScratchProgrammingQuestion, UserAnswerType } from '../../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../elements/card';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { Button } from '../elements/button'; // Added for retry button

// IMPORTANT: User must manually copy these files from 'node_modules/scratch-blocks/dist/'
// (or equivalent paths in their scratch-blocks version) to the 'public' folder.
//
// Expected structure in 'public' folder:
// public/static/scratch-blocks/
//   js/
//     blockly_compressed_vertical.js (Main engine, layout, renderer for Scratch vertical toolbox)
//     blocks_compressed_vertical.js (Scratch-specific block definitions for vertical toolbox)
//     en.js                         (Or your language file, e.g., from msg/js/en.js - for Blockly.Msg)
//   media/                          (Entire 'media' folder from scratch-blocks)
//   css/                            (CRITICAL: This folder and its contents like vertical.css are needed for styling)
//     vertical.css                  
//
// The CSS file (e.g., /static/scratch-blocks/css/vertical.css) must be linked in the main HTML layout (e.g., layout.tsx)
// or imported globally (e.g., in globals.css) for blocks to render correctly.
// The user has reported difficulty finding CSS files in their 'scratch-blocks' installation, which needs to be resolved.

const SCRATCH_JS_ENGINE_LAYOUT_CANDIDATES = [
  './scratch-blocks/js/blockly_compressed_vertical.js',
  '/static/scratch-blocks/js/blockly_compressed_vertical.js',
];
const SCRATCH_JS_BLOCK_DEFINITIONS_CANDIDATES = [
  './scratch-blocks/js/blocks_compressed_vertical.js',
  '/static/scratch-blocks/js/blocks_compressed_vertical.js',
];
const SCRATCH_JS_MSG_EN_CANDIDATES = [
  './scratch-blocks/msg/js/en.js',
  '/static/scratch-blocks/msg/js/en.js',
];
// const SCRATCH_CSS_PATH = '/static/scratch-blocks/css/vertical.css'; // CSS is handled globally

const loadedScriptPromises = new Map<string, Promise<void>>();

const loadScript = (src: string): Promise<void> => {
  const fullSrc = (src.startsWith('/') || src.startsWith('./')) ? src : `/${src}`;
  if (loadedScriptPromises.has(fullSrc)) {
    const promise = loadedScriptPromises.get(fullSrc)!;
    return promise;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${fullSrc}"]`) as HTMLScriptElement;
    if (existingScript) {
      const status = existingScript.getAttribute('data-load-status');
      if (status === 'loaded') {
        resolve();
        return;
      } else if (status === 'loading') {
        const onLoad = () => {
          existingScript.setAttribute('data-load-status', 'loaded');
          existingScript.removeEventListener('load', onLoad);
          existingScript.removeEventListener('error', onError);
          resolve();
        };
        const onError = (ev: Event) => {
          existingScript.setAttribute('data-load-status', 'error');
          existingScript.removeEventListener('load', onLoad);
          existingScript.removeEventListener('error', onError);
          loadedScriptPromises.delete(fullSrc);
          const errorMsg = `Error event for existing script tag ${src}. Full URL: ${existingScript.src}. Event: ${ev.type}.`;
          console.error("ScratchUI: loadScript error (existing) -", errorMsg);
          reject(new Error(errorMsg));
        };
        existingScript.addEventListener('load', onLoad);
        existingScript.addEventListener('error', onError);
        return;
      } else if (status === 'error') {
        existingScript.remove();
      }
    }

    const script = document.createElement('script');
    script.src = fullSrc;
    script.async = false;
    script.setAttribute('data-load-status', 'loading');

    const onLoad = () => {
      script.setAttribute('data-load-status', 'loaded');
      script.removeEventListener('load', onLoad);
      script.removeEventListener('error', onError);
      resolve();
    };
    const onError = (ev: Event | string) => {
      const errorMsg = `Failed to load new script: ${script.src}. Event: ${typeof ev === 'string' ? ev : ev.type}. Check browser network tab for 404 or other errors. Ensure file exists in public folder and path is correct.`;
      console.error("ScratchUI: loadScript error (new) -", errorMsg, "Full URL attempted:", script.src);
      script.setAttribute('data-load-status', 'error');
      script.removeEventListener('load', onLoad);
      script.removeEventListener('error', onError);
      loadedScriptPromises.delete(fullSrc);
      reject(new Error(errorMsg));
    };
    script.addEventListener('load', onLoad);
    script.addEventListener('error', onError);
    document.body.appendChild(script);
  });

  loadedScriptPromises.set(fullSrc, promise);
  return promise;
};

const loadFirstAvailable = async (paths: string[]): Promise<string> => {
  let lastError: any = null;
  for (const p of paths) {
    try {
      await loadScript(p);
      return p;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error('No script path succeeded');
};


interface ScratchProgrammingQuestionUIProps {
  question: ScratchProgrammingQuestion;
  userAnswer: UserAnswerType | null;
  showCorrectAnswer?: boolean;
}

export interface ScratchProgrammingQuestionUIRef {
  getWorkspaceXml: () => string | null;
}

export const ScratchProgrammingQuestionUI = forwardRef<ScratchProgrammingQuestionUIRef, ScratchProgrammingQuestionUIProps>(({
  question,
  userAnswer,
  showCorrectAnswer = false,
}, ref) => {
  const blocklyDivRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<any | null>(null);
  const [isBlocklyReady, setIsBlocklyReady] = useState(false);
  const [componentError, setComponentError] = useState<string | null>(null);
  const [isLoadingScripts, setIsLoadingScripts] = useState(true);

  const attemptLoadScripts = useCallback(async () => {
    setIsLoadingScripts(true);
    setComponentError(null);
    console.log("ScratchUI: Starting script loading sequence...");

    try {
      // 1. Load the main engine/layout script
      console.log("ScratchUI: Attempting to load Scratch Engine/Layout from candidates:", SCRATCH_JS_ENGINE_LAYOUT_CANDIDATES.join(', '));
      await loadFirstAvailable(SCRATCH_JS_ENGINE_LAYOUT_CANDIDATES);
      const BlocklyGlobalEngine = (window as any).Blockly;
      if (typeof BlocklyGlobalEngine === 'undefined') {
        throw new Error(`Blockly global object (window.Blockly) not found after loading engine script from candidates: ${SCRATCH_JS_ENGINE_LAYOUT_CANDIDATES.join(', ')}`);
      }
      console.log(`ScratchUI: After engine/layout load: Blockly defined: ${!!BlocklyGlobalEngine}, Blockly.Blocks defined: ${!!BlocklyGlobalEngine?.Blocks}, Blockly.Msg defined: ${!!BlocklyGlobalEngine?.Msg}, Blockly.ScratchMsgs defined: ${!!BlocklyGlobalEngine?.ScratchMsgs}`);

      // 2. Load Messages
      console.log("ScratchUI: Attempting to load Messages from candidates:", SCRATCH_JS_MSG_EN_CANDIDATES.join(', '));
      await loadFirstAvailable(SCRATCH_JS_MSG_EN_CANDIDATES);
      let BlocklyGlobalAfterMsg = (window as any).Blockly;
      if (!BlocklyGlobalAfterMsg) throw new Error("Blockly global disappeared after loading message script.");

      console.log(`ScratchUI: After en.js load: Blockly defined: ${!!BlocklyGlobalAfterMsg}, Blockly.Msg defined: ${!!BlocklyGlobalAfterMsg?.Msg}, Keys in Blockly.Msg: ${BlocklyGlobalAfterMsg?.Msg ? Object.keys(BlocklyGlobalAfterMsg.Msg).length : 'N/A'}. Sample Blockly.Msg.LOGIC_HUE: ${BlocklyGlobalAfterMsg?.Msg?.LOGIC_HUE}`);
      
      if (!BlocklyGlobalAfterMsg.Msg || Object.keys(BlocklyGlobalAfterMsg.Msg).length === 0) {
        console.warn("ScratchUI: Blockly.Msg appears unpopulated or empty. Checking if Blockly.ScratchMsgs.addLocaleData can be used...");
        if (BlocklyGlobalAfterMsg.ScratchMsgs && typeof BlocklyGlobalAfterMsg.ScratchMsgs.addLocaleData === 'function') {
          console.log("ScratchUI: Blockly.ScratchMsgs.addLocaleData is available. Attempting to call Blockly.ScratchMsgs.addLocaleData('en').");
          BlocklyGlobalAfterMsg.ScratchMsgs.addLocaleData('en');
          BlocklyGlobalAfterMsg = (window as any).Blockly; // Re-fetch global Blockly
          console.log(`ScratchUI: After attempting addLocaleData('en'): Keys in Blockly.Msg: ${BlocklyGlobalAfterMsg?.Msg ? Object.keys(BlocklyGlobalAfterMsg.Msg).length : 'N/A'}. Sample Blockly.Msg.LOGIC_HUE: ${BlocklyGlobalAfterMsg?.Msg?.LOGIC_HUE}`);
          if (!BlocklyGlobalAfterMsg.Msg || Object.keys(BlocklyGlobalAfterMsg.Msg).length === 0) {
            throw new Error("Blockly.Msg still empty after calling addLocaleData. Message loading failed critically.");
          }
        } else {
          throw new Error("Blockly.Msg is empty, and Blockly.ScratchMsgs.addLocaleData is not available. Message loading failed.");
        }
      }
      
      // 3. Load Block Definitions
      console.log("ScratchUI: Attempting to load Scratch Block Definitions from candidates:", SCRATCH_JS_BLOCK_DEFINITIONS_CANDIDATES.join(', '));
      await loadFirstAvailable(SCRATCH_JS_BLOCK_DEFINITIONS_CANDIDATES);
      const BlocklyGlobalBlocks = (window as any).Blockly;
      if (!BlocklyGlobalBlocks || !BlocklyGlobalBlocks.Blocks) {
        throw new Error(`Blockly.Blocks not defined after loading block definitions from candidates: ${SCRATCH_JS_BLOCK_DEFINITIONS_CANDIDATES.join(', ')}`);
      }
      console.log(`ScratchUI: After block definitions load: Blockly.Blocks defined: ${!!BlocklyGlobalBlocks.Blocks}. Keys: ${BlocklyGlobalBlocks.Blocks ? Object.keys(BlocklyGlobalBlocks.Blocks).slice(0,10).join(', ')+"..." : 'N/A'}. Essential block motion_movesteps defined: ${!!BlocklyGlobalBlocks.Blocks?.motion_movesteps}`);
      if (typeof BlocklyGlobalBlocks.Blocks?.motion_movesteps === 'undefined') {
        throw new Error(`Essential Scratch blocks (e.g., motion_movesteps) not found after loading block definitions. Available blocks: ${Object.keys(BlocklyGlobalBlocks.Blocks || {}).join(', ')}`);
      }
      
      setIsBlocklyReady(true);
      console.log("ScratchUI: All Scratch scripts loaded and essential checks passed. Blockly is ready for injection.");

    } catch (error: any) {
      console.error("ScratchUI: Error during Scratch/Blockly script loading sequence:", error);
      setComponentError(error.message || "Failed to load critical Scratch/Blockly scripts.");
      setIsBlocklyReady(false);
    } finally {
      setIsLoadingScripts(false);
    }
  }, []);

  useEffect(() => {
    attemptLoadScripts();
  }, [attemptLoadScripts]);

  useImperativeHandle(ref, () => ({
    getWorkspaceXml: () => {
      const LocalBlockly = (window as any).Blockly;
      if (workspaceRef.current && LocalBlockly?.Xml) {
        try {
          const xml = LocalBlockly.Xml.workspaceToDom(workspaceRef.current);
          return LocalBlockly.Xml.domToText(xml);
        } catch (e) {
          console.error("ScratchUI: Error serializing Scratch workspace to XML:", e);
          return null;
        }
      }
      return null;
    },
  }));

  const initializeWorkspace = useCallback(() => {
    const LocalBlockly = (window as any).Blockly;
    if (!isBlocklyReady || !blocklyDivRef.current || !LocalBlockly) {
      console.warn("ScratchUI: Conditions not met for workspace initialization. isBlocklyReady:", isBlocklyReady, "blocklyDivRef.current:", !!blocklyDivRef.current, "LocalBlockly:", !!LocalBlockly);
      return;
    }
    
    if (!LocalBlockly.inject || !LocalBlockly.Xml || !LocalBlockly.Blocks || !LocalBlockly.Msg) {
      setComponentError("ScratchUI: Essential Blockly library parts (inject, Xml, Blocks, Msg) are not available for injection.");
      return;
    }
    if (Object.keys(LocalBlockly.Msg).length === 0 || !LocalBlockly.Msg.CATEGORY_MOTION) { 
      setComponentError("ScratchUI: Blockly.Msg is empty or essential messages (like CATEGORY_MOTION) are missing. Messages did not load correctly. Injection might fail.");
      console.error("ScratchUI: Blockly.Msg is empty or missing common keys before injection. Current Msg keys count:", Object.keys(LocalBlockly.Msg).length, "CATEGORY_MOTION:", LocalBlockly.Msg.CATEGORY_MOTION);
      return;
    }
    if (typeof LocalBlockly.Blocks?.motion_movesteps === 'undefined' || typeof LocalBlockly.Blocks?.event_whenflagclicked === 'undefined') {
      const availableBlocks = Object.keys(LocalBlockly.Blocks || {}).join(', ');
      setComponentError(`ScratchUI: Essential Scratch block definitions (e.g., motion_movesteps, event_whenflagclicked) are missing before injection. Available blocks: ${availableBlocks}`);
      return;
    }
    setComponentError(null);

    if (workspaceRef.current && typeof workspaceRef.current.dispose === 'function') {
        try { workspaceRef.current.dispose(); } catch(e) { console.warn("ScratchUI: Minor error disposing previous workspace instance:", e); }
        workspaceRef.current = null;
    }
    
    try {
      console.log("ScratchUI: Attempting to inject Blockly workspace...");
      // DEBUG: Using a simplified toolbox with hardcoded names
      const simplifiedToolbox = `
        <xml xmlns="https://developers.google.com/blockly/xml" id="toolbox-simple-debug" style="display: none">
          <category name="Events" categorystyle="events">
            <block type="event_whenflagclicked"></block>
          </category>
          <category name="Motion" categorystyle="motion">
            <block type="motion_movesteps">
              <value name="STEPS"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
            </block>
            <block type="motion_turnright">
              <value name="DEGREES"><shadow type="math_number"><field name="NUM">15</field></shadow></value>
            </block>
          </category>
          <category name="Looks" categorystyle="looks">
             <block type="looks_sayforsecs">
                <value name="MESSAGE"><shadow type="text"><field name="TEXT">Hello!</field></shadow></value>
                <value name="SECS"><shadow type="math_number"><field name="NUM">2</field></shadow></value>
             </block>
          </category>
        </xml>`;
      
      const actualToolbox = question.toolboxDefinition || simplifiedToolbox;
      console.log("ScratchUI: Using Toolbox Definition:", actualToolbox);
      const mediaPath = (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:')
        ? './scratch-blocks/media/'
        : '/static/scratch-blocks/media/';
      console.log("ScratchUI: Media path:", mediaPath);
      console.log("ScratchUI: Blockly.Msg.CATEGORY_MOTION at inject time:", LocalBlockly.Msg.CATEGORY_MOTION); // Should be "Motion"
      console.log("ScratchUI: Blockly.Colours available:", !!LocalBlockly.Colours);

      const customColours = {
        ...LocalBlockly.Colours,
        workspace: '#ffffff',
        primaryWorkspace: '#ffffff',
        secondaryWorkspace: '#f7f7f7',
        flyout: '#f7f7f7',
        scrollbar: '#cccccc',
        insertionMarker: '#f5a500',
        fieldShadow: 'rgba(0,0,0,0.2)',
        dragShadowOpacity: 0.3,
        text: '#FFFFFF',
        motion: { ...(LocalBlockly.Colours?.motion || {}), primary: '#4C97FF', secondary: '#4280D7', tertiary: '#3373CC', quaternary: '#3373CC' },
        looks: { ...(LocalBlockly.Colours?.looks || {}), primary: '#9966FF', secondary: '#855CD6', tertiary: '#774DCB', quaternary: '#774DCB' },
        sounds: { ...(LocalBlockly.Colours?.sounds || {}), primary: '#CF63CF', secondary: '#C94FC9', tertiary: '#BD42BD', quaternary: '#BD42BD' },
        event: { ...(LocalBlockly.Colours?.event || {}), primary: '#FFBF00', secondary: '#E6AC00', tertiary: '#CC9900', quaternary: '#CC9900' },
        control: { ...(LocalBlockly.Colours?.control || {}), primary: '#FFAB19', secondary: '#EC9C13', tertiary: '#CF8B17', quaternary: '#CF8B17' },
        sensing: { ...(LocalBlockly.Colours?.sensing || {}), primary: '#5CB1D6', secondary: '#47A8D1', tertiary: '#2E8EB8', quaternary: '#2E8EB8' },
        operators: { ...(LocalBlockly.Colours?.operators || {}), primary: '#59C059', secondary: '#46B946', tertiary: '#389438', quaternary: '#389438' },
        pen: { ...(LocalBlockly.Colours?.pen || {}), primary: '#0FBD8C', secondary: '#0DA57A', tertiary: '#0B8E69', quaternary: '#0B8E69' },
        data: { ...(LocalBlockly.Colours?.data || {}), primary: '#FF8C1A', secondary: '#FF8000', tertiary: '#DB6E00', quaternary: '#DB6E00' },
        data_lists: { ...(LocalBlockly.Colours?.data_lists || {}), primary: '#FF661A', secondary: '#FF5500', tertiary: '#E64D00', quaternary: '#E64D00' },
        more: { ...(LocalBlockly.Colours?.more || {}), primary: '#FF6680', secondary: '#FF4D6A', tertiary: '#FF3355', quaternary: '#FF3355' },
      };

      const workspace = LocalBlockly.inject(blocklyDivRef.current, {
        toolbox: actualToolbox, // Use the simplified one for debugging first
        media: mediaPath, 
        scrollbars: true,
        trashcan: !showCorrectAnswer,
        readOnly: showCorrectAnswer,
        // Avoid forcing a renderer to ensure Scratch vertical shapes match exactly
        // renderer: 'zelos', 
        zoom: { controls: true, wheel: true, startScale: 0.75, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 },
        colours: customColours, 
      });
      
      workspaceRef.current = workspace;
      console.log("ScratchUI: Workspace injected successfully.");

      let xmlToLoad: string | null = null;
      if (showCorrectAnswer && question.solutionWorkspaceXML) {
        xmlToLoad = question.solutionWorkspaceXML;
      } else if (typeof userAnswer === 'string' && userAnswer.trim().startsWith('<xml')) {
        xmlToLoad = userAnswer;
      } else if (question.initialWorkspace) {
        xmlToLoad = question.initialWorkspace;
      }

      if (xmlToLoad) {
        try {
            console.log("ScratchUI: Attempting to load XML to workspace:", xmlToLoad.substring(0,100) + "...");
            const dom = LocalBlockly.Xml.textToDom(xmlToLoad);
            LocalBlockly.Xml.domToWorkspace(dom, workspace);
            console.log("ScratchUI: XML loaded to workspace.");
        } catch (xmlError: any) {
            console.error("ScratchUI: Error loading XML to workspace:", xmlError);
            setComponentError(`ScratchUI: Error loading blocks from XML: ${xmlError.message || String(xmlError)}`);
        }
      }
      if (workspace && LocalBlockly.svgResize) {
         LocalBlockly.svgResize(workspace);
         setTimeout(() => {
           if (workspaceRef.current && LocalBlockly.svgResize) LocalBlockly.svgResize(workspaceRef.current);
         }, 100);
      }

    } catch (e: any) {
      console.error("ScratchUI: Error during Blockly.inject or subsequent workspace setup:", e);
      console.error("ScratchUI: Error Details - Name:", e.name, "Message:", e.message, "Stack:", e.stack);
      setComponentError(`ScratchUI: Workspace initialization failed: ${e.message || String(e)}. Check console for details. Toolbox used: ${question.toolboxDefinition ? 'Custom' : 'Default Simplified'}.`);
    }
  }, [question, showCorrectAnswer, userAnswer, isBlocklyReady]);

  useEffect(() => {
    if (isBlocklyReady) {
      initializeWorkspace();
    }
    
    const handleResize = () => {
        const LocalBlocklyResize = (window as any).Blockly;
        if (workspaceRef.current && LocalBlocklyResize?.svgResize) {
            LocalBlocklyResize.svgResize(workspaceRef.current);
        }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (workspaceRef.current && typeof (workspaceRef.current as any).dispose === 'function') {
        if ((window as any).Blockly) { 
          try { (workspaceRef.current as any).dispose(); } catch(e) { console.warn("ScratchUI: Error disposing workspace on unmount:", e); }
        }
        workspaceRef.current = null;
      }
    };
  }, [isBlocklyReady, initializeWorkspace]); 

  const workspaceHeight = showCorrectAnswer ? '300px' : '450px';

  if (isLoadingScripts) {
    return (
      <div style={{ height: workspaceHeight, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid hsl(var(--border))', borderRadius: '0.375rem', backgroundColor: 'hsl(var(--background))' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading Scratch Assets...</p>
        </div>
      </div>
    );
  }

  if (componentError) {
    return (
      <div style={{ height: workspaceHeight, width: '100%', color: 'hsl(var(--destructive))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid hsl(var(--destructive))', borderRadius: '0.375rem', padding: '1rem', backgroundColor: 'hsl(var(--card))' }}>
        <p className="font-semibold text-lg mb-2">Failed to load Scratch Workspace.</p>
        <p className="text-sm text-muted-foreground mb-3 text-center">{componentError}</p>
        <p className="text-xs text-muted-foreground mb-4 text-center">
          Please ensure all Scratch/Blockly JavaScript files are correctly copied to your 
          <code>public/static/scratch-blocks/js</code> directory. Check browser console for more details.
          <br/><strong>CRITICAL: Ensure you have copied the CSS files from <code>node_modules/scratch-blocks/css/</code> (e.g., <code>vertical.css</code>) to <code>public/static/scratch-blocks/css/</code> and linked it in your main layout. Without CSS, blocks will not render correctly.</strong>
        </p>
        <Button onClick={attemptLoadScripts} variant="outline">Try Reloading Scripts</Button>
      </div>
    );
  }
  
  if (!isBlocklyReady && !isLoadingScripts) { 
     return (
      <div style={{ height: workspaceHeight, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid hsl(var(--border))', borderRadius: '0.375rem', backgroundColor: 'hsl(var(--background))' }}>
        <p className="text-muted-foreground">Scratch environment did not initialize (Blockly not ready). Check console for script loading errors.</p>
      </div>
    );
  }

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader className="p-0 pb-4">
        <MarkdownRenderer content={question.prompt} />
        {question.points && <CardDescription className="text-sm text-muted-foreground">Points: {question.points}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0">
        {/* WARNING: If CSS (e.g., vertical.css from scratch-blocks) is not loaded globally, the blocks will not render correctly. */}
        {/* The user reported issues finding the CSS, which is a critical problem for visual rendering. */}
        <div 
          ref={blocklyDivRef} 
          className="scratch-theme"
          style={{ 
            height: workspaceHeight, 
            width: '100%', 
            borderRadius: '0.375rem', 
            backgroundColor: 'hsl(var(--card))', 
            position: 'relative',
            userSelect: 'none',
            overflow: 'hidden',
            display: (isLoadingScripts || componentError || !isBlocklyReady) ? 'none' : 'block'
          }}
          aria-label={`Scratch programming workspace for question: ${question.prompt}`}
        />
        {showCorrectAnswer && question.explanation && (
          <div className="mt-4 p-3 bg-accent/20 border border-accent rounded-md">
            <p className="text-sm font-semibold text-accent-foreground">Explanation:</p>
            <MarkdownRenderer content={question.explanation} />
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ScratchProgrammingQuestionUI.displayName = 'ScratchProgrammingQuestionUI';

