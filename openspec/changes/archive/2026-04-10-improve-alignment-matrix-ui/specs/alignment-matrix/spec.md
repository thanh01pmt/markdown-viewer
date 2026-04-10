## ADDED Requirements

### Requirement: Matrix Filter Bar
The Alignment Matrix SHALL provide a filter bar at the top of the table.

#### Scenario: Filter by Text
- **WHEN** user types "HP7" in the search input
- **THEN** only rows containing "HP7" in Lesson ID or Objectives are displayed

#### Scenario: Filter by Status
- **WHEN** user clicks the "Pending" status filter toggle
- **THEN** only lessons with status "pending" are displayed

### Requirement: Deep Navigation
The Alignment Matrix SHALL allow navigation to lesson content.

#### Scenario: Click Lesson ID
- **WHEN** user clicks on a clickable Lesson ID (e.g., "HP7-01")
- **THEN** the application SHALL switch to the "Lessons" tab and load the content for that specific lesson

### Requirement: Premium Table Styling
The Matrix table SHALL implement premium visual design features.

#### Scenario: Sticky Header
- **WHEN** user scrolls vertically in the Matrix tab
- **THEN** the table header SHALL remain visible at the top of the viewport with a blurred background effect

#### Scenario: Completion Summary
- **WHEN** the Matrix data is loaded
- **THEN** a summary bar SHALL display the total number of lessons and the percentage completion of the current view
