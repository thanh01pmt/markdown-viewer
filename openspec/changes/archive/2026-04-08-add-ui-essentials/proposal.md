# Change: Add UI Essentials

## Why
Tăng cường khả năng truyền đạt thông tin và điều hướng trong nội dung bài học bằng cách cung cấp các thành phần giao diện chuẩn (Callouts, TOC, Breadcrumbs) và hỗ trợ sơ đồ trực quan (Mermaid.js).

## What Changes
- **Callout Component**: Tạo `src/components/ui/Callout.astro` hỗ trợ các loại: `note`, `tip`, `warning`, `danger`.
- **Diagram Support**: Tích hợp `Mermaid.astro` để render biểu đồ từ khối mã markdown.
- **Navigation Elements**: Xây dựng `Breadcrumb.astro` và `TableOfContents.astro` tự động trích xuất từ headings.
- **Article Layout**: Tạo `src/layouts/ArticleLayout.astro` cho các nội dung đọc đơn thuần.

## Impact
- Specs: `ui-essentials`
- UX: Cải thiện cấu trúc trang bài viết và khả năng nhận diện thông tin quan trọng.
