# Kiến trúc Tính năng: Ngữ cảnh Hình ảnh cho Câu hỏi AI

Tài liệu này mô tả chi tiết kiến trúc và luồng dữ liệu cho tính năng cho phép AI tạo ra các câu hỏi dựa trên ngữ cảnh hình ảnh.

## I. Tổng quan & Mục tiêu

**Mục tiêu:** Nâng cao chất lượng và chiều sâu của các câu hỏi do AI tạo ra bằng cách cho phép nó sử dụng hình ảnh (sơ đồ, ảnh chụp màn hình, biểu đồ, v.v.) làm ngữ cảnh bổ sung cho văn bản.

**Tính năng:**

1. Cho phép người dùng (tác giả) xây dựng một "Kho Ngữ cảnh Hình ảnh".
2. Trong quá trình lập kế hoạch quiz (`generateQuizPlan`), AI có thể tự động xác định và đề xuất sử dụng một hình ảnh phù hợp từ kho cho một câu hỏi cụ thể.
3. Trong quá trình sinh câu hỏi chi tiết (`generate...Question`), AI sẽ nhận cả prompt văn bản và hình ảnh để tạo ra một câu hỏi đa phương thức (multimodal) hoàn chỉnh.

## II. Triết lý Thiết kế: "Human-Guided AI"

Sau khi cân nhắc, chúng ta đã chọn một quy trình trong đó **người dùng cung cấp mô tả chi tiết cho hình ảnh**, thay vì để AI tự phân tích hình ảnh thô từ đầu trong mỗi lần chạy.

**Lý do:**

* **Độ tin cậy (Reliability):** Mô tả của con người là "nguồn chân lý" (source of truth), loại bỏ hoàn toàn nguy cơ AI "nhìn" và hiểu sai các chi tiết phức tạp hoặc tinh vi trong ảnh. Điều này đặc biệt quan trọng đối với các sơ đồ kỹ thuật hoặc ảnh chụp màn hình mã nguồn.
* **Hiệu quả (Efficiency):** Việc xử lý yêu cầu đa phương thức (văn bản + hình ảnh) tốn nhiều tài nguyên và thời gian hơn so với yêu cầu chỉ có văn bản. Bằng cách cung cấp mô tả chi tiết, chúng ta cho phép AI ở giai đoạn planning hoạt động chỉ với văn bản, giúp quá trình này nhanh hơn và rẻ hơn. Yêu cầu đa phương thức chỉ được sử dụng ở giai đoạn sinh câu hỏi cuối cùng khi thực sự cần thiết.
* **Kiểm soát (Control):** Người dùng có toàn quyền quyết định những khía cạnh nào của hình ảnh là quan trọng và cần được tập trung, đảm bảo các câu hỏi được tạo ra có giá trị sư phạm cao.

## III. Kiến trúc Luồng Dữ liệu

Luồng dữ liệu được chia thành hai giai đoạn chính: Chuẩn bị Dữ liệu (bởi người dùng) và Sinh Quiz (bởi AI).

```mermaid
graph TD
    subgraph Giai đoạn 1: Chuẩn bị Dữ liệu (Người dùng)
        A[User opens SettingsModal] --> B[Selects 'Images' Tab];
        B --> C[ManageImageContexts.tsx];
        C -- Uses --> D[ImageContextService];
        D -- Reads/Writes --> E[localStorage (Kho ImageContextItem)];
        C -- Also uses --> F[TopicDataService];
        F -- Reads --> G[localStorage (Kho LearningObjective)];
    end

    subgraph Giai đoạn 2: Sinh Quiz (Tự động)
        H[PracticeController / AuthoringModal] -- Gathers User Input & Data --> I{Start Generation};
        I -- 1. Sends LOs + ImageContexts --> J[AI Flow: generateQuizPlan];
        J -- 2. AI decides which image to use --> K[Returns QuizPlan with imageId];
        K -- 3. Plan is passed to Orchestrator --> L[AI Flow: generateQuestionsFromQuizPlan];
        L -- 4. Looks up imageUrl from imageId --> M{Builds Multimodal Input};
        M -- 5. Sends Text Prompt + Image --> N[AI Flow con: generateMCQQuestion, etc.];
        N -- 6. Returns final QuizQuestion --> L;
        L -- 7. Aggregates questions --> H;
    end

    E -- Data flows to --> I;
    G -- Data flows to --> I;
```

## IV. Phân tích Chi tiết các Thành phần

### A. Lớp Dữ liệu (Data Layer)

Đây là nền tảng của toàn bộ tính năng.

1. **`ImageContextItem` (Interface)**
    * **File:** `src/lib/interactive-quiz-kit/types/misc.ts`
    * **Cấu trúc:**

        ```typescript
        export interface ImageContextItem {
          id: string; // ID duy nhất, tự tạo
          imageUrl: string; // URL đến file ảnh
          detailedDescription: string; // Mô tả chi tiết, do người dùng nhập
          imageAltText: string; // Mô tả ngắn gọn cho alt text và caption
          subject: string;
          category: string;
          topic: string;
        }
        ```

    * **Vai trò:** Định nghĩa "hợp đồng dữ liệu" cho mỗi mục trong kho hình ảnh.

2. **`ImageContextService` (Service)**
    * **File:** `src/lib/interactive-quiz-kit/services/ImageContextService.ts`
    * **Vai trò:** Là lớp trừu tượng duy nhất để thực hiện các thao tác CRUD với kho ngữ cảnh hình ảnh trong `localStorage`.
    * **Phương thức chính:**
        * `getImageContexts()`: Lấy toàn bộ danh sách.
        * `addImageContext(context)`: Thêm một mục mới.
        * `parseTSV(content)`: Phân tích cú pháp file TSV để import hàng loạt. Header yêu cầu bao gồm: `Image URL`, `Detailed Description`, `Image Alt Text`, `Subject`, `Category`, `Topic`.
        * `mergeData(newData)`: Hợp nhất dữ liệu được import vào kho hiện có.
        * `saveImageContexts(contexts)`: Ghi đè toàn bộ kho.

### B. Lớp Giao diện (UI Layer)

1. **`ManageImageContexts.tsx` (Component)**
    * **File:** `src/lib/interactive-quiz-kit/react-ui/components/app/ManageImageContexts.tsx`
    * **Vai trò:** Cung cấp giao diện cho người dùng để quản lý kho hình ảnh.
    * **Chức năng:**
        * Hiển thị danh sách các `ImageContextItem` đã lưu.
        * Cung cấp form để thêm/sửa một mục, bao gồm các trường `imageUrl`, `imageAltText`, `detailedDescription`, và các dropdown `Subject`, `Category`, `Topic`.
        * Tích hợp chức năng import hàng loạt từ file TSV.

2. **`SettingsModal.tsx` (Component)**
    * **File:** `src/lib/interactive-quiz-kit/react-ui/components/app/SettingsModal.tsx`
    * **Vai trò:** Đóng vai trò là container, tích hợp `ManageImageContexts.tsx` vào một tab có tên "Images".

### C. Lớp AI (AI Layer)

1. **`generate-quiz-plan.ts` (Flow - Giai đoạn 1)**
    * **Input:** Nhận thêm một tham số tùy chọn `imageContexts: ImageContextItem[]`.
    * **Logic:** Prompt được sửa đổi để chứa toàn bộ kho `imageContexts` (bao gồm cả `imageAltText` và `detailedDescription`) và một chỉ dẫn rõ ràng cho AI: "Khi lên kế hoạch cho một câu hỏi, hãy xem xét chủ đề của nó. Nếu bạn tìm thấy một hình ảnh phù hợp trong kho, hãy đưa `id` của hình ảnh đó vào trường `imageId`."
    * **Output:** `PlannedQuestionSchema` được cập nhật để có thêm trường `imageId?: string`.

2. **`generate-questions-from-quiz-plan.ts` (Flow - Bộ điều phối)**
    * **Input:** Nhận thêm `imageContexts` từ client.
    * **Logic:** Khi lặp qua `quizPlan`, nếu một `plannedQ` có `imageId`, nó sẽ tìm trong `imageContexts` để lấy ra `imageUrl` tương ứng.
    * **Output:** `imageUrl` này được thêm vào đối tượng input (`clientInput`) để truyền xuống cho các hàm sinh câu hỏi con.

3. **Các hàm sinh câu hỏi con (ví dụ: `generate-mcq-question.ts`)**
    * **Input:** Schema input (`...ClientInputSchema`) được cập nhật để nhận `imageUrl?: string`.
    * **Logic:**
        * Hàm `buildEnhancedPrompt` được cập nhật. Nếu có `imageUrl`, nó sẽ thêm một chỉ dẫn vào prompt: "Câu hỏi này PHẢI dựa trên nội dung của hình ảnh được cung cấp."
        * Hàm chính sẽ kiểm tra sự tồn tại của `imageUrl`. Nếu có, nó sẽ fetch hình ảnh, chuyển đổi thành định dạng `Part` của Google GenAI SDK, và gửi một yêu cầu đa phương thức (văn bản + hình ảnh) đến AI.
    * **Output:** Đối tượng `QuizQuestion` cuối cùng sẽ có thêm thuộc tính `imageUrl` và `imageAltText` để `QuestionRenderer` có thể hiển thị nó.

## V. Hướng dẫn Mở rộng

Để một loại câu hỏi mới hỗ trợ tính năng này, một lập trình viên cần:

1. **Cập nhật `...-types.ts`:** Thêm `imageUrl: z.string().url().optional()` vào `Generate...ClientInputSchema`.
2. **Cập nhật `...question.ts`:**
    * Sửa đổi `buildEnhancedPrompt` để thêm chỉ dẫn về hình ảnh vào prompt.
    * Sửa đổi hàm chính để xây dựng mảng `parts` (văn bản + hình ảnh) và gửi yêu cầu đa phương thức.
    * Đảm bảo `imageUrl` và `imageAltText` được lưu vào đối tượng câu hỏi cuối cùng.
3. **Cập nhật `types/questions.ts`:** Đảm bảo `interface BaseQuestion` có thuộc tính `imageUrl?: string;` và `imageAltText?: string;`.
4. **Cập nhật `QuestionRenderer.tsx`:** Thêm logic để hiển thị hình ảnh và alt text nếu `question.imageUrl` tồn tại.
