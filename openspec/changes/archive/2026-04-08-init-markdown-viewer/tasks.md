## 1. Project Initialization
- [x] 1.1 Khởi tạo Astro project (`npm create astro@latest ./`)
- [x] 1.2 Thiết lập Tailwind CSS v4 và các dependencies lõi
- [x] 1.3 Cấu hình `astro.config.mjs` (MDX, React, Tailwind)

## 2. Core Architecture
- [x] 2.1 Định nghĩa Content Schemas trong `src/content/config.ts`
- [x] 2.2 Triển khai Dynamic Routing `src/pages/[...slug].astro`
- [x] 2.3 Tạo các base Layouts (`LessonPlan`, `Slide`, `Quiz`, `Lab`)

## 3. Renderers Implementation
- [x] 3.1 Port và tối ưu `SlideRenderer.tsx` từ `pbl_creator_ai`
- [x] 3.2 Port và tối ưu `QuizRenderer.tsx` từ `pbl_creator_ai`
- [x] 3.3 Port và tối ưu `ActivityRenderer.tsx` từ `pbl_creator_ai`
- [x] 3.4 Triển khai `CodeRunner.tsx` (Dispatcher)

## 4. UI/UX Polishing
- [x] 4.1 Thiết kế Navigation và Sidebar chuyên nghiệp
- [x] 4.2 Thêm hiệu ứng chuyển cảnh và micro-animations (Framer Motion)
- [x] 4.3 Tối ưu hóa trải nghiệm Responsive và In ấn (cho Quiz)

## 5. Mock Content & Validation
- [x] 5.1 Xây dựng bộ nội dung mẫu (MDX) cho mọi loại layout
- [x] 5.2 Kiểm tra tính năng và sửa lỗi
