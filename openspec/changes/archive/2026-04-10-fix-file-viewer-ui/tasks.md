# Tasks: fix-file-viewer-ui

## 1. Environment Preparation
- [ ] 1.1 Kill process on port 3001 using `kill -9 39753`.
- [ ] 1.2 Restart dev server.

## 2. Implementation
- [ ] 2.1 Update `apps/dashboard/src/store/useStore.js` to filter `assetFiles` and `codeFiles` by `type === 'file'`.
- [ ] 2.2 Update `apps/dashboard/src/components/PreviewPanel.jsx` to improve image detection and view mode defaults.
- [ ] 2.3 Add empty content handling in `PreviewPanel.jsx`.

## 3. Verification
- [ ] 3.1 Verify directory filtering in sidebar.
- [ ] 3.2 Verify image preview works in Assets tab.
- [ ] 3.3 Verify code viewing works in Code tab.
