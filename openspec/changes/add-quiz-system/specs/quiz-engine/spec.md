# Capability: Quiz Engine

Hệ thống đánh giá kiến thức tương tác.

## ADDED Requirements

### Requirement: Interactive Scoring
Hệ thống SHALL có khả năng theo dõi kết quả trả lời của người dùng theo thời gian thực và cung cấp báo cáo cuối cùng.

#### Scenario: Completion Report
- **WHEN** Người dùng click "Submit" ở câu hỏi cuối cùng
- **THEN** Hệ thống MUST hiển thị tổng số câu đúng/sai và lời khuyên dựa trên điểm số.

### Requirement: Feedback Display
Hệ thống SHALL cung cấp phản hồi ngay lập tức hoặc sau khi nộp bài cho từng câu hỏi, kèm theo giải thích đáp án.

#### Scenario: Explanation Visibility
- **WHEN** Người dùng xem kết quả chi tiết
- **THEN** Phần `explanation` trong metadata MUST được hiển thị bên dưới mỗi câu trả lời.

### Requirement: Question Randomization
Hệ thống SHALL hỗ trợ việc xáo trộn thứ tự câu hỏi và thứ tự các đáp án lựa chọn để chống gian lận.

#### Scenario: Shuffle Mode
- **WHEN** Thuộc tính `shuffle: true` được bật trong frontmatter
- **THEN** Thứ tự hiển thị các câu hỏi MUST khác nhau giữa các lần load trang.
