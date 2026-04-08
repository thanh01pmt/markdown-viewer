## 1. Content Modeling
- [ ] 1.1 Khởi tạo `src/content/config.ts`.
- [ ] 1.2 Định nghĩa schemas linh hoạt cho `lessons`, `slides`, `activities`. Hỗ trợ các trường fallback cho nội dung thiếu metadata.

## 2. Dynamic Routing & Rendering
- [ ] 2.1 Cập nhật `src/pages/[programId]/[...slug].astro` để hỗ trợ Multi-Curriculum.
- [ ] 2.2 Triển khai logic ánh xạ Slug thông minh: `/[program-id]/[type]/[file]`.

## 3. Automation & Transformation
- [ ] 3.1 Viết `scripts/sync-content.mjs` (Node.js):
    - Quét thư mục `_shared` từ source (hỗ trợ local path và git clone).
    - Convert `.md` sang `.mdx`.
    - Trích xuất tiêu đề từ nội dung và inject Frontmatter (id, title, program_id, layout).
- [ ] 3.2 Tích hợp Sync command vào `package.json` và `netlify.toml`.

## 4. Verification
- [ ] 4.1 Kiểm tra việc render nội dung mẫu từ một repo test (vd: `pathway-aiot/_shared`).
- [ ] 4.2 Validate OpenSpec: `openspec validate setup-content-engine-sync --strict`.
