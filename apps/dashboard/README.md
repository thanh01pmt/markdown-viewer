# PATHWAY-AIoT 2026 — Dashboard

Dashboard React cho lộ trình học liệu AIoT, đọc dữ liệu trực tiếp từ GitHub repo.

## Cài đặt & Chạy

```bash
npm install
npm run dev        # development
npm run build      # production build
```

## Deploy Vercel

```bash
npm install -g vercel
vercel --prod
```

## Cấu trúc nguồn dữ liệu

```
thanh01pmt/my-agents
└── packages/the-ultimate-curriculum-agent-os/projects/pathway-aiot/
    ├── PROJECT_STATUS.md       → Dashboard + Pipeline + Roadmap
    ├── ALIGNMENT_MATRIX.md     → Tab Alignment Matrix
    ├── CHANGELOG.md            → Nhật ký thay đổi
    └── _shared/LESSONS/        → Tab Lesson Viewer (*.md files)
```

## Tính năng

- **Dashboard**: Metric cards, Pipeline Status, Roadmap 12 HP, Changelog
- **Lesson Viewer**: Sidebar file explorer + Preview panel (render / raw MD)
- **Alignment Matrix**: Bảng liên kết mục tiêu – nội dung – đánh giá
- GitHub API cache 5 phút, hỗ trợ PAT token
- Dark mode, responsive

## Cấu hình

Đổi repo trong `src/config.js`:
```js
export const REPO = {
  owner: 'thanh01pmt',
  repo: 'my-agents',
  branch: 'main',
  base: 'packages/the-ultimate-curriculum-agent-os/projects/pathway-aiot',
};
```
