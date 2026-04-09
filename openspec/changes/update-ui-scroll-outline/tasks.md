# Tasks: Update UI Scroll & Outline

## 1. Core Implementation
- [x] 1.1 Create `LessonOutline` component with scroll spy logic
- [x] 1.2 Update `DashboardPage.jsx` to support 3-column layout
- [x] 1.3 Update `PreviewPanel.jsx` header with outline toggle button
- [x] 1.4 Add new layout and scroll container styles to `index.css`

## 2. Refinement
- [x] 2.1 Refactor 3-column layout grid in `DashboardPage`
- [x] 2.2 Fix scroll behavior to be scoped to preview container

## 3. Verification
- [x] 3.1 Verify layout responsiveness and scroll functionality
- [x] 3.2 Clear unused variables and fix lint warnings
- [x] 3.3 Install missing `rehype-slug` dependency
- [x] 3.4 Create walkthrough artifact

### Dependencies & Fixes

- **Installed `rehype-slug`**: Fixed a missing dependency error that prevented the Markdown headers from being linkable (which is required for the Outline scroll-to functionality).
- **Cleanup**: Fixed lint issues regarding unused variables (`node`).
- **Optimization**: Refactored `LessonOutline` to avoid unnecessary re-renders using `useMemo`.
