# Change: Add Slide Presentation

## Why
Hỗ trợ giảng viên trình chiếu nội dung bài giảng dưới dạng slide chuyên nghiệp trực tiếp trên nền tảng web, thay vì phải sử dụng các công cụ bên ngoài như PowerPoint.

## What Changes
- **Slide Engine**: Tích hợp `reveal.js`.
- **Slide Layout**: Tạo `src/layouts/SlideLayout.astro` hỗ trợ cấu trúc phân trang của RevealJS.
- **Customization**: Hỗ trợ cấu hình themes (white, black, sky) và transition effects thông qua frontmatter.

## Impact
- Specs: `slide-presentation`
- UX: Chế độ toàn màn hình cho bài giảng.
