# code-laboratory Specification

## Purpose
TBD - created by archiving change add-code-laboratory. Update Purpose after archive.
## Requirements
### Requirement: Multi-language Support
Hệ thống SHALL hỗ trợ thực thi ít nhất hai ngôn ngữ lập trình chính: JavaScript (thông qua Sandpack) và Python (thông qua Pyodide).

#### Scenario: Selection Logic
- **WHEN** Frontmatter định nghĩa `lang: "python"`
- **THEN** Layout MUST render `PythonRunner` tương ứng.

### Requirement: Non-blocking Execution
Việc thực thi mã nguồn nặng (như Python) SHALL được chạy trong một môi trường cô lập (Web Worker) để tránh gây đơ giao diện người dùng.

#### Scenario: Worker Usage
- **WHEN** Python code đang chạy
- **THEN** Giao diện UI (menus, buttons) MUST vẫn phản hồi mượt mà.

### Requirement: Persistent State (Optional)
Hệ thống SHALL cho phép người dùng lưu trạng thái mã nguồn đang viết dở vào local storage để tiếp tục sau khi load lại trang.

#### Scenario: Auto-save
- **WHEN** Người dùng thay đổi code trong bài Lab
- **THEN** Code MUST được lưu tự động vào `localStorage` của trình duyệt.

