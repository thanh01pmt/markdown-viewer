# Change: Improve Alignment Matrix UI

## Why
The current Alignment Matrix is a static table that is difficult to navigate and filter. Users need a more interactive way to track curriculum alignment, search for specific lessons, and navigate directly to content from the matrix view.

## What Changes
- **Interactive Filtering**: Add search and status filters to the Matrix tab.
- **Deep Linking**: Make Lesson IDs clickable to navigate directly to the Lesson Viewer.
- **Visual Polish**: sticky headers, glassmorphism, and improved row aesthetics.
- **Completion Summary**: Add a progress overview at the top of the Matrix tab.

## Impact
- Specs: `openspec/specs/alignment-matrix/spec.md` (NEW)
- Code: 
    - `apps/dashboard/src/components/AlignmentMatrix.jsx`
    - `apps/dashboard/src/pages/DashboardPage.jsx`
    - `apps/dashboard/src/index.css`
