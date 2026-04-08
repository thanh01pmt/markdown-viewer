# Change: Add Flashcard System

## Why
Hỗ trợ phương pháp học tập Spaced Repetition (Lặp lại ngắt quãng) bằng cách cung cấp các bộ thẻ ghi nhớ (Flashcards) tương tác, giúp học viên ghi nhớ thuật ngữ và khái niệm quan trọng một cách hiệu quả.

## What Changes
- **Flashcard Component**: Xây dựng `src/components/ui/Flashcard.tsx` với hiệu ứng Flip (xoay 3D) bằng CSS transitions.
- **Flashcard Layout**: Tạo `src/layouts/FlashcardLayout.astro` để hiển thị danh sách các thẻ trong một bộ sưu tập.
- **Progress Tracking**: Hỗ trợ hiển thị số lượng thẻ đã xem và điều hướng qua lại giữa các thẻ.

## Impact
- Specs: `flashcard-engine`
- UX: Cung cấp công cụ ôn tập tương tác sinh động.
