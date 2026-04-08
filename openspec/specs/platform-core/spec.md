# platform-core Specification

## Purpose
TBD - created by archiving change init-platform-core. Update Purpose after archive.
## Requirements
### Requirement: Framework Stack
Hệ thống SHALL sử dụng Astro làm framework chính với hỗ trợ tuyệt đối cho MDX và React components.

#### Scenario: Init Success
- **WHEN** Khởi chạy lệnh `npm create astro@latest`
- **THEN** Thư mục project MUST chứa file `astro.config.mjs` với `mdx` và `react` integrations.

### Requirement: Global Styling System
Hệ thống SHALL định nghĩa một bộ CSS variables chuẩn cho màu sắc, khoảng cách và kiểu chữ để sử dụng trên toàn bộ trang web.

#### Scenario: CSS Tokens
- **WHEN** Truy cập `src/styles/global.css`
- **THEN** Phải tìm thấy các biến định nghĩa cho `--color-primary`, `--font-main`, v.v.

### Requirement: Asset Management
Hệ thống SHALL hỗ trợ việc quản lý assets tĩnh (hình ảnh, fonts) tập trung trong thư mục `public/`.

#### Scenario: Asset Accessibility
- **WHEN** Lưu một file vào `public/fonts/`
- **THEN** Asset đó MUST có thể truy cập được từ browser qua path `/fonts/`.

