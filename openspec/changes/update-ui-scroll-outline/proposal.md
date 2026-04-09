# Change: Update UI Scroll & Add Outline

## Why
Users have reported that scrolling in the lesson viewer is still not functional, especially for long content. Additionally, there is no easy way to navigate through sections of a lesson without manual scrolling. Introducing an Outline (Table of Contents) sidebar will improve usability and align the dashboard with standard documentation platforms like GitHub.

## What Changes
- **FIX SCROLLING**: Adjust CSS height and overflow properties to ensure the preview body is scrollable.
- **ADD OUTLINE**: Create a new `LessonOutline` component to extract and display Markdown headers.
- **THREE-COLUMN LAYOUT**: Update the Lesson Viewer to a 3-column layout (Sidebar, Content, Outline).
- **ANCHOR LINKS**: Generate unique IDs for all headers in `MarkdownRenderer` to support inter-page navigation.

## Impact
- Specs: `specs/dashboard/viewer.md` (if exists)
- Code: 
  - `apps/dashboard/src/index.css`
  - `apps/dashboard/src/components/PreviewPanel.jsx`
  - `apps/dashboard/src/components/MarkdownRenderer.jsx`
  - `apps/dashboard/src/components/LessonOutline.jsx` [NEW]
