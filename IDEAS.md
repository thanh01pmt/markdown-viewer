## Ý tưởng chi tiết: Markdown Learning Resource Dashboard

Dựa trên các app tương tự như **GitBook**, **Docusaurus**, **Obsidian Publish**, và **Notion**, đây là bản chi tiết hóa ý tưởng:

---

### 🏗️ Kiến trúc tổng quan

```
GitHub Repo (nguồn dữ liệu)
        ↓ GitHub Raw API / Contents API
React App (SPA)
    ├── Statistics Dashboard
    ├── Resource Explorer (cây thư mục)
    ├── Markdown Preview Panel
    └── Progress Tracker
```

---

### 📐 Các màn hình chính

**1. Dashboard Overview** *(giống Notion Analytics / Linear)*
- Tổng số tài liệu theo từng giai đoạn
- Biểu đồ tình trạng hoàn thành (done / in-progress / todo)
- Heatmap đóng góp theo thời gian (giống GitHub contribution graph)
- Số từ / thời gian đọc ước tính toàn bộ repo

**2. Resource Explorer** *(giống VS Code File Tree + GitBook Sidebar)*
- Cây thư mục phân cấp theo giai đoạn
- Badge trạng thái màu sắc trên mỗi file
- Tìm kiếm full-text xuyên suốt tất cả tài liệu
- Filter theo tag, giai đoạn, trạng thái

**3. Markdown Preview Panel** *(giống GitHub MD preview + Obsidian)*
- Render markdown với syntax highlighting (code blocks)
- Mục lục tự động (TOC) từ heading
- Điều hướng Prev / Next trong cùng giai đoạn
- Nút "Xem trên GitHub" trực tiếp

**4. Statistics Detail** *(giống Codecov / SonarQube)*
- Đọc file thống kê tình trạng trong repo
- Breakdown theo giai đoạn: % hoàn thành, số file, tổng từ
- Timeline dự kiến hoàn thành

---

### 🔌 Nguồn dữ liệu — GitHub API

```
GET https://api.github.com/repos/{owner}/{repo}/contents/{path}
GET https://raw.githubusercontent.com/{owner}/{repo}/main/{file}
```

- Không cần backend — hoàn toàn client-side
- Cache bằng `localStorage` + TTL để tránh rate limit
- Hỗ trợ nhập GitHub Token để tăng rate limit (60 → 5000 req/h)

---

### 🧩 Stack đề xuất

| Layer | Công nghệ | Lý do |
|---|---|---|
| UI Framework | React + Vite | Nhanh, ecosystem lớn |
| Styling | Tailwind CSS | Utility-first, dễ responsive |
| MD Renderer | `react-markdown` + `remark-gfm` | Hỗ trợ GFM table, task list |
| Syntax highlight | `rehype-highlight` | Tích hợp sẵn với react-markdown |
| Charts | Recharts | Nhẹ, declarative |
| State | Zustand | Đơn giản hơn Redux |
| Routing | React Router v6 | Deep link đến từng file |

---