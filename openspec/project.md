# Project: Markdown Viewer Course Platform

Nền tảng học tập trực tuyến dựa trên Astro và Markdown, cho phép quản lý nội dung độc lập với mã nguồn.

## Vision
Trở thành công cụ mạnh mẽ, dễ sử dụng để tạo và chia sẻ các khóa học lập trình, kỹ thuật với trải nghiệm người dùng cao, hỗ trợ chạy code trực tiếp, làm bài kiểm tra và trình chiếu slide.

## Technology Stack
- **Framework**: Astro (Static Site Generation)
- **Styling**: Vanilla CSS / Astro Styles
- **Logic**: React (cho Quiz engine và Interactive UI)
- **Deployment**: Netlify
- **Content**: MDX, GitHub external repository
- **Tools**: RevealJS (Slides), Mermaid (Diagrams), Pyodide (Python), Sandpack (JS)

## Standards
- **Spec-driven**: Sử dụng OpenSpec để quản lý requirements.
- **Content Safety**: Sử dụng Zod schema để validate metadata của MDX.
- **Performance**: Ưu tiên SSG, lazy load các component nặng (Pyodide).
