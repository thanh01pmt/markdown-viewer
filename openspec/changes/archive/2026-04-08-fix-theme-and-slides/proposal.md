# Change: Fix Theme Contrast and Slide Text Scaling

## Why

1. Dark mode contrast is too low, making text unreadable in lesson views.
2. Slide headings and content are oversized, causing layout issues and poor readability.

## What Changes

- Add `dark` class to `MainLayout` to ensure consistent dark mode support.
- Fix property names (`className` -> `class`) in Astro files.
- Improve dark mode text colors in `ModernMarkdown` component.
- Reduce font sizes in `SlideRenderer` to prevent overflowing.

## Impact

- Specs: `typography`
- Code: `MainLayout.astro`, `index.astro`, `ModernMarkdown.tsx`, `SlideRenderer.tsx`
