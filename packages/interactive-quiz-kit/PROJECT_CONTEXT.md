# Project Context

## Purpose

`interactive-quiz-kit` là một thư viện TypeScript toàn diện được thiết kế để xây dựng, quản lý và vận hành các bài kiểm tra (quiz) tương tác. Mục tiêu chính là cung cấp một bộ công cụ mạnh mẽ, linh hoạt, có thể được tích hợp vào các hệ thống lớn hơn hoặc đóng gói để chạy độc lập.

Các mục tiêu cốt lõi của dự án bao gồm:

* **Cung cấp một "Quiz Engine" Headless:** Xây dựng một lõi logic mạnh mẽ (`QuizEngine`) để quản lý toàn bộ vòng đời của một bài kiểm tra, từ việc bắt đầu, theo dõi câu trả lời, chấm điểm, đến tính toán kết quả. Engine này được thiết kế để hoạt động độc lập với giao diện người dùng.
* **Tạo Quiz bằng Trí tuệ Nhân tạo (AI):** Tích hợp sâu với các mô hình ngôn ngữ lớn (cụ thể là Google Gemini) để tự động hóa việc tạo câu hỏi. Quy trình này bao gồm việc lập kế hoạch bài kiểm tra dựa trên các mục tiêu học tập (Learning Objectives) và Thang đo tư duy Bloom (Bloom's Taxonomy), sau đó sinh ra các câu hỏi đa dạng.
* **Đóng gói SCORM:** Cung cấp khả năng xuất bản bất kỳ bài kiểm tra nào thành một gói SCORM 1.2 hoặc 2004 tiêu chuẩn, sẵn sàng để tích hợp vào bất kỳ Hệ thống Quản lý Học tập (LMS) nào tương thích.
* **Cung cấp Bộ Giao diện Người dùng (UI Kit) React:** Đi kèm một bộ component React (`react-ui`) có thể tái sử dụng và tùy chỉnh để nhanh chóng xây dựng giao diện cho người làm bài kiểm tra.

## Tech Stack

* **Ngôn ngữ chính:** TypeScript
* **Framework Giao diện:** React
* **Styling:** Tailwind CSS (theo kiến trúc và phong cách của **shadcn/ui**)
* **Build & Bundling:** `tsup`
* **Xác thực Schema & Dữ liệu:** Zod
* **Trí tuệ Nhân tạo (AI):** Google Gemini (thông qua thư viện client-side `@google/genai`)
* **Tiêu chuẩn E-learning:** SCORM (hỗ trợ phiên bản 1.2 và 2004)
* **Đóng gói file:** JSZip
* **Quốc tế hóa (i18n):** i18next & react-i18next

## Project Conventions

### Code Style

* **TypeScript First:** Toàn bộ mã nguồn phải được viết bằng TypeScript với các quy tắc `strict` được bật để đảm bảo an toàn kiểu dữ liệu tối đa.
* **Formatting:** Mã nguồn tuân thủ một định dạng nhất quán, được tự động hóa (giả định là sử dụng Prettier).
* **Naming Conventions:**
  * `PascalCase` cho các kiểu dữ liệu, interface, và component React (e.g., `QuizConfig`, `MultipleChoiceQuestionUI`).
  * `camelCase` cho các hàm, biến, và hằng số (e.g., `generateQuizPlan`, `quizEngine`).
  * **File Naming:** Các file được đặt tên một cách có hệ thống để phản ánh chức năng của chúng:
    * `<feature>.ts`: Chứa logic chính.
    * `<feature>-types.ts`: Chứa các schema Zod và kiểu TypeScript cho feature đó.
    * `<question-type>-evaluator.ts`: Chứa logic chấm điểm cho một loại câu hỏi cụ thể.
* **Styling:** Sử dụng tiện ích `cn()` (kết hợp `clsx` và `tailwind-merge`) để áp dụng các class Tailwind CSS một cách có điều kiện và an toàn.

### Architecture Patterns

1. **Strict Separation of Concerns (Tách biệt Trách nhiệm):** Đây là nguyên tắc kiến trúc quan trọng nhất của dự án.
    * **Core Logic (Lõi Logic):** Nằm trong `src/services`, `src/types`, `src/schemas`. Hoàn toàn là mã TypeScript thuần, không phụ thuộc vào môi trường (environment-agnostic) và không có bất kỳ liên kết nào với React hay DOM. `QuizEngine.ts` là trung tâm của lớp này.
    * **UI Layer (Lớp Giao diện):** Nằm trong `src/react-ui/`. Lớp này đóng vai trò là "người tiêu dùng" (consumer) của Lõi Logic. Nó nhận dữ liệu và gọi các phương thức từ Lõi Logic để hiển thị giao diện và xử lý tương tác người dùng.
    * **AI Flows (Luồng AI):** Nằm trong `src/ai/`. Các chức năng liên quan đến AI được cô lập hoàn toàn, được thiết kế để chạy phía client và chỉ tương tác với các API bên ngoài.

2. **Single Responsibility Principle (Nguyên tắc Đơn trách nhiệm):** Mỗi file, class, và component chỉ có một lý do duy nhất để thay đổi.
    * **Evaluators:** Logic chấm điểm cho mỗi loại câu hỏi (`MULTIPLE_CHOICE`, `NUMERIC`, v.v.) được tách ra thành các file evaluator riêng biệt trong `src/services/evaluators/`.
    * **UI Components:** Mỗi loại câu hỏi có một component React riêng để hiển thị (`MultipleChoiceQuestionUI.tsx`, `NumericQuestionUI.tsx`, v.v.). `QuestionRenderer.tsx` đóng vai trò là một "factory" để chọn component phù hợp.

3. **Schema-Driven Development (Phát triển dựa trên Schema):**
    * Mọi cấu trúc dữ liệu quan trọng, đặc biệt là các loại câu hỏi và dữ liệu đầu vào/đầu ra của AI, **phải** được định nghĩa bằng một **schema Zod**.
    * Các schema Zod này (`src/schemas/zod/`) là nguồn chân lý cho cấu trúc dữ liệu, đảm bảo tính toàn vẹn và giảm thiểu lỗi trong quá trình runtime.

### Testing Strategy

(Lưu ý: Không có file test nào được cung cấp, đây là chiến lược được đề xuất dựa trên kiến trúc hiện tại).

* **Unit Tests (Jest/Vitest):** Các service và hàm tiện ích trong Lõi Logic (đặc biệt là các `evaluator`) nên được kiểm thử đơn vị một cách kỹ lưỡng để đảm bảo logic chấm điểm chính xác.
* **Integration Tests:** `QuizEngine.ts` nên có các bài kiểm thử tích hợp để xác minh toàn bộ vòng đời của một bài quiz hoạt động đúng như mong đợi.
* **Component Tests (React Testing Library / Storybook):** Các component UI trong `src/react-ui/` nên được kiểm thử để đảm bảo chúng render chính xác dựa trên props đầu vào và xử lý đúng tương tác của người dùng.

### Git Workflow

(Lưu ý: Đây là quy trình được đề xuất dựa trên các best practice).

* **Branching:** Sử dụng một quy trình tương tự GitHub Flow.
  * `main`: Luôn ở trạng thái sẵn sàng để phát hành (production-ready).
  * Feature Branches (e.g., `feat/add-coding-question`, `fix/scorm-packaging`): Mọi công việc mới được thực hiện trên các nhánh riêng.
  * Pull Requests (PRs): Mọi thay đổi phải được review thông qua PR trước khi merge vào `main`.
* **Commit Conventions:** Sử dụng **Conventional Commits** để giữ cho lịch sử commit rõ ràng và có thể tự động hóa việc tạo changelog. (e.g., `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).

## Domain Context

* **E-learning & SCORM:** SCORM là một bộ tiêu chuẩn kỹ thuật cho các sản phẩm phần mềm e-learning. Nó cho phép các nội dung học tập và Hệ thống Quản lý Học tập (LMS) giao tiếp với nhau. Tính năng đóng gói SCORM của dự án là một yêu cầu cốt lõi.
* **Instructional Design (Thiết kế Dạy học):** Dự án có nhận thức về các khái niệm thiết kế dạy học, bằng chứng là việc sử dụng **Bloom's Taxonomy** trong luồng `generateQuizPlan` để tạo ra các câu hỏi ở các cấp độ nhận thức khác nhau (Ghi nhớ, Hiểu, Vận dụng, v.v.).
* **Question Types (Các loại câu hỏi):** Dự án hỗ trợ một danh sách rất đa dạng các loại câu hỏi, từ trắc nghiệm đơn giản đến các loại phức tạp như lập trình kéo-thả (Blockly, Scratch), lập trình code (Coding), và sắp xếp thứ tự (Sequence).

## Important Constraints

* **Client-Side Execution:** Các luồng AI và các dịch vụ chính được thiết kế để chạy hoàn toàn trên trình duyệt của người dùng. Điều này có nghĩa là:
  * Hiệu suất phụ thuộc vào máy của người dùng.
  * Việc quản lý API key (ví dụ: Google Gemini) phải được thực hiện ở phía client (`APIKeyService.ts` sử dụng `localStorage`).
* **SCORM Asset Pathing:** Chức năng đóng gói SCORM (`scormPackaging.ts`) yêu cầu các tài sản đã được build (JS, CSS) phải có thể truy cập được thông qua `fetch` từ một đường dẫn công khai (ví dụ: thư mục `public` trong một ứng dụng Next.js).
* **No Backend Dependency:** Thư viện này được thiết kế để hoạt động mà không cần một backend chuyên dụng. Nó tự chứa logic của mình và tương tác trực tiếp với các API bên ngoài (như Gemini).

## External Dependencies

* **Google Gemini API:** Đây là dịch vụ bên ngoài chính được sử dụng cho tất cả các tính năng sinh nội dung bằng AI. Cần có một API key hợp lệ để các tính năng này hoạt động.
* **Learning Management System (LMS):** Mặc dù không phải là một dependency trực tiếp, nhưng đầu ra của gói SCORM được thiết kế để hoạt động bên trong một LMS. Đây là môi trường vận hành mục tiêu cho các gói được xuất bản.
