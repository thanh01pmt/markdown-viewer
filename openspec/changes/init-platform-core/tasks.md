# Tasks: Initialize Platform Core

## 1. Project Initialization
- [ ] 1.1 `npm create astro@latest` với template minimal, TypeScript strict.
- [ ] 1.2 `npm install` các core dependencies: `@astrojs/mdx`, `@astrojs/react`, `react`, `react-dom`.

## 2. Framework Configuration
- [ ] 2.1 Cấu hình `astro.config.mjs` với `mdx()` và `react()` integrations.
- [ ] 2.2 Thiết lập `tsconfig.json` với các path alias cần thiết.

## 3. Base UI & Structure
- [ ] 3.1 Tạo thư mục `src/layouts/`, `src/components/`, `src/styles/`.
- [ ] 3.2 Viết `src/styles/global.css` với CSS variables (colors, spacing, fonts).

## 4. Verification
- [ ] 4.1 Chạy `npm run dev` để verify project khởi tạo thành công.
- [ ] 4.2 Validate OpenSpec: `openspec validate init-platform-core --strict`.
