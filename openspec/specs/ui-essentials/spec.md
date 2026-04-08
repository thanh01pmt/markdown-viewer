# ui-essentials Specification

## Purpose
TBD - created by archiving change add-ui-essentials. Update Purpose after archive.
## Requirements
### Requirement: Semantic Callouts
Hệ thống SHALL cung cấp các hộp chú thích (Callouts) với các cấp độ nghiêm trọng khác nhau (Tip, Info, Warning, Danger).

#### Scenario: Visual Distinction
- **WHEN** Type là `warning`
- **THEN** Background MUST có màu vàng nhạt và icon cảnh báo tương ứng.

### Requirement: Mermaid Integration
Hệ thống SHALL hỗ trợ render sơ đồ, biểu đồ từ cú pháp Mermaid trong các khối mã markdown có nhãn `mermaid`.

#### Scenario: Diagram Rendering
- **WHEN** Một trang mdx chứa khối mã mermaid
- **THEN** Client-side MUST thay thế khối mã bằng SVG diagram tương ứng sau khi trang load.

### Requirement: Auto Table of Contents
Hệ thống SHALL tự động tạo mục lục (TOC) cho các trang có nội dung dài dựa trên các thẻ headings (H2, H3).

#### Scenario: Active Heading Highlighting
- **WHEN** Người dùng cuộn trang đến một heading nhất định
- **THEN** Mục lục MUST làm nổi bật (highlight) mục tương ứng.

### Requirement: Breadcrumb Navigation
Hệ thống SHALL hiển thị đường dẫn breadcrumb chính xác dựa trên cấu trúc phân cấp của slug.

#### Scenario: Path Construction
- **WHEN** Slug là `lessons/intro-to-python`
- **THEN** Breadcrumb MUST hiển thị `Lessons > Intro to Python`.

### Requirement: Global Dark Mode
Hệ thống SHALL hỗ trợ chế độ Dark Mode nhất quán bằng cách áp dụng lớp `dark` lên thẻ `html` gốc.

#### Scenario: Visual Consistency
- **WHEN** người dùng truy cập trang web
- **THEN** các thành phần UI (sidebar, main content) SHALL hiển thị đúng màu nền và màu chữ tối ưu cho Dark Mode.

