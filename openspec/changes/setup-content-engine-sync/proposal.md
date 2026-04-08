# Change: Setup Content Engine & Sync

## Why
Thiết lập cơ chế quản lý nội dung động và đồng bộ hóa từ repository bên ngoài. Điều này cho phép mở rộng nội dung khóa học mà không cần can thiệp vào mã nguồn của platform.

## What Changes
- **Content Collections**: Định nghĩa Zod schemas cho Lessons, Slides, Quizzes, Labs, Articles.
- **Dynamic Routing**: Xây dựng `src/pages/[...slug].astro` để tự động render content.
- **Automation**: Cấu hình script clone content repo trong build step của Netlify.
- **CI/CD Integration**: Thiết lập GitHub Action để trigger build khi content repo thay đổi.

## Impact
- Specs: `content-engine`
- Workflow: Người dùng chỉ cần push MDX vào content repo để cập nhật site.
