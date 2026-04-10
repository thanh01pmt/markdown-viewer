# Change: fix-file-viewer-ui

## Why
Users seeing directories listed as files in the Code/Assets tabs, and images not previewing correctly when selected.

## What Changes
- [x] Filter out directories from `codeFiles` and `assets` in `useStore.js`.
- [x] Improve image detection and default view mode in `PreviewPanel.jsx`.
- [x] Handle blank/empty file content more gracefully in UI.

## Impact
- Specs: `view-files`
- Code: `useStore.js`, `PreviewPanel.jsx`
