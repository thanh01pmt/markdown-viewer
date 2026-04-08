# **Chiến lược Nâng cao Độ chính xác cho AI**

1. **Làm giàu Ngữ cảnh (Context Enrichment):** Cung cấp cho AI không chỉ "đề cương" (LO) mà cả "sách giáo khoa" (nội dung nguồn).
2. **Kỹ thuật Prompt Nâng cao (Advanced Prompting):** Áp dụng các kỹ thuật như "Tư duy theo chuỗi" (Chain-of-Thought) và "Tạo-rồi-Kiểm" (Generate-then-Critique) để buộc AI phải suy nghĩ sâu hơn.
3. **Phân tách Luồng AI (AI Flow Decomposition):** Chia nhỏ các nhiệm vụ lớn thành các bước logic nhỏ hơn, dễ quản lý và có độ chính xác cao hơn.

## **Kế hoạch Triển khai Chi tiết**

Dưới đây là kế hoạch từng bước để thực hiện chiến lược trên.

* **[ ] Bước 1: Làm giàu Dữ liệu Đầu vào cho AI (Context Enrichment)**
  * **Hành động:** Mở rộng `LearningObjective` để chứa nội dung nguồn thực tế.
  * **File (1):** `src/lib/interactive-quiz-kit/types/learning-objectives.ts`
    * **Chi tiết:** Thêm một trường tùy chọn `sourceContent: string;` vào interface `LearningObjective`.
  * **File (2):** `src/lib/interactive-quiz-kit/services/TopicDataService.ts`
    * **Chi tiết:** Cập nhật `EXPECTED_HEADERS` và logic `parseTSV` để xử lý một cột mới trong file TSV, ví dụ: "Source Content". Cột này sẽ chứa đoạn văn bản, kiến thức cốt lõi liên quan đến LO đó.
  * **Lý do:** Đây là cải tiến có tác động lớn nhất. Khi AI có nội dung nguồn, nó có thể tạo ra các câu hỏi dựa trên sự thật từ văn bản, giảm đáng kể khả năng "ảo giác" (hallucination) và đảm bảo câu hỏi bám sát chương trình học.

* **[ ] Bước 2: Tinh chỉnh Luồng Lên kế hoạch (`generateQuizPlan`)**
  * **Hành động:** Chuyển từ việc lên kế hoạch chung chung sang xác định các "khái niệm có thể kiểm tra" (testable concepts).
  * **File:** `src/lib/interactive-quiz-kit/ai/flows/generate-quiz-plan.ts`
  * **Chi tiết:**
        1. Cập nhật prompt của `generateQuizPlan`. Thay vì chỉ yêu cầu AI chọn loại câu hỏi và mức độ Bloom, prompt mới sẽ yêu cầu: *"Dựa trên `sourceContent` và mô tả LO, hãy xác định 3-5 khái niệm hoặc sự thật quan trọng nhất có thể kiểm tra được. Đối với mỗi khái niệm, hãy đề xuất một loại câu hỏi và mức độ Bloom phù hợp."*
        2. Cấu trúc trả về của `quizPlan` sẽ thay đổi. Thay vì `plannedTopic` là một chuỗi chung chung, nó sẽ trở thành một "khái niệm" cụ thể, ví dụ: `"Sự khác biệt giữa biến 'let' và 'const' trong JavaScript"`.
  * **Lý do:** Bước này buộc AI phải tập trung vào những gì thực sự quan trọng trong nội dung học tập trước khi nghĩ đến việc tạo câu hỏi. Nó làm cho bước tạo câu hỏi sau này trở nên dễ dàng và chính xác hơn nhiều.

* **[ ] Bước 3: Áp dụng Kỹ thuật "Tạo-Đáp-án-Trước" cho các Trình tạo Câu hỏi**
  * **Hành động:** Tái cấu trúc các hàm tạo câu hỏi riêng lẻ (ví dụ: `generateMCQQuestion`) để ưu tiên tạo ra câu trả lời đúng trước.
  * **File (Ví dụ):** `src/lib/interactive-quiz-kit/ai/flows/generate-mcq-question.ts`
  * **Chi tiết:**
        1. Thay đổi prompt để yêu cầu AI trả về một cấu trúc JSON trung gian gồm: `prompt`, `correctAnswerText`, và `explanation`.
        2. Sau đó, trong cùng một prompt hoặc một prompt tiếp theo, yêu cầu: *"Dựa trên câu hỏi và lời giải thích ở trên, hãy tạo ra 3 phương án gây nhiễu (distractors) hợp lý. Các phương án này nên nhắm vào những hiểu lầm phổ biến liên quan đến chủ đề."*
  * **Lý do:** Kỹ thuật này cải thiện đáng kể chất lượng của các câu hỏi trắc nghiệm. Bằng cách tập trung vào câu trả lời đúng và lời giải thích trước, AI có thể tạo ra các phương án sai một cách thông minh và có tính sư phạm, thay vì chỉ là các lựa chọn ngẫu nhiên.

* **[ ] Bước 4: Thêm một Luồng AI "Kiểm định Chất lượng" (Tùy chọn, Nâng cao)**
  * **Hành động:** Tạo một luồng AI mới có vai trò như một chuyên gia thẩm định.
  * **File mới (đề xuất):** `src/lib/interactive-quiz-kit/ai/flows/validate-and-refine-question.ts`
  * **Chi tiết:**
        1. Sau khi một câu hỏi được tạo ra ở Bước 3, chúng ta có thể (tùy chọn) gửi nó đến luồng `validateAndRefineQuestion`.
        2. Prompt cho luồng này sẽ là: *"Bạn là một chuyên gia thẩm định nội dung giáo dục. Đây là một câu hỏi và mục tiêu học tập của nó. Hãy đánh giá câu hỏi này dựa trên các tiêu chí: (1) Tính chính xác về mặt sự thật, (2) Sự rõ ràng của câu chữ, (3) Mức độ phù hợp với mục tiêu học tập, (4) Chất lượng của các phương án gây nhiễu. Nếu có vấn đề, hãy trả về một phiên bản JSON đã được sửa lỗi và cải thiện của câu hỏi này."*
  * **Lý do:** Bước này tạo ra một vòng lặp "tự sửa lỗi" cho AI, giúp sàng lọc các câu hỏi chất lượng thấp trước khi chúng đến tay người dùng. Đây là một kỹ thuật nâng cao giúp tăng độ tin cậy của hệ thống lên mức cao nhất.
