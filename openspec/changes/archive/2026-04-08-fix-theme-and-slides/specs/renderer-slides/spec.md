## MODIFIED Requirements
### Requirement: Presentation View
SlideRenderer SHALL hỗ trợ hiển thị nội dung theo từng bước (slides) sử dụng `ModernMarkdown` để render content mượt mà, hỗ trợ phím mũi tên và các nút điều hướng trên màn hình.

#### Scenario: Markdown Rendering
- **WHEN** nội dung slide chứa mã Markdown (list, bold, code)
- **THEN** SlideRenderer SHALL hiển thị nội dung đã được định dạng thay vì text thô.

## ADDED Requirements
### Requirement: Frontmatter Stripping
SlideRenderer SHALL tự động loại bỏ các khối metadata Marp (vùng kẹp giữa `---`) ở đầu nội dung để tránh hiển thị thông tin cấu hình cho người dùng.

#### Scenario: Marp Metadata
- **WHEN** nội dung bắt đầu bằng khối `--- marp: true ... ---`
- **THEN** SlideRenderer SHALL không hiển thị khối này trên slide đầu tiên.
