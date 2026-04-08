# content-engine Specification

## Purpose
TBD - created by archiving change setup-content-engine-sync. Update Purpose after archive.
## Requirements
### Requirement: Mandatory Metadata Validation
Mọi file nội dung (MDX) MUST tuân thủ strict schema định nghĩa bởi Zod.

#### Scenario: Schema Enforcement
- **WHEN** Một file MDX thiếu trường `title` hoặc `type`
- **THEN** Astro Content Collections MUST throw lỗi validation trong quá trình build.

### Requirement: Automated Content Cloning
Hệ thống SHALL có khả năng tự động tải về nội dung từ một repository chỉ định trong quá trình build trên môi trường CI/CD.

#### Scenario: Netlify Build
- **WHEN** Lệnh `npm run build` được gọi trên Netlify
- **THEN** Một tiến trình pre-build MUST thực hiện `git clone` nội dung bài học vào thư mục `src/content/`.

### Requirement: Global Collection Mapping
Hệ thống SHALL hỗ trợ việc ánh xạ linh hoạt nhiều loại nội dung (collections) vào cùng một hệ thống routing.

#### Scenario: Slug Resolution
- **WHEN** Truy cập vào URL `/labs/intro-python`
- **THEN** Hệ thống MUST tìm kiếm item `intro-python` trong collection `labs` và render trang tương ứng.

