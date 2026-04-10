## ADDED Requirements

### Requirement: Backend Proxy
The system SHALL provide a serverless backend proxy to handle GitHub API requests securely.

#### Scenario: Successful Proxy
- **WHEN** the client requests `/.netlify/functions/github?path=README.md`
- **THEN** the backend SHALL fetch the content from GitHub using the server-side `GITHUB_TOKEN`
- **AND** return the data to the client without exposing the token

### Requirement: Partial/Aggregated Fetching
The backend SHALL support fetching multiple related resources in a single call to optimize "parts" loading.

#### Scenario: Aggregate Projects Data
- **WHEN** the client requests `/.netlify/functions/github?action=aggregate&project=my-repo`
- **THEN** the backend SHALL fetch `PROJECT_STATUS.md`, `ALIGNMENT_MATRIX.md`, and file lists in parallel
- **AND** return a consolidated JSON object
