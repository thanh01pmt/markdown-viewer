# Capability: Flashcard Engine

Hệ thống ôn tập thuật ngữ tương tác.

## ADDED Requirements

### Requirement: Flip Animation
Mỗi Flashcard SHALL hỗ trợ hiệu ứng xoay (flip) mượt mà để chuyển đổi giữa mặt trước (câu hỏi/thuật ngữ) và mặt sau (đáp án/định nghĩa).

#### Scenario: User Interaction
- **WHEN** Người dùng click vào thẻ hoặc nhấn phím Space
- **THEN** Thẻ MUST thực hiện hiệu ứng xoay 180 độ theo trục Y.

### Requirement: Navigation & Counter
Giao diện SHALL cung cấp khả năng điều hướng tuần tự qua danh sách thẻ và hiển thị vị trí hiện tại của học viên.

#### Scenario: Progress Bar
- **WHEN** Đang ở thẻ thứ 2 trong bộ 10 thẻ
- **THEN** Giao diện MUST hiển thị "2 / 10" và thanh progress đạt 20%.

### Requirement: Responsive Card Sizing
Thẻ Flashcard SHALL tự động điều chỉnh kích thước để đảm bảo nội dung (văn bản) luôn nằm trọn trong khung thẻ trên cả di động và máy tính.

#### Scenario: Mobile View
- **WHEN** Xem thẻ trên màn hình rộng 375px
- **THEN** Thẻ MUST thu nhỏ padding và font-size (nếu cần) để tránh tràn chữ ra ngoài.
