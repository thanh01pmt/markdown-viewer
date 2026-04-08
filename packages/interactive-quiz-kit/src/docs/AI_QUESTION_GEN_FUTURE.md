# Kiến trúc Sinh câu hỏi bằng AI (Tầm nhìn Tương lai - Quy trình Kiên cường)

Tài liệu này mô tả kiến trúc thế hệ tiếp theo cho hệ thống sinh câu hỏi bằng AI của `interactive-quiz-kit`. Quy trình này được thiết kế để đạt được sự cân bằng tối ưu giữa **chất lượng sư phạm cao**, **hiệu quả về chi phí**, và quan trọng nhất là **độ tin cậy và khả năng phục hồi lỗi (robustness and resilience)** trong môi trường sản xuất.

## I. Tổng quan về Triết lý "Plan-then-Iterate"

Quy trình tương lai dựa trên triết lý **"Lên kế hoạch Tổng thể, Thực thi Từng phần" (Plan Globally, Execute Locally)**. Cách tiếp cận này giải quyết những thách thức cố hữu của việc tạo ra các cấu trúc JSON phức tạp bằng AI, đồng thời tối đa hóa chất lượng của từng câu hỏi.

Quy trình được chia thành ba giai đoạn chính, có thể được triển khai tuần tự:

1. **Giai đoạn 1: Lập kế hoạch Chiến lược (Strategic Planning):** Một lệnh gọi AI duy nhất, tập trung vào nhiệm vụ tư duy bậc cao: phân tích sâu nội dung, xác định các hiểu lầm phổ biến của người học, và vạch ra một "bản thiết kế" (blueprint) chi tiết cho toàn bộ bài kiểm tra.
2. **Giai đoạn 2: Thực thi Lặp lại & Kiên cường (Iterative & Resilient Implementation):** Một vòng lặp tự động thực thi từng mục trong bản thiết kế. Mỗi vòng lặp là một quy trình nhỏ, được kiểm soát chặt chẽ để tạo ra một câu hỏi duy nhất. Quy trình này được tích hợp sẵn logic tự sửa lỗi và thử lại thông minh.
3. **Giai đoạn 3: Đánh giá và Hoàn thiện (Assessment & Finalization):** Một lớp đảm bảo chất lượng cuối cùng, bao gồm cả việc sử dụng AI để "phản biện" và đánh giá các câu hỏi đã được tạo ra, đảm bảo tính nhất quán và chất lượng tổng thể của bài kiểm tra.

---

## Giai đoạn 1: Lập kế hoạch Chiến lược

### 1.1. Mục tiêu

Tạo ra một bản kế hoạch (blueprint) chi tiết và có giá trị sư phạm cao cho toàn bộ bài kiểm tra từ một lệnh gọi AI duy nhất, giảm thiểu rủi ro lỗi định dạng.

### 1.2. Luồng Dữ liệu

**Đầu vào:** Một hoặc nhiều đối tượng `LearningObjective` đã được làm giàu.

**Ví dụ về `LearningObjective` được làm giàu:**

```typescript
{
  code: "SL-FN-02",
  description: "Define Swift functions using correct func syntax...",
  subject: "App Development With Swift",
  topic: "Functions",
  // Dữ liệu mới được làm giàu:
  difficultyCode: "EASY",
  bloomLevels: ["Remembering", "Understanding"],
  examples: [
    "func greet(person: String) -> String { return \"Hello, \" + person + \"!\" }"
  ],
  commonMisconceptions: [
    "Thinking 'func' is a variable.",
    "Confusing external parameter labels with internal parameter names.",
    "Forgetting the '->' for return types."
  ]
}
```

**Prompt Gửi đến AI:** Prompt này yêu cầu AI thực hiện nhiều nhiệm vụ và trả về kết quả dưới dạng văn bản có cấu trúc để dễ dàng phân tích cú pháp (parse).

```markdown
# GIAI ĐOẠN LẬP KẾ HOẠCH: PHÂN TÍCH NỘI DUNG & TẠO BẢN THIẾT KẾ QUIZ

**Chủ đề:** Functions in Swift
**Đối tượng:** Người mới bắt đầu học lập trình Swift

## NHIỆM VỤ 1: PHÂN TÍCH NỘI DUNG CHUYÊN SÂU
Dựa trên các Mục tiêu Học tập (Learning Objectives) được cung cấp, hãy phân tích và cung cấp:
1.  **Các Khái niệm Cốt lõi:** Liệt kê 3-5 khái niệm quan trọng nhất mà người học phải nắm vững.
2.  **Các Hiểu lầm Phổ biến:** Từ các `commonMisconceptions` được cung cấp và kiến thức của bạn, liệt kê 5-7 hiểu lầm cụ thể.
3.  **Phân loại Mức độ Nhận thức:** Ánh xạ các khái niệm cốt lõi tới các cấp độ của thang đo Bloom.

## NHIỆM VỤ 2: TẠO BẢN THIẾT KẾ CÂU HỎI
Tạo một kế hoạch chiến lược cho 10 câu hỏi dưới dạng một bảng Markdown. Mỗi hàng đại diện cho một câu hỏi và phải bao gồm các cột sau:
- **Q_ID:** ID duy nhất cho câu hỏi (từ 1 đến 10).
- **Concept_To_Test:** Khái niệm cốt lõi cụ thể mà câu hỏi này sẽ kiểm tra.
- **Bloom_Level:** Cấp độ Bloom tương ứng (ví dụ: Remembering, Understanding).
- **Target_Misconception:** Hiểu lầm cụ thể mà câu hỏi này nhắm đến (nếu có).
- **Question_Type:** Loại câu hỏi được đề xuất (ví dụ: multiple_choice, TRUE_FALSE).

## NHIỆM VỤ 3: ĐỊNH NGHĨA TIÊU CHÍ THÀNH CÔNG
Định nghĩa các tiêu chí chất lượng chung cho tất cả các câu hỏi sẽ được tạo ra.
- **Min_Clarity_Score (1-10):**
- **Min_Distractor_Plausibility (1-10):**
- **Explanation_Min_Words:**

**QUAN TRỌNG:** Trả lời toàn bộ dưới dạng văn bản có cấu trúc, sử dụng các tiêu đề Markdown. KHÔNG sử dụng định dạng JSON cho đầu ra này.
```

**Đầu ra Dự kiến từ AI (Dạng Text):**

```text
# CONTENT ANALYSIS
## Core Concepts
1.  `func` keyword and basic function signature.
2.  Parameters: internal and external names.
3.  Return types using `->`.
4.  Void return type.

## Common Misconceptions
1.  Confusing `->` with `:` or `=>`.
2.  Forgetting the `&` when passing `inout` parameters.
3.  Thinking `guard let` variables are only available inside the `else` block.
4.  Believing a function can have multiple variadic parameters.
5.  Incorrectly identifying the correct answer when multiple options seem plausible.

## Bloom's Taxonomy Mapping
- `func` keyword: Remembering
- Parameters: Understanding
- Return types: Remembering
- Void return type: Understanding

# QUESTION BLUEPRINT
| Q_ID | Concept_To_Test | Bloom_Level | Target_Misconception | Question_Type |
|---|---|---|---|---|
| 1 | `func` keyword usage | Remembering | N/A | multiple_choice |
| 2 | Return type syntax (`->`) | Remembering | Confusing `->` with `:` or `=>` | multiple_choice |
| 3 | Void return type | Understanding | N/A | TRUE_FALSE |
| 4 | Parameter syntax | Understanding | Confusing parameter labels | multiple_choice |
... (và các câu hỏi còn lại)

# SUCCESS CRITERIA
Min_Clarity_Score: 8
Min_Distractor_Plausibility: 7
Explanation_Min_Words: 30
```

**Xử lý phía Client:** Một service mới (ví dụ: `PlanningParserService`) sẽ nhận chuỗi văn bản này và phân tích nó thành một đối tượng JSON có cấu trúc để sử dụng trong giai đoạn tiếp theo.

---

## Giai đoạn 2: Thực thi Lặp lại & Kiên cường

### 2.1. Mục tiêu

Tạo ra từng câu hỏi một cách đáng tin cậy dựa trên bản thiết kế, với các cơ chế xác thực và thử lại tự động.

### 2.2. Luồng Dữ liệu (Trong một vòng lặp)

**Đầu vào:** Một đối tượng "blueprint" cho một câu hỏi từ Giai đoạn 1.

**Ví dụ Blueprint cho Q2:**

```typescript
{
  q_id: 2,
  concept_to_test: "Return type syntax (`->`)",
  bloom_level: "Remembering",
  target_misconception: "Confusing `->` with `:` or `=>`",
  question_type: "MULTIPLE_CHOICE"
}
```

**Prompt Gửi đến AI (cho một câu hỏi):** Prompt này rất cụ thể và chỉ yêu cầu một nhiệm vụ duy nhất: tạo JSON.

```markdown
# SINGLE QUESTION GENERATION

## Context from Planning:
- Topic: Functions in Swift
- Target Concept: Return type syntax (`->`)
- Target Misconception: Students often confuse the `->` symbol with `:` or `=>` from other languages.
- Bloom Level: Remembering

## Task: Generate ONE high-quality multiple-choice question.

### Requirements:
1.  The question must test the correct usage of the return type symbol.
2.  The distractors MUST be based on the target misconception.
3.  Provide a detailed explanation.

### Output Format (EXACT JSON structure required):
```json
{
  "questionText": "In Swift, which symbol is used to specify a function's return type?",
  "options": {
    "A": ":",
    "B": "=>",
    "C": "->",
    "D": "returns"
  },
  "correctAnswer": "C",
  "explanation": "The arrow `->` is used to separate the function's parameter list from its return type. The colon `:` is used for type annotation of variables and parameters.",
  "aiMetadata": {
      "targetedMisconception": "Confusing `->` with `:` or `=>`",
      "confidenceScore": 9.5
  }
}
```

**QUAN TRỌNG:** Chỉ trả về duy nhất khối mã JSON.

**Logic Xác thực & Thử lại (Phía Client):**

1. **Nhận phản hồi:** Lấy chuỗi văn bản từ AI.
2. **Sửa lỗi JSON (Tùy chọn):** Chạy `SmartJSONValidator` để sửa các lỗi cú pháp phổ biến.
3. **Xác thực Cấu trúc:** Dùng Zod schema để parse và xác thực cấu trúc JSON. Nếu thất bại, ghi nhận lỗi và chuyển sang lần thử lại.
4. **Xác thực Nội dung:** Chạy `QuestionValidator` để kiểm tra các quy tắc (độ dài, từ cấm). Nếu thất bại, ghi nhận lỗi và chuyển sang lần thử lại.
5. **Thử lại:** Nếu thất bại, vòng lặp sẽ thử lại (tối đa N lần). Mỗi lần có thể sử dụng một `PromptVariation` khác nhau (ví dụ: thêm chỉ dẫn "hãy cẩn thận với dấu ngoặc kép").
6. **Thành công:** Nếu tất cả các bước xác thực đều qua, câu hỏi được thêm vào danh sách kết quả.

**Đầu ra (Sau một vòng lặp thành công):** Một đối tượng `QuizQuestion` hoàn chỉnh.

---

## Giai đoạn 3: Đánh giá và Hoàn thiện

### 3.1. Mục tiêu

Đảm bảo chất lượng và tính nhất quán của toàn bộ bộ câu hỏi trước khi đưa vào sử dụng.

### 3.2. Luồng Dữ liệu

**Đầu vào:** Một mảng các đối tượng `QuizQuestion` đã được tạo và xác thực ở Giai đoạn 2.

**Quy trình:**

1. **Đánh giá Chất lượng bằng AI (Tùy chọn):**
    * **Prompt:** Gửi từng câu hỏi đến một luồng AI "thẩm định" và yêu cầu cho điểm dựa trên các tiêu chí (rõ ràng, chất lượng đáp án nhiễu, v.v.) và đưa ra đề xuất (`ACCEPT`/`REVISE`/`REJECT`).
    * **Hành động:** Các câu hỏi bị `REJECT` hoặc có điểm thấp có thể được tự động gửi lại Giai đoạn 2 để tạo mới.
2. **Kiểm tra Chéo (Cross-Question Validation):**
    * Kiểm tra sự trùng lặp về nội dung giữa các câu hỏi.
    * Kiểm tra xem tiến trình độ khó (dựa trên `bloomLevel`) có hợp lý không (ví dụ: không nên bắt đầu bằng một câu hỏi "Applying").
    * Đảm bảo các khái niệm cốt lõi trong bản thiết kế đã được bao phủ đủ.

**Đầu ra Cuối cùng:** Một đối tượng `QuizConfig` hoàn chỉnh, chất lượng cao, sẵn sàng để đưa vào `QuizPlayer`.

## IV. Kế hoạch Triển khai (Các Cột mốc)

1. **Cột mốc 1: Hoàn thiện Lớp Dữ liệu**
    * [ ] Cập nhật interface `LearningObjective` trong `types/learning-objectives.ts`.
    * [ ] Cập nhật `TopicDataService` để parse file TSV đã được làm giàu.

2. **Cột mốc 2: Xây dựng Giai đoạn Lập kế hoạch**
    * [ ] Tạo luồng AI mới `generateQuizBlueprint`.
    * [ ] Xây dựng `PlanningParserService` để chuyển đổi đầu ra văn bản của AI thành đối tượng JSON.

3. **Cột mốc 3: Xây dựng Vòng lặp Thực thi**
    * [ ] Tạo luồng AI mới `generateSingleQuestionFromBlueprint`.
    * [ ] Xây dựng `QuestionValidatorService` chứa logic xác thực cấu trúc và nội dung.
    * [ ] Triển khai logic vòng lặp và thử lại trong `PracticeSetup.tsx` hoặc một service điều phối mới.

4. **Cột mốc 4: Tích hợp và Hoàn thiện**
    * [ ] Kết nối các giai đoạn lại với nhau.
    * [ ] (Tùy chọn) Triển khai Giai đoạn 3 - Đánh giá Chất lượng bằng AI.
