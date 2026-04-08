# Tasks: Initialize Platform Core

## 1. Project Initialization
- [x] 1.1 `npm create astro@latest` với template minimal, TypeScript strict.
- [x] 1.2 `npm install` các core dependencies: `@astrojs/mdx`, `@astrojs/react`, `react`, `react-dom`.

## 2. Framework Configuration
- [x] 2.1 Cấu hình `astro.config.mjs` với `mdx()` và `react()` integrations.
- [x] 2.2 Thiết lập `tsconfig.json` với các path alias cần thiết.

## 3. Base UI & Structure
- [x] 3.1 Tạo thư mục `src/layouts/`, `src/components/`, `src/styles/`.
- [x] 3.2 Viết `src/styles/global.css` với CSS variables (colors, spacing, fonts).

## 4. Verification
- [x] 4.1 Chạy `npm run dev` để verify project khởi tạo thành công.
- [x] 4.2 Validate OpenSpec: `openspec validate init-platform-core --strict`.
