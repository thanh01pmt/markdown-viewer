# Change: Setup Content Engine & Sync

## Why
Dự án `markdown-viewer` cần một cơ chế mạnh mẽ để quản lý nội dung giáo dục STEM đến từ nhiều chương trình học khác nhau. Mục tiêu là tách biệt hoàn toàn mã nguồn (Viewer) và dữ liệu bài học (Content), cho phép mở rộng quy mô lên hàng chục chương trình học mà không cần can thiệp vào mã nguồn lõi.

## What Changes
- **Astro Content Engine**:
    - [NEW] `src/content/config.ts`: Định nghĩa schema chuẩn cho `lessons`, `slides`, và `activities`. Schema sẽ được thiết kế linh hoạt để hỗ trợ các tệp Markdown truyền thống.
    - **Multi-Curriculum Architecture**: Sử dụng cấu trúc thư mục lồng nhau (`src/content/[type]/[program-id]/`) để phân tách không gian tên giữa các chương trình học.

- **Automation & Sync**:
    - [NEW] `scripts/sync-content.mjs`: Script Node.js chịu trách nhiệm đồng bộ nội dung từ các thư mục `_shared` của từng repo chương trình học.
    - **Transformation Logic**: Tự động chuyển đổi các tệp `.md` chưa có metadata thành `.mdx` có đầy đủ Frontmatter (ID, Title trích xuất từ văn bản, Program ID).

- **Dynamic Routing**:
    - [NEW] `src/pages/[programId]/[type]/[...slug].astro`: Route động xử lý việc hiển thị nội dung dựa trên context của chương trình học.

## Impact
- **Specs**: Cập nhật đặc tả `platform-core` về việc quản lý tài nguyên.
- **Build Process**: Quy trình build sẽ bao gồm bước `node scripts/sync-content.mjs` để nạp dữ liệu mới nhất.
- **URL Structure**: Thay đổi từ cấu trúc phẳng sang `/pathway-aiot/lessons/lesson-1`.

## Open Questions
- Bạn có muốn hệ thống tự động sinh ID bài học dựa trên tên tệp (ví dụ: `LESSON_HP7_01.md` -> ID: `hp7-01`) hay giữ nguyên tên tệp ban đầu?
- Hỗ trợ Git Clone cho script sync: Bạn có muốn tích hợp SSH Key hỗ trợ cho các Repo Private của MEGA ngay trong bước này không?
