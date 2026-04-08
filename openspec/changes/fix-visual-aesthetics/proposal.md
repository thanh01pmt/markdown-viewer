# Change: Fix Visual Aesthetics & Premium Slides

## Why
The visual aesthetics of the platform need to be elevated to a "premium" level. Current styles are inconsistent and lack professional polish. We need a unified design system that "WOWs" the user.

## What Changes
- **Unified Design Tokens**: Enhance `global.css` with a broader palette and glassmorphism utilities.
- **Premium Markdown Theme**: Create `modern-markdown.css` with advanced typography, spacing, and component styling.
- **Interactive Slides Polish**: Update `RevealSlides.astro` to use the premium theme, ensuring consistent headers, footers, and code blocks.
- **Micro-animations**: Add subtle entry/hover animations to the document viewer.

## Impact
- Specs: `renderer-slides`, `ui-essentials`
- Code: `global.css`, `ModernMarkdown.tsx`, `RevealSlides.astro`
