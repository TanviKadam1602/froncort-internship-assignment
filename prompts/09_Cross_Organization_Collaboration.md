You are a Principal Backend Engineer.

The project already contains:

- Backend Foundation
- Shared Identity & Authentication
- RBAC
- Support Hub
- Review Console
- Prisma
- PostgreSQL
- Redis

Your task is to implement the complete Cross-Organization Collaboration module.

IMPORTANT

Reuse the existing architecture.

Do NOT redesign previous modules.

Follow the Repository → Service → Controller pattern.

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

Create:

src/modules/collaboration/

Inside create:

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

Reuse the existing models:

OrganizationConnection
SharedResource

Do NOT modify the schema unless absolutely necessary.

==================================================
FEATURES
==================================================

Implement:

✔ Send organization connection request

✔ Accept request

✔ Reject request

✔ Cancel request

✔ Remove connection

✔ List organization connections

✔ Share resource

✔ Stop sharing resource

✔ Update sharing permissions

✔ List shared resources

✔ View shared resource

✔ Search shared resources

✔ Filter shared resources

✔ Pagination

✔ Sorting

==================================================
RESOURCE TYPES
==================================================

Support sharing:

Tickets

Pull Requests

Documents

Attachments

Future resource types via enum support.

==================================================
PERMISSIONS
==================================================

Support permissions:

VIEW

COMMENT

EDIT

ADMIN

Validate permissions on every request.

==================================================
RBAC
==================================================

USER

View only permitted shared resources.

SUPPORT_AGENT

View + Comment.

SUPPORT_MANAGER

Manage shared resources.

ORG_ADMIN

Manage organization connections.

==================================================
TENANT ISOLATION
==================================================

Every repository query MUST validate:

Current Organization

Connected Organization

Permission

Never expose resources to unauthorized organizations.

==================================================
CONNECTION STATES
==================================================

Support:

Pending

Accepted

Rejected

Cancelled

Disconnected

Validate allowed state transitions.

==================================================
RESOURCE SHARING
==================================================

Store:

Resource Type

Resource ID

Owner Organization

Shared Organization

Permission

Shared By

Shared At

Updated At

==================================================
SEARCH
==================================================

Search by:

Organization

Resource Name

Resource Type

Shared By

==================================================
FILTERS
==================================================

Connection Status

Permission

Resource Type

Organization

Date Range

==================================================
PAGINATION
==================================================

Support:

page

limit

totalPages

totalRecords

==================================================
SORTING
==================================================

Newest

Oldest

Recently Shared

==================================================
API ENDPOINTS
==================================================

POST   /collaboration/connections

GET    /collaboration/connections

PATCH  /collaboration/connections/:id/accept

PATCH  /collaboration/connections/:id/reject

PATCH  /collaboration/connections/:id/cancel

DELETE /collaboration/connections/:id

POST   /collaboration/resources

GET    /collaboration/resources

GET    /collaboration/resources/:id

PATCH  /collaboration/resources/:id

DELETE /collaboration/resources/:id

==================================================
VALIDATION
==================================================

Use Zod.

Create DTOs for:

Create Connection

Update Connection

Share Resource

Update Permission

Search

Filters

==================================================
ERROR HANDLING
==================================================

Handle:

Organization not found

Connection already exists

Invalid state transition

Permission denied

Resource not found

Organization mismatch

Connection required

==================================================
AUDIT PREPARATION
==================================================

Emit reusable audit events for:

Connection Created

Connection Accepted

Connection Removed

Resource Shared

Permission Updated

Resource Unshared

Do NOT implement the Audit module yet.

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

Repository-Service-Controller pattern

The generated project must compile successfully without breaking existing modules.