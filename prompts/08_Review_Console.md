You are a Principal Backend Engineer.

The project already contains:

- Backend Foundation
- Authentication & Shared Identity
- RBAC Middleware
- Support Hub Module
- Prisma
- PostgreSQL
- Redis
- Repository-Service-Controller architecture

Your task is to implement the complete Review Console module.

IMPORTANT

Do NOT modify existing modules unless integration requires it.

Reuse existing architecture.

==================================================
TECH STACK
==================================================

Node.js

Express

TypeScript

Prisma

PostgreSQL

Redis

Zod

==================================================
PROJECT STRUCTURE
==================================================

Inside:

src/modules/prs/

Create:

controllers/

services/

repositories/

dtos/

validators/

types/

utils/

==================================================
DATABASE
==================================================

Use the existing PullRequest, PRReviewer and PRVersion models already present in Prisma.

Do NOT redesign the schema unless absolutely necessary.

==================================================
FEATURES
==================================================

Implement:

✔ Create Pull Request

✔ Get Pull Request

✔ List Pull Requests

✔ Update Pull Request

✔ Close Pull Request

✔ Reopen Pull Request

✔ Assign Reviewers

✔ Remove Reviewers

✔ Approve Pull Request

✔ Request Changes

✔ Reject Pull Request

✔ Merge Pull Request

✔ Version History

✔ PR Timeline

✔ Comments

✔ Search

✔ Pagination

✔ Filtering

✔ Sorting

==================================================
RBAC
==================================================

USER

- Create PR
- View own PR

SUPPORT_AGENT

- Review assigned PRs

SUPPORT_MANAGER

- Review all PRs
- Assign reviewers

ORG_ADMIN

- Full organization control

Use existing RBAC middleware.

==================================================
TENANT ISOLATION
==================================================

Every repository query MUST include:

activeOrgId

Never expose another organization's PRs.

==================================================
PR MODEL
==================================================

Support:

Title

Description

Source Branch

Target Branch

Status

Labels

Author

Reviewers

Approvals

Requested Changes

Merge Status

Merged By

Merged At

==================================================
VERSION HISTORY
==================================================

Every update to a PR should create a version snapshot.

Store:

Version Number

Editor

Timestamp

Snapshot Payload

Provide endpoint to retrieve version history.

==================================================
COMMENTS
==================================================

Implement:

Create Comment

Edit Comment

Delete Comment

List Comments

==================================================
WORKFLOW
==================================================

Support:

Draft

Open

In Review

Changes Requested

Approved

Merged

Closed

Validate allowed state transitions.

==================================================
SEARCH
==================================================

Support:

Title

Description

Author

Reviewer

Status

Labels

==================================================
FILTERS
==================================================

Status

Reviewer

Author

Date Range

Merge State

==================================================
PAGINATION
==================================================

Implement:

page

limit

totalPages

totalRecords

==================================================
SORTING
==================================================

Newest

Oldest

Recently Updated

==================================================
API ENDPOINTS
==================================================

POST   /prs

GET    /prs

GET    /prs/:id

PATCH  /prs/:id

DELETE /prs/:id

PATCH  /prs/:id/status

PATCH  /prs/:id/merge

PATCH  /prs/:id/approve

PATCH  /prs/:id/request-changes

PATCH  /prs/:id/reviewers

GET    /prs/:id/versions

POST   /prs/:id/comments

GET    /prs/:id/comments

PATCH  /prs/comments/:commentId

DELETE /prs/comments/:commentId

==================================================
VALIDATION
==================================================

Use Zod.

Create DTOs for:

Create PR

Update PR

Assign Reviewer

Approve

Request Changes

Merge

Comment

Search

Filters

==================================================
ERROR HANDLING
==================================================

Handle:

PR not found

Permission denied

Reviewer already assigned

Invalid transition

Already merged

Organization mismatch

==================================================
AUDIT PREPARATION
==================================================

Whenever important actions occur:

Create PR

Approve

Merge

Request Changes

Close

Create reusable audit event hooks.

Do NOT implement the audit module yet.

==================================================
DOCUMENTATION
==================================================

Generate:

1. Folder structure

2. API documentation

3. Example requests

4. Example responses

5. Generated file list

6. Commands to verify:

npm install

npx prisma generate

npm run build

Do NOT execute migrations automatically.

==================================================
IMPORTANT
==================================================

Generate production-ready TypeScript.

Reuse:

Authentication

RBAC

Logger

Prisma

Middleware

Validation

Repository-Service-Controller pattern

The generated project must compile successfully without breaking existing modules.