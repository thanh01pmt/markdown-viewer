# Capability: Renderer Slides

Thành phần chịu trách nhiệm hiển thị nội dung Markdown dưới dạng Slide thuyết trình.

## ADDED Requirements

### Requirement: Presentation View
SlideRenderer SHALL hỗ trợ hiển thị nội dung theo từng bước (slides), hỗ trợ phím mũi tên và các nút điều hướng trên màn hình.

#### Scenario: Navigation
- **WHEN** người dùng nhấn phím mũi tên phải
- **THEN** SlideRenderer SHALL chuyển sang slide tiếp theo với hiệu ứng mượt mà.

### Requirement: Fullscreen Support
SlideRenderer SHALL cung cấp nút bấm để chuyển sang chế độ toàn màn hình.

#### Scenario: Fullscreen Toggle
- **WHEN** người dùng nhấn nút 'Fullscreen' hoặc phím 'F'
- **THEN** trình duyệt SHALL chuyển sang chế độ toàn màn hình cho thành phần Slide.
