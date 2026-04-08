# viewer-core Specification

## Purpose
TBD - created by archiving change init-markdown-viewer. Update Purpose after archive.
## Requirements
### Requirement: Dynamic Content Routing
Ứng dụng SHALL sử dụng hệ thống dynamic routing của Astro để tự động ánh xạ các file trong `src/content/` tới các đường dẫn URL tương ứng.

#### Scenario: Success
- **WHEN** một file MDX mới được thêm vào `src/content/lessons/hello-world.mdx`
- **THEN** URL `/lessons/hello-world` SHALL hiển thị nội dung đó sử dụng `LessonPlanLayout`

### Requirement: Content Validation
Mọi nội dung SHALL được validate thông qua Zod schemas định nghĩa trong `src/content/config.ts`.

#### Scenario: Validation Error
- **WHEN** một file MDX thiếu trường bắt buộc trong frontmatter (ví dụ: `title`)
- **THEN** Astro SHALL báo lỗi build và không cho phép deploy.

### Requirement: Specialized Layouts
Ứng dụng SHALL hỗ trợ ít nhất 4 loại layout chuyên dụng: `LessonPlan`, `Slide`, `Quiz`, `Lab`.

#### Scenario: Layout Selection
- **WHEN** frontmatter của file MDX chỉ định `type: 'slide'`
- **THEN** ứng dụng SHALL sử dụng `SlideLayout` để render trang đó.

