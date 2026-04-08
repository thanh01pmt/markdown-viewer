# Tasks: Setup Content Engine & Sync

## 1. Content Modeling
- [ ] 1.1 Khởi tạo `src/content/config.ts`.
- [ ] 1.2 Định nghĩa schemas sử dụng `z` (Zod) cho các collections: `lessons`, `slides`, `quizzes`, `labs`, `articles`, `flashcards`.

## 2. Dynamic Rendering
- [ ] 2.1 Tạo file `src/pages/[...slug].astro` để thực hiện `getStaticPaths()` từ tất cả collections.
- [ ] 2.2 Triển khai logic chọn layout tự động dựa trên content metadata.

## 3. Deployment Automation
- [ ] 3.1 Viết shell script `scripts/clone-content.sh` để clone repo nội dung từ môi trường CI.
- [ ] 3.2 Cấu hình `netlify.toml` chạy lệnh `sh scripts/clone-content.sh` trước lệnh `astro build`.

## 4. GitHub Integration
- [ ] 4.1 Tạo file `.github/workflows/trigger-netlify.yml` (hoặc hướng dẫn cấu hình webhook).

## 5. Verification
- [ ] 5.1 Kiểm tra việc render nội dung mẫu từ một repo test.
- [ ] 5.2 Validate OpenSpec: `openspec validate setup-content-engine-sync --strict`.
