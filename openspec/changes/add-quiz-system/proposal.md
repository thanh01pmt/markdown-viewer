# Change: Add Quiz System

## Why
Cung cấp khả năng đánh giá kiến thức của học viên thông qua các bài trắc nghiệm tương tác trực tiếp trong giáo trình.

## What Changes
- **Quiz Layout**: Tạo `src/layouts/QuizLayout.astro`.
- **Quiz Engine**: Xây dựng thành phần React `src/components/interactive/QuizEngine.tsx`.
- **Question Types**: Hỗ trợ Single Choice, Multiple Choice và True/False.
- **State Management**: Theo dõi phản hồi của người dùng và tính toán điểm số cuối cùng.

## Impact
- Specs: `quiz-engine`
- UI: Thêm tính năng làm bài và chấm điểm tự động.
