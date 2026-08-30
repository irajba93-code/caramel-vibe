# GitHub Issues & Workflow Management Guide

This guide defines the standard operating procedure for AI development agents when interacting with this repository. Every agent must follow these rules to ensure development progress is accurately tracked, structured, and visible on GitHub.

---

## 1. Core Principles
- **No Work Without an Issue:** Never start writing code or implementing features without either finding an existing issue or creating a new one to track the effort.
- **Real-Time Updates:** Update issues as progress is made (e.g., when a task transitions from "To Do" to "In Progress", or is blocked).
- **Milestone Alignment:** Ensure every issue is mapped to the correct milestone when created or updated.

---

## 2. Issue Lifecycle & Rules

### A. Creating an Issue
Before starting a new task, check if a tracking issue exists. If not, create one.
1. **Title Format:** Use clear, action-oriented titles:
   - `Feat: <description>` for new features.
   - `Fix: <description>` for bugs.
   - `Chore: <description>` for refactoring, configuration, or documentation.
2. **Body Structure:** Every issue description must include:
   - **Context/User Story:** Why this task is being done and what it solves.
   - **Acceptance Criteria:** A checklist (`- [ ]`) defining exactly when the issue is considered done.
   - **Milestone:** Assign the issue to the current active milestone.

### B. Starting Work
When you begin working on an issue:
1. Add a comment to the issue stating that work has started.
2. Assign the issue to yourself (the agent/user).

### C. During Development
1. **Status Comments:** If you hit a roadblock, discover new requirements, or make a significant architectural decision, comment on the issue with:
   - What was discovered.
   - Next steps or alternate paths.
2. **Progress Checklists:** Update the acceptance criteria checkboxes in the issue description as you complete each part of the work.

### D. Completing Work
When the task is complete:
1. Reference the issue in commits or pull request descriptions using keyword triggers (e.g., `Closes #123` or `Fixes #123`).
2. Add a final summary comment outlining what was built and how it was verified.
3. Close the issue.

---

## 3. Interaction with GitHub MCP Server
When executing tasks in this repository, utilize the `github-mcp-server` tools to automate this lifecycle:
- Use `list_issues` or `search_issues` to find existing items.
- Use `issue_write` (or equivalent creation/update tools) to create and modify issues.
- Use `add_issue_comment` to post updates and progress reports.
