# Change: Add Code Laboratory

## Why
Tăng cường trải nghiệm học tập thực tế bằng cách cho phép học viên chạy mã nguồn trực tiếp trong trình duyệt. Phù hợp cho các bài Lab và các ví dụ code trong bài giảng.

## What Changes
- **Lab Layout**: Tạo `src/layouts/LabLayout.astro`.
- **Code Runners**: Tích hợp `@codesandbox/sandpack-react` cho JavaScript/React và `Pyodide` cho Python.
- **Interactive UI**: Xây dựng thành phần `CodeRunner.tsx` hỗ trợ xem kết quả chạy code (Console/Output).

## Impact
- Specs: `code-laboratory`
- Capabilities: Chạy code Python và JS client-side.
