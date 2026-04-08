# Change: Initialize Markdown Viewer Course Platform

## Why
Thiết lập nền tảng cốt lõi cho ứng dụng Markdown Viewer, cho phép hiển thị đa dạng các loại nội dung giáo dục (Slides, Quiz, Lesson, Lab) từ các file MDX một cách chuyên nghiệp và có thể mở rộng.

## What Changes
- [NEW] Cấu trúc dự án Astro với tích hợp MDX và React.
- [NEW] Hệ thống Dynamic Routing để hiển thị các loại nội dung khác nhau.
- [NEW] Các Layout chuyên dụng: `LessonPlanLayout`, `SlideLayout`, `QuizLayout`, `LabLayout`.
- [NEW] Các Component Renderer lõi: `SlideRenderer`, `QuizRenderer`, `ActivityRenderer`.
- [NEW] Cấu hình Tailwind CSS v4 để tối ưu hóa thiết kế.

## Impact
- Specs: `viewer-core`, `renderer-slides`, `renderer-quiz`, `renderer-lessons`, `renderer-labs`
- Code: Khởi tạo toàn bộ `src/` directory.
