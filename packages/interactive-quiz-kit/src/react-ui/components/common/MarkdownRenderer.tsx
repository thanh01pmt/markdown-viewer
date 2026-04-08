"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import ReactMarkdown, { type ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { MarkdownString } from "../../..";
import { useTranslation } from "react-i18next";
import dynamic from 'next/dynamic';

const ScratchBlocksRenderer = dynamic(
  () => import("./ScratchBlocksRenderer").then(mod => mod.ScratchBlocksRenderer),
  { ssr: false }
);

interface ClientScratchRendererProps {
  code: string;
  isInline?: boolean;
}

const ClientScratchRenderer: React.FC<ClientScratchRendererProps> = ({ code, isInline }) => {
  const { i18n } = useTranslation();
  
  const content = (
    <ScratchBlocksRenderer 
      code={code} 
      blockStyle="scratch3" 
      fromLang="en" 
      toLang={i18n.language === "vi" ? "vi" : "en"} 
    />
  );

  if (isInline) {
    return <span className="inline-block align-middle">{content}</span>;
  }

  return <div className="my-4">{content}</div>;
};

interface MarkdownRendererProps {
  content: MarkdownString;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  const { i18n } = useTranslation();
  if (!content) return null;

  const getVideoId = (
    url: string
  ): { platform: "youtube" | "vimeo" | null; id: string | null } => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
        const videoId = urlObj.hostname.includes("youtu.be")
          ? urlObj.pathname.split("/").pop()
          : urlObj.searchParams.get("v");
        return { platform: "youtube", id: videoId ? videoId : null };
      }
      if (urlObj.hostname.includes("vimeo.com")) {
        const videoId = urlObj.pathname.split("/").pop();
        return { platform: "vimeo", id: videoId ? videoId : null };
      }
    } catch { }
    return { platform: null, id: null };
  };

  const processContentForVideos = (text: string): string => {
    const videoUrlRegex = /(^|\s)((https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/)[^\s]+)($|\s)/g;
    return text.replace(
      videoUrlRegex,
      (match, preWhitespace, url, _p3, _p4, postWhitespace) => {
        const replacement = `\n\n![Embedded Video](${url.trim()})\n\n`;
        return `${preWhitespace.replace(/\n/g, "")}${replacement}${postWhitespace.replace(/\n/g, "")}`;
      }
    );
  };

  const processedContent = processContentForVideos(content);

  const components: any = {
    img: ({ node, ...props }: any) => {
      const src = props.src || "";
      const { platform, id } = getVideoId(src);
      if (platform && id) {
        const videoSrc = platform === "youtube" ? `https://www.youtube.com/embed/${id}` : `https://player.vimeo.com/video/${id}`;
        return (
          <div className="relative w-full my-6" style={{ aspectRatio: "16/9" }}>
            <iframe
              src={videoSrc}
              title={props.alt || "Embedded video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full rounded-lg border-0"
            />
          </div>
        );
      }
      return (
        <Image
          src={src}
          alt={props.alt || ""}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: '100%', height: 'auto' }}
          className="max-w-full rounded-lg my-4"
          unoptimized={true}
        />
      );
    },
    table: ({ node, ...props }: any) => (
      <div className="overflow-x-auto my-4 rounded-lg border border-border">
        <table {...props} className="w-full text-sm border-collapse" />
      </div>
    ),
    blockquote: ({ node, ...props }: any) => (
      <blockquote {...props} className="border-l-4 border-primary bg-muted/30 p-4 my-6 italic rounded-r-lg" />
    ),
    pre: ({ node, ...props }: any) => {
      const children: any = (props as any).children;
      const child = Array.isArray(children) ? children[0] : children;
      const isScratchBlock = child && typeof child === "object" && child.props && /(^|\s)language-scratch(\s|$)/.test(child.props.className || "");
      if (isScratchBlock) {
        const rawBlock = child?.props?.children
          ? Array.isArray(child.props.children)
            ? child.props.children.join("")
            : typeof child.props.children === "string"
              ? child.props.children
              : ""
          : "";
        const cleanedBlock = rawBlock;
        return <ClientScratchRenderer code={cleanedBlock} />;
      }
      return <pre {...props} className="bg-muted p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono" />;
    },
    code: ({ node, ...props }: any) => {
      const className = (props as ExtraProps & { className?: string }).className || "";
      const isBlockByClass = /(^|\s)language-/.test(className);
      const isInline = !isBlockByClass;
      if (isInline) {
        const { children, ...rest } = props as ExtraProps & { children?: any };
        const raw = String(children);
        const cleaned = raw.replace(/^`+([\s\S]*?)`+$/u, "$1");
        // Enhanced regex to be more flexible and simpler for common scratch blocks
        const looksLikeScratch = /(move\s*\(|turn\s*@|say\s+|forever|repeat\s+|wait\s*\()/.test(cleaned);
        if (looksLikeScratch) {
          return <ClientScratchRenderer code={cleaned} isInline={true} />;
        }
        return (
          <code {...rest} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
            {cleaned}
          </code>
        );
      }
      // For fence code blocks (non-scratch), preserve all props including syntax highlighting classes
      if (/(^|\s)language-scratch(\s|$)/.test(className)) {
        return <code {...props} />;
      }
      // For other fence code blocks, pass through all props to allow rehype-highlight to work
      return <code {...props} />;
    },
    h1: ({ node, ...props }: any) => (
      <h1 {...props} className="text-3xl font-bold mb-6 mt-8 first:mt-0 last:mb-0" />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 {...props} className="text-2xl font-semibold mb-4 mt-6 last:mb-0" />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 {...props} className="text-xl font-Medium mb-3 mt-5 last:mb-0" />
    ),
    ul: ({ node, ...props }: any) => (
      <ul {...props} className="my-4 space-y-2 list-disc list-inside last:mb-0" />
    ),
    ol: ({ node, ...props }: any) => (
      <ol {...props} className="my-4 space-y-2 list-decimal list-inside last:mb-0" />
    ),
    p: ({ node, ...props }: any) => (
      <p {...props} className="mb-4 leading-7 last:mb-0" />
    ),
    a: ({ node, ...props }: any) => (
      <a
        {...props}
        className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
        target={props.href?.startsWith("http") ? "_blank" : undefined}
        rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
      />
    )
  };

  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none ${className || ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
        components={components}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};
