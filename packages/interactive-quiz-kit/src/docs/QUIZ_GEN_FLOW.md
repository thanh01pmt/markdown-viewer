# AI Quiz Generation Flow

Tài liệu này mô tả chi tiết quy trình tự động tạo ra một bài kiểm tra (quiz) hoàn chỉnh bằng AI. Mục tiêu là cung cấp một cái nhìn tổng quan và sâu sắc về kiến trúc, giúp các nhà phát triển hiểu rõ luồng hoạt động, từ đó có thể dễ dàng bảo trì, mở rộng và cộng tác.

## I. Tổng quan về Kiến trúc (Architectural Overview)

Hệ thống được thiết kế theo một kiến trúc hai giai đoạn (Two-Phase Architecture) thông minh và hiệu quả:

1. **Giai đoạn 1: Lập kế hoạch (Planning Phase):** Thay vì tạo các câu hỏi một cách ngẫu nhiên, hệ thống bắt đầu bằng việc gọi một luồng AI chuyên biệt để tạo ra một **"Kế hoạch Bài kiểm tra" (Quiz Plan)**. Kế hoạch này là một bản thiết kế chi tiết, có cấu trúc sư phạm, xác định rõ từng câu hỏi sẽ được tạo ra như thế nào.

2. **Giai đoạn 2: Thực thi (Execution Phase):** Dựa trên `Quiz Plan` đã được tạo, hệ thống lặp qua từng mục trong kế hoạch và gọi các hàm tạo câu hỏi chuyên biệt (ví dụ: `generateMCQQuestion`, `generateCodingQuestion`, v.v.) để tạo ra từng câu hỏi một cách độc lập.

Kiến trúc này đảm bảo rằng các bài kiểm tra được tạo ra không chỉ đúng về mặt kỹ thuật mà còn có cấu trúc, đa dạng và phù hợp với mục tiêu sư phạm đã đề ra.

---

## II. Giai đoạn 1: Lập kế hoạch Bài kiểm tra (Quiz Plan Generation)

Đây là bước "tư duy" của hệ thống.

* **Mục tiêu:** Tạo ra một dàn bài chi tiết cho toàn bộ bài kiểm tra.
* **Đầu vào:** Các thông tin cấp cao như Mục tiêu học tập (Learning Objective), chủ đề, số lượng câu hỏi mong muốn.
* **Quá trình:** Một lời gọi duy nhất đến một luồng AI phức tạp để phân tích đầu vào và vạch ra kế hoạch.
* **Đầu ra:** Một mảng JSON (`quizPlan`) chứa các "chỉ thị" cho từng câu hỏi sẽ được tạo.

### Ví dụ về một mục trong `quizPlan` (Trích từ log)

Dưới đây là một chỉ thị cụ thể trong kế hoạch, yêu cầu tạo một câu hỏi Đúng/Sai:

```json
{
  // Chủ đề cụ thể mà câu hỏi sẽ xoay quanh.
  "plannedTopic": "Xác định một đặc điểm chính của class liên quan đến ngữ nghĩa tham chiếu.",
  
  // Loại câu hỏi cần tạo.
  "plannedQuestionTypeCode": "TRUE_FALSE",
  
  // Cấp độ nhận thức theo thang Bloom, giúp điều chỉnh độ khó.
  "plannedBloomLevelCode": "REMEMBER",
  
  // (Tính năng cực kỳ mạnh mẽ) Một quan niệm sai lầm phổ biến mà câu hỏi cần nhắm đến.
  // AI sẽ sử dụng thông tin này để tạo ra các câu hỏi hoặc đáp án nhiễu hiệu quả.
  "targetMisconception": "Believing that both structs and classes are reference types.",
  
  // AI tự giải thích lý do tại sao nó chọn độ khó này cho câu hỏi.
  "difficultyReason": "Second opening question. A binary choice on a fundamental concept (reference type) solidifies a key distinction early on.",
  
  // Các thông tin ngữ cảnh khác được kế thừa.
  "originalLoId": "SL-SC-02",
  "originalSubject": "App Development With Swift",
  "originalCategory": "Swift Programming Language",
  "originalTopic": "Structs & Classes"
}
```

---

## III. Giai đoạn 2: Tạo Từng Câu hỏi (Individual Question Generation)

Đây là giai đoạn thực thi kế hoạch. Hệ thống sẽ lặp qua từng chỉ thị trong `quizPlan` và gọi hàm AI tương ứng.

Hãy cùng theo dõi chi tiết quá trình tạo câu hỏi **Đúng/Sai** từ ví dụ trên.

### Bước 2.1: Xây dựng Prompt

Hệ thống lấy chỉ thị từ `quizPlan` và xây dựng một prompt cực kỳ chi tiết cho hàm `generateTrueFalseQuestion`.

* **Input Context (Trích từ log):**

```json
{
  "language": "Vietnamese",
  "difficultyCode": "EASY",
  "quizContext": {
    "plannedTopic": "Xác định một đặc điểm chính của class liên quan đến ngữ nghĩa tham chiếu.",
    "plannedQuestionTypeCode": "TRUE_FALSE",
    "plannedBloomLevelCode": "REMEMBER",
    "targetMisconception": "Believing that both structs and classes are reference types.",
    // ... các trường khác
  }
}
```

* **Full Prompt (Trích từ log):**

Hệ thống đã thông minh lồng ghép `targetMisconception` vào một quy tắc cốt lõi, buộc AI phải tuân theo.

```log
You are an expert Question Author for advanced technical education...

## Core Rules (Non-negotiable)
...
3.  **Misconception Priority:** If a Target Misconception is provided, the statement MUST be FALSE and reflect that misconception. This is a critical rule.
...

## CRITICAL CONTEXT FOR THIS QUESTION
...
- **Target Misconception:** The statement you create MUST be FALSE and based on this common mistake: "Believing that both structs and classes are reference types."
...

### Input Parameters
...
- **Language for Text:** Vietnamese
...
```

### Bước 2.2: Phản hồi và Xác thực của AI

AI nhận prompt và trả về một đối tượng JSON.

* **AI Response (Trích từ log):**

AI đã tuân thủ hoàn hảo các chỉ thị:

1. Tạo ra một nhận định **SAI** (`correctAnswer: false`).
2. Nội dung của nhận định (`prompt`) trực tiếp nhắm vào `targetMisconception`.
3. Toàn bộ nội dung được viết bằng **tiếng Việt**.

```json
{
  "prompt": "Trong Swift, cả class và struct đều là kiểu tham chiếu.",
  "correctAnswer": false,
  "explanation": "Trong Swift, class là kiểu tham chiếu... Ngược lại, struct là kiểu giá trị...",
  "points": 10,
  "difficultyCode": "EASY",
  "topic": "Xác định một đặc điểm chính của class liên quan đến ngữ nghĩa tham chiếu.",
  "verifiedCategory": "Swift Programming Language"
}
```

* **Validation (Trích từ log):**

Hệ thống ngay lập tức kiểm tra phản hồi của AI:

1. `✅ VALIDATION - Attempt 1 - JSON Parsed Successfully`: Xác nhận chuỗi trả về là JSON hợp lệ.
2. `✅ VALIDATION - Attempt 1 - Zod Schema Validated`: Xác nhận cấu trúc JSON khớp với `AITrueFalseOutputFieldsSchema`.
3. Logic trong hàm cũng xác thực rằng `correctAnswer` là `false`, khớp với yêu cầu từ `targetMisconception`.

### Bước 2.3: Tạo Đối tượng Câu hỏi Cuối cùng

Sau khi xác thực thành công, hệ thống sẽ chuyển đổi dữ liệu từ AI thành đối tượng `TrueFalseQuestion` cuối cùng, sẵn sàng để sử dụng trong ứng dụng.

```typescript
// Đây là đối tượng cuối cùng được tạo ra, tuân thủ type 'TrueFalseQuestion'
const completeQuestion: TrueFalseQuestion = {
  id: "tf_ai_...", // ID duy nhất được tạo ra
  questionTypeCode: 'TRUE_FALSE',
  prompt: "Trong Swift, cả class và struct đều là kiểu tham chiếu.",
  correctAnswer: false,
  explanation: "Trong Swift, class là kiểu tham chiếu... Ngược lại, struct là kiểu giá trị...",
  points: 10,
  topic: "Xác định một đặc điểm chính của class liên quan đến ngữ nghĩa tham chiếu.",
  difficultyCode: "EASY",
  // ... các thuộc tính khác từ quizContext
};
```

Quá trình này lặp lại cho đến khi tất cả các câu hỏi trong `quizPlan` được tạo xong.

---

## IV. Điểm nổi bật về Kiến trúc & Các khái niệm chính

* **Thông minh về Sư phạm:** Hệ thống không chỉ tạo câu hỏi, mà còn thiết kế chúng dựa trên các nguyên tắc sư phạm như **Thang đo Bloom** và nhắm vào các **Quan niệm sai lầm (Misconceptions)**.
* **Bền bỉ & Đáng tin cậy:** Mỗi lời gọi AI đều được bọc trong một cơ chế retry. `DebugLogger` cung cấp log chi tiết cho từng bước. Zod schema đảm bảo tính toàn vẹn dữ liệu ở mọi giai đoạn.
* **Đa ngôn ngữ & Đa phương tiện:** Kiến trúc được thiết kế để dễ dàng xử lý các ngôn ngữ hiển thị khác nhau (`language`) và có thể tích hợp ngữ cảnh hình ảnh (`imageUrl`).
* **Chuyên môn hóa:** Mỗi loại câu hỏi có một hàm tạo chuyên biệt, giúp prompt được tối ưu hóa cao độ và dễ dàng quản lý.

## V. Cân nhắc về Hiệu suất

* Log cho thấy Giai đoạn 1 (Lập kế hoạch) mất khoảng **52 giây**. Đây là một điểm nghẽn tiềm tàng. Các cải tiến trong tương lai có thể tập trung vào việc tối ưu hóa luồng này, ví dụ như chia nhỏ lời gọi AI hoặc sử dụng streaming.
* Giai đoạn 2 (Thực thi) diễn ra song song và hiệu quả, với mỗi câu hỏi được tạo trong khoảng 4-15 giây.
