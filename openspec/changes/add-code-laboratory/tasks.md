# Tasks: Add Code Laboratory

## 1. Environment Setup
- [ ] 1.1 `npm install @codesandbox/sandpack-react`.
- [ ] 1.2 Tích hợp CDN hoặc NPM package cho `pyodide`.

## 2. Component Development
- [ ] 2.1 Xây dựng `SandpackRunner.tsx` hỗ trợ giao diện editor và preview.
- [ ] 2.2 Xây dựng `PythonRunner.tsx` sử dụng worker để load Pyodide mà không gây block main thread.

## 3. Layout Integration
- [ ] 3.1 Tạo `src/layouts/LabLayout.astro` với sidebar hướng dẫn bài Lab và main area cho CodeRunner.

## 4. Verification
- [ ] 4.1 Test chạy code JS và Python trong LabLayout.
- [ ] 4.2 Validate OpenSpec: `openspec validate add-code-laboratory --strict`.
