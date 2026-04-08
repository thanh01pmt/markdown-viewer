# renderer-lessons Specification

## Purpose
TBD - created by archiving change init-markdown-viewer. Update Purpose after archive.
## Requirements
### Requirement: Structured Activity Layout
ActivityRenderer SHALL hiển thị nội dung theo cấu trúc: Header -> Meta (duration, difficulty) -> Objectives -> Materials -> Steps.

#### Scenario: Displaying Content
- **WHEN** dữ liệu activity được parse successfully
- **THEN** các thành phần SHALL được hiển thị theo đúng thứ tự logic với các icon minh họa (lucide-react).

### Requirement: Step-by-Step Guidance
Hệ thống SHALL hiển thị danh sách các bước thực hiện với số thứ tự và các gợi ý (hints) đi kèm.

#### Scenario: Viewing Hints
- **WHEN** một bước có trường `hint`
- **THEN** hệ thống SHALL hiển thị một box gợi ý nổi bật bên dưới bước đó.

