You are a Principal Backend Engineer.

The project already contains:

- Backend Foundation
- Prisma
- PostgreSQL
- Redis integration
- Authentication
- JWT
- Session Management
- RBAC middleware
- Repository-Service-Controller architecture

Do NOT modify existing authentication unless integration requires it.

Your task is to implement the complete Support Hub module.

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

Follow existing architecture.

==================================================
PROJECT STRUCTURE
==================================================

Inside:

src/modules/tickets/

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

Use the existing Ticket tables already defined in Prisma.

Do NOT redesign the schema unless absolutely necessary.

==================================================
FEATURES
==================================================

Implement:

✔ Create Ticket

✔ Get Ticket By ID

✔ List Tickets

✔ Update Ticket

✔ Delete Ticket (Soft Delete)

✔ Assign Ticket

✔ Change Status

✔ Change Priority

✔ Add Comments

✔ Upload Attachment Metadata

✔ Ticket Search

✔ Pagination

✔ Filtering

✔ Sorting

==================================================
RBAC
==================================================

Support roles:

ORG_ADMIN

SUPPORT_MANAGER

SUPPORT_AGENT

USER

Rules:

USER
- create ticket
- view own tickets

SUPPORT_AGENT
- view assigned tickets
- comment
- update status

SUPPORT_MANAGER
- assign tickets
- edit tickets
- manage all tickets

ORG_ADMIN
- full organization access

Enforce permissions using existing RBAC middleware.

==================================================
TENANT ISOLATION
==================================================

Every ticket query MUST be scoped using:

activeOrgId

Never expose another organization's data.

All repository queries must include tenant filtering.

==================================================
TICKET MODEL
==================================================

Support:

Title

Description

Status

Priority

Category

Created By

Assigned To

Tags

Attachments

Created At

Updated At

==================================================
COMMENTS
==================================================

Implement:

Create Comment

List Comments

Update Comment

Delete Comment

Support threaded discussion if schema allows.

==================================================
ATTACHMENTS
==================================================

Implement attachment metadata only.

Store:

Filename

URL

Mime Type

Uploaded By

Uploaded At

Actual file storage is NOT required.

==================================================
SEARCH
==================================================

Support:

Title

Description

Category

Status

Priority

Assigned User

Creator

Tags

==================================================
FILTERS
==================================================

Support:

Status

Priority

Category

Assigned User

Created By

Date Range

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

Support:

Newest

Oldest

Priority

Updated Time

==================================================
API ENDPOINTS
==================================================

POST   /tickets

GET    /tickets

GET    /tickets/:id

PATCH  /tickets/:id

DELETE /tickets/:id

PATCH  /tickets/:id/status

PATCH  /tickets/:id/assign

POST   /tickets/:id/comments

GET    /tickets/:id/comments

PATCH  /tickets/comments/:commentId

DELETE /tickets/comments/:commentId

POST   /tickets/:id/attachments

GET    /tickets/:id/attachments

==================================================
VALIDATION
==================================================

Use Zod.

Create DTOs for:

Create Ticket

Update Ticket

Assign Ticket

Status Update

Comment

Attachment

Search

Filters

==================================================
ERROR HANDLING
==================================================

Return standardized API responses.

Handle:

Ticket not found

Permission denied

Invalid status

Invalid assignee

Organization mismatch

==================================================
DOCUMENTATION
==================================================

Generate:

1. Folder structure

2. API documentation

3. Example requests

4. Example responses

5. List of generated files

6. Commands to verify:

npm install

npx prisma generate

npm run build

Do NOT execute migrations automatically.

==================================================
IMPORTANT
==================================================

Generate real production-ready TypeScript.

Reuse existing middleware.

Reuse authentication.

Reuse RBAC.

Reuse Prisma client.

Reuse logger.

Do not duplicate code.

Follow Repository → Service → Controller architecture.

The generated code must compile successfully with the existing project.