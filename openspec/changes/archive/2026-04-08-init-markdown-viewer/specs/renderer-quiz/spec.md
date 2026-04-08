# Capability: Renderer Quiz

Thành phần chịu trách nhiệm hiển thị và xử lý các bài kiểm tra trắc nghiệm, nối cặp.

## ADDED Requirements

### Requirement: Interactive Quiz Engine
QuizRenderer SHALL hỗ trợ các loại câu hỏi: trắc nghiệm (MCQ), trắc nghiệm nhiều đáp án (MAQ), và nối cặp (Matching).

#### Scenario: Answering MCQ
- **WHEN** người dùng chọn một đáp án
- **THEN** đáp án SHALL được lưu lại và hiển thị trạng thái đã chọn.

### Requirement: Score Calculation
Hệ thống SHALL tự động tính toán điểm số dựa trên các câu trả lời đúng và hiển thị kết quả cuối cùng.

#### Scenario: Quiz Result
- **WHEN** người dùng hoàn thành tất cả câu hỏi và nhấn 'Submit'
- **THEN** hệ thống SHALL hiển thị điểm số (phần trăm) và danh sách các câu đúng/sai kèm giải thích.

### Requirement: Printable View
Hệ thống SHALL cung cấp một chế độ hiển thị tối ưu cho việc in ấn (A4) bài kiểm tra.

#### Scenario: Printing
- **WHEN** người dùng nhấn nút 'Print'
- **THEN** hệ thống SHALL hiển thị bản PDF/Máy in với layout sạch sẽ, không có các thành phần điều hướng web.
