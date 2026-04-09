# BÁO CÁO NGHIÊN CỨU HỆ THỐNG CURRICULUM OS & TRIỂN KHAI DASHBOARD

## 1. Tổng quan hệ thống (System Overview)

Dựa trên việc nghiên cứu Repo `the-ultimate-curriculum-agent-os` (Curriculum OS) và ý tưởng trong `IDEAS.md`, chúng ta có một hệ sinh thái học liệu được vận hành bởi các AI Agents chuyên biệt. 

**Mối liên hệ chính:**
*   **Dữ liệu nguồn:** GitHub Repository chứa các file Markdown có cấu trúc chặt chẽ.
*   **Logic Dashboard:** Sử dụng các file "Single Source of Truth" (SSOT) như `PROJECT_STATUS.md` và `ALIGNMENT_MATRIX.md` để tự động hóa việc hiển thị tiến độ và trạng thái học liệu.

---

## 2. Phân tích Cấu trúc Thư mục & Document

Hệ thống Curriculum OS chia làm 2 khu vực chính:

### A. Khu vực Vận hành (`.agents/`)
Đây là nơi định nghĩa "cách làm". Dashboard cần đọc các file này để hiểu quy trình:
*   **Rules:** Định nghĩa các chốt chặn phê duyệt (`approval-gates.md`) và cách đặt nhãn lỗi (`feedback-labels-protocol.md`).
*   **Workflows:** Các bước thực hiện từ khi nhận Brief (`startcurriculum.md`) đến khi bàn giao (`handover.md`).

### B. Khu vực Dữ liệu Dự án (`projects/pathway-aiot/`)
Đây là nơi chứa nội dung thực tế. Cấu trúc được chia theo Agent (Vai trò):
*   `_analyst/`: Chứa `LEARNER_PROFILE.md` và `PROJECT_BRIEF.md` (Giai đoạn 1).
*   `_designer/`: Chứa `CURRICULUM_FRAMEWORK.md` và `ART_DIRECTION.md` (Giai đoạn 2-3).
*   `_content/lessons/`: Nơi chứa các bản thảo (`draft.md`).
*   `_shared/LESSONS/`: **(Quan trọng)** Chứa các file Lesson hoàn thiện đã qua Review. Dashboard sẽ lấy nội dung từ đây để hiển thị.
*   `_assets/`: Chứa `images` và `schematics` (sơ đồ Mermaid).

---

## 3. Cơ chế theo dõi tiến độ (Progress Tracking)

Dashboard trong ảnh được hiện thực hóa dựa trên 2 file cốt lõi:

### 1. `PROJECT_STATUS.md` ➔ Pipeline Status & Checklist
File này chứa bảng trạng thái theo từng Phase. 
- **Application Logic:** React App sẽ parse bảng Markdown này để tính toán % hoàn thành (ví dụ: `18/19 artifacts`) và hiển thị các badge (✅ Approved, ⏳ Pending).

### 2. `ALIGNMENT_MATRIX.md` ➔ Roadmap & Milestone
File này theo dõi tính nhất quán giữa Mục tiêu - Nội dung - Thực hành.
- **Application Logic:** Cột "Status" trong bảng này quyết định việc học phần đó đã "Done" hay chưa trên bản đồ Roadmap 12 học phần.

---

## 4. Hiện thực hóa giao diện (UI Mapping)

| Thành phần trên Dashboard (Ảnh) | Nguồn dữ liệu (File/Path) |
| :--- | :--- |
| **Pipeline Status (Bên trái)** | Bảng trong `PROJECT_STATUS.md` -> Section 1. |
| **Lộ trình 12 học phần (Bên phải)** | Section 2 trong `PROJECT_STATUS.md` (Roadmap). |
| **Nội dung đã sản xuất (HP7)** | Bảng trong `ALIGNMENT_MATRIX.md` hoặc danh sách file trong `_shared/LESSONS/`. |
| **Nhật ký thay đổi (Changelog)** | Section 3 trong `PROJECT_STATUS.md` hoặc file `CHANGELOG.md` gốc. |
| **Màn hình Preview Lesson** | Đọc nội dung file Markdown từ `_shared/LESSONS/LESSON_HP7_XX.md`. |

---

## 5. Đề xuất Kỹ thuật (Technical Implementation)

1.  **Fetching Data**: 
    - Dùng `Octokit` (GitHub SDK) để fetch danh sách file và nội dung raw.
    - Path mẫu: `repos/{owner}/{repo}/contents/projects/pathway-aiot/PROJECT_STATUS.md`.
2.  **Parsing Markdown**: 
    - Sử dụng `unified` + `remark-parse` + `remark-gfm` để biến bảng Markdown thành JSON objects dễ xử lý cho Chart/Table.
3.  **Authentication**:
    - Hỗ trợ Personal Access Token (PAT) để truy cập repo private nếu cần và tránh rate limit.
4.  **Styling**:
    - Áp dụng Glassmorphism và Dark Mode như trong ảnh mẫu bằng Tailwind CSS.
    - Sử dụng `framer-motion` cho các micro-animations khi chuyển đổi giữa Preview và Dashboard.

---
**Kết luận:** Ý tưởng phát triển dashboard này hoàn toàn khả thi vì cấu trúc dữ liệu của Curriculum OS đã rất chuẩn hóa. Dashboard không chỉ là công cụ xem bài học mà còn là công cụ quản trị dự án (Project Management) cho đội ngũ Content Creator.
