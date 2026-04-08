# Kiến trúc Sinh câu hỏi bằng AI (Quy trình Hiện tại)

Tài liệu này mô tả chi tiết quy trình sinh câu hỏi tự động bằng AI đang được triển khai trong hệ thống `interactive-quiz-kit`. Quy trình này được thiết kế theo kiến trúc 2 giai đoạn nhằm tăng cường khả năng kiểm soát và chất lượng của các câu hỏi được tạo ra.

## I. Tổng quan về Triết lý 2 Giai đoạn

Quy trình hiện tại dựa trên nguyên tắc "Lên kế hoạch trước, Thực thi sau" (Plan then Execute). Thay vì yêu cầu AI tạo ra một bộ câu hỏi hoàn chỉnh trong một lần duy nhất, chúng ta chia nhiệm vụ thành hai bước logic riêng biệt:

1. **Giai đoạn 1: Lập kế hoạch (Planning)**: AI hoạt động như một chuyên gia thiết kế bài kiểm tra. Dựa trên các yêu cầu đầu vào (mục tiêu học tập, độ khó, loại câu hỏi), nó tạo ra một "bản thiết kế" (blueprint) cho bài quiz. Bản thiết kế này, hay `QuizPlan`, là một mảng các đối tượng, mỗi đối tượng mô tả đặc điểm của một câu hỏi sẽ được tạo (chủ đề, loại câu hỏi, mức độ nhận thức Bloom).

2. **Giai đoạn 2: Tạo câu hỏi (Generation)**: AI hoạt động như một người viết nội dung. Nó nhận từng mục trong `QuizPlan` đã được tạo ở Giai đoạn 1 và thực thi việc tạo ra một câu hỏi cụ thể, hoàn chỉnh dựa trên các đặc điểm đã được lên kế hoạch.

**Lợi ích của cách tiếp cận này:**

* **Kiểm soát cao hơn:** Chúng ta có thể xem xét và thậm chí chỉnh sửa `QuizPlan` trước khi bước vào giai đoạn tạo câu hỏi tốn kém hơn.
* **Phân tách nhiệm vụ:** Mỗi luồng AI tập trung vào một nhiệm vụ cụ thể, giúp prompt trở nên đơn giản và đầu ra dễ dự đoán hơn.
* **Tái sử dụng:** Một `QuizPlan` có thể được sử dụng để tạo ra nhiều bộ câu hỏi khác nhau nếu cần.

## II. Luồng Dữ liệu Chi tiết

Sơ đồ luồng dữ liệu từ người dùng đến kết quả cuối cùng:

```mermaid

[UI: PracticeSetup.tsx]
       |
       | (1. Người dùng chọn LOs, Độ khó, Ngôn ngữ)
       v
[Logic: handleStartPractice()]
       |
       | (2. Xây dựng Input cho Giai đoạn 1)
       v
[AI Flow: generateQuizPlan] --(API Call)--> [Gemini AI]
       |
       | (3. Trả về QuizPlan JSON)
       v
[Logic: handleStartPractice()]
       |
       | (4. Xây dựng Input cho Giai đoạn 2 từ QuizPlan)
       v
[AI Flow: generateQuestionsFromQuizPlan]
       |
       | (5. Lặp qua từng mục trong Plan)
       v
   [AI Flow con: generateMCQQuestion, generateTFQuestion, ...] --(API Call)--> [Gemini AI]
       |
       | (6. Trả về từng QuizQuestion JSON)
       v
[Logic: handleStartPractice()]
       |
       | (7. Tổng hợp thành QuizConfig hoàn chỉnh)
       v
[UI: QuizPlayer.tsx]

```

## III. Phân tích Giai đoạn 1: Lập kế hoạch (`generateQuizPlan`)

### 1. Mục tiêu giai đoạn 1

Tạo ra một kế hoạch có cấu trúc cho một bài quiz gồm 10 câu hỏi, phân bổ đều theo các Mục tiêu Học tập (Learning Objectives - LOs), mức độ nhận thức Bloom, và các loại câu hỏi được yêu cầu.

### 2. Dữ liệu Đầu vào (Input) giai đoạn 1

Một object `GenerateQuizPlanClientInput` được xây dựng từ lựa chọn của người dùng.

**Ví dụ Input:**

```typescript
{
  totalQuestions: 10,
  topics: [
    {
      topic: "Subject: App Development With Swift | Learning Objective Id (LoId): (SL-FN-02) Define Swift functions using correct func syntax...",
      ratio: 100,
      originalLoId: "SL-FN-02",
      // ... các metadata khác
    }
  ],
  bloomLevels: [
    { level: 'REMEMBER', ratio: 50 },
    { level: 'UNDERSTAND', ratio: 50 }
  ],
  selectedQuestionTypes: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'],
  language: 'Vietnamese'
}
```

### 3. Phân tích Prompt giai đoạn 1

Prompt cho giai đoạn này yêu cầu AI đóng vai một "chuyên gia thiết kế giáo dục". Nó được cung cấp các quy tắc về phân phối và các định nghĩa về cấp độ Bloom.

**Trích đoạn Prompt chính:**

> You are an expert educational assessment designer... Your task is to create a strategically planned quiz...
>
> **Topic Distribution** (must be followed precisely):
>
> * Topic Context: "Subject: App Development With Swift | Learning Objective Id (LoId): (SL-FN-02) Define Swift functions...", Ratio: 100%
>
> **Bloom Level Distribution** (must be followed precisely):
>
> * Level: "REMEMBER", Ratio: 50%
> * Level: "UNDERSTAND", Ratio: 50%
>
> **Available Question Types**: 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'
>
> **OUTPUT FORMAT**: Return ONLY a JSON object with this EXACT structure: `{"quizPlan": [ ... ]}`

### 4. Kết quả Đầu ra (Output) giai đoạn 1

AI trả về một object JSON chứa một mảng `quizPlan`. Mỗi phần tử trong mảng là một kế hoạch cho một câu hỏi.

**Ví dụ Output (`QuizPlan`):**

```json
{
  "quizPlan": [
    {
      "plannedTopic": "Basic syntax of a Swift function",
      "plannedQuestionTypeCode": "MULTIPLE_CHOICE",
      "plannedBloomLevelCode": "REMEMBER",
      "originalLoId": "SL-FN-02"
    },
    {
      "plannedTopic": "Identifying the return type arrow `->`",
      "plannedQuestionTypeCode": "TRUE_FALSE",
      "plannedBloomLevelCode": "REMEMBER",
      "originalLoId": "SL-FN-02"
    },
    {
      "plannedTopic": "Concept of a Void return type",
      "plannedQuestionTypeCode": "SHORT_ANSWER",
      "plannedBloomLevelCode": "UNDERSTAND",
      "originalLoId": "SL-FN-02"
    },
    // ... 7 kế hoạch câu hỏi khác
  ]
}
```

## IV. Phân tích Giai đoạn 2: Tạo câu hỏi (`generateQuestionsFromQuizPlan`)

### 1. Mục tiêu giai đoạn 2

Thực thi `QuizPlan` bằng cách lặp qua từng kế hoạch câu hỏi và gọi các luồng AI chuyên biệt để tạo ra đối tượng `QuizQuestion` hoàn chỉnh.

### 2. Dữ liệu Đầu vào (Input) giai đoạn 2

Luồng này nhận `QuizPlan` từ Giai đoạn 1. Bên trong, nó lặp và tạo ra các input nhỏ hơn cho các hàm con.

**Ví dụ Input cho `generateMCQQuestion` (dựa trên mục đầu tiên của `QuizPlan`):**

```typescript
{
  topic: "Basic syntax of a Swift function",
  language: "Vietnamese",
  difficultyCode: "EASY", // Được tính toán từ Bloom Level và các yếu tố khác
  numberOfOptions: 4
}
```

### 3. Phân tích Prompt (Ví dụ với `generateMCQQuestion`)

Prompt cho giai đoạn này yêu cầu AI đóng vai một "người viết câu hỏi". Nó rất cụ thể về định dạng JSON đầu ra.

**Trích đoạn Prompt chính:**

> You are an expert quiz question writer. Generate a single Multiple Choice question in Vietnamese based on the following inputs.
>
> IMPORTANT: Return the response as JSON with this EXACT format:
> `{ "prompt": "...", "options": [...], "correctTempOptionId": "...", "explanation": "..." }`
>
> **Topic**: Basic syntax of a Swift function
> **Language**: Vietnamese
> **Difficulty**: Easy
> **Number of Options**: 4

### 4. Kết quả Đầu ra (Output) giai đoạn 2

Mỗi lệnh gọi AI con trả về một object JSON chứa dữ liệu cho một câu hỏi. Luồng `generateQuestionsFromQuizPlan` sẽ xử lý, thêm ID, và định dạng lại thành cấu trúc `QuizQuestion` tiêu chuẩn.

**Ví dụ Output (một `QuizQuestion` hoàn chỉnh):**

```json
{
  "id": "mcq_1722144942_abc12",
  "questionTypeCode": "MULTIPLE_CHOICE",
  "prompt": "Từ khóa nào được sử dụng để bắt đầu định nghĩa một hàm trong Swift?",
  "options": [
    { "id": "opt_1", "text": "function" },
    { "id": "opt_2", "text": "def" },
    { "id": "opt_3", "text": "func" },
    { "id": "opt_4", "text": "fun" }
  ],
  "correctAnswerId": "opt_3",
  "points": 10,
  "explanation": "Trong Swift, từ khóa `func` được sử dụng để khai báo một hàm mới.",
  "difficultyCode": "EASY",
  "bloomLevelCode": "REMEMBER",
  "topic": "Functions",
  "learningObjective": "SL-FN-02"
}
```

## V. Đánh giá Quy trình Hiện tại

### Ưu điểm

* **Có cấu trúc và Dễ kiểm soát:** Quy trình 2 bước cho phép can thiệp và xác thực ở giai đoạn kế hoạch.
* **Prompt đơn giản:** Mỗi prompt AI tập trung vào một nhiệm vụ nhỏ, giúp giảm thiểu sự phức tạp và tăng tính nhất quán.
* **Phân tách logic:** Tách biệt rõ ràng giữa việc "lên chiến lược" và "viết nội dung".

### Nhược điểm

* **Chi phí và Độ trễ:** Yêu cầu nhiều lệnh gọi API (1 cho kế hoạch + N cho mỗi câu hỏi), làm tăng chi phí và thời gian chờ đợi của người dùng.
* **Lan truyền lỗi:** Một kế hoạch không tốt ở Giai đoạn 1 sẽ dẫn đến các câu hỏi kém chất lượng ở Giai đoạn 2.
* **Ngữ cảnh hạn chế:** Giai đoạn 2 chỉ nhận được một chuỗi `plannedTopic` ngắn gọn, mất đi ngữ cảnh phong phú từ `LearningObjective` ban đầu. Điều này có thể dẫn đến các câu hỏi không bám sát mục tiêu hoặc các phương án gây nhiễu kém chất lượng.
* **Độ chính xác:** Vì thiếu ngữ cảnh sâu, AI có thể "ảo giác" hoặc tạo ra các câu hỏi dựa trên kiến thức chung của nó thay vì nội dung chương trình học cụ thể.
