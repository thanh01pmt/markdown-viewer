"use client";

import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { CSSProperties } from "react";
import initTranslations from "../../../vendor/scratchblocks/translations-vi";

type BlockStyle = "scratch3" | "scratch2" | "scratch3-high-contrast";

interface ScratchBlocksRendererProps {
  code: string;
  blockStyle?: BlockStyle;
  fromLang?: "en" | "vi";
  toLang?: "en" | "vi" | null;
  className?: string;
  style?: CSSProperties;
  onRendered?: (svg: string, pngDataUrl: string) => void;
}

export const ScratchBlocksRenderer: React.FC<ScratchBlocksRendererProps> = ({
  code,
  blockStyle = "scratch3",
  fromLang = "en",
  toLang = null,
  className,
  style,
  onRendered,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderIdRef = useRef(0);
  const { i18n } = useTranslation();

  useEffect(() => {
    const myRunId = renderIdRef.current + 1;
    renderIdRef.current = myRunId;
    const run = async () => {
      if (!containerRef.current || !code) return;

      try {
        const mod: any = await import("../../../../../scratch-block-render/src/utils/scratchblocks/scratchblocks-teky.min.es.js");
        const scratchblocks: any = mod?.default ?? mod;

        initTranslations(scratchblocks);

        const parseOptions: any = { languages: [] };
        if (fromLang === "en") parseOptions.languages.push("en", "vi");
        else if (fromLang === "vi") parseOptions.languages.push("vi", "en");

        const doc = scratchblocks.parse(code, parseOptions);

        const effectiveToLang = toLang ?? (i18n.language === "vi" ? "vi" : "en");
        if (effectiveToLang) {
          const allLangs = (scratchblocks as any).allLanguages;
          const langPack = allLangs?.[effectiveToLang];
          if (langPack) {
            doc.translate(langPack);
          }
        }

        const viewOptions: any = {
          style: blockStyle,
          scale: /^scratch3($|-)/.test(blockStyle) ? 0.675 : 1,
        };
        const view = scratchblocks.newView(doc, viewOptions);
        const svgEl = view.render();
        svgEl.classList.add("scratchblocks-style-" + blockStyle);
        if (renderIdRef.current !== myRunId || !containerRef.current) return;
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(svgEl);

        const exportSVG: string = view.exportSVG();
        view.exportPNG((pngDataURL: string) => {
          if (renderIdRef.current !== myRunId) return;
          if (typeof onRendered === "function") onRendered(exportSVG, pngDataURL);
        }, 3);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (containerRef.current && renderIdRef.current === myRunId) {
          const pre = document.createElement("pre");
          pre.textContent = code;
          pre.className = "bg-muted p-2 rounded text-sm font-mono overflow-x-auto";
          containerRef.current.appendChild(pre);
        }
        console.error("ScratchBlocksRenderer error:", msg);
      }
    };

    run();
  }, [code, blockStyle, fromLang, toLang, i18n.language, onRendered]);

  return <span ref={containerRef} className={className} style={style} />;
};
