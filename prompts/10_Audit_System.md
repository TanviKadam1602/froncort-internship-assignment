You are a Principal Backend Engineer.

The project already contains:

- Backend Foundation
- Shared Identity & Authentication
- RBAC
- Support Hub
- Review Console
- Cross-Organization Collaboration
- Prisma
- PostgreSQL
- Redis

The previous modules already emit audit events.

Your task is to implement the complete Audit System.

IMPORTANT

Do NOT redesign existing modules.

Consume the existing audit hooks emitted by other modules.

Follow the Repository → Service → Controller architecture.

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

src/modules/audit/

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

Reuse the existing AuditLog model.

Do NOT redesign the schema unless absolutely necessary.

==================================================
FEATURES
==================================================

Implement:

✔ Store audit events

✔ Immutable audit records

✔ Hash chain verification

✔ Audit search

✔ Audit filtering

✔ Pagination

✔ Sorting

✔ Audit timeline

✔ CSV export

✔ Integrity verification endpoint

==================================================
AUDIT RECORD
==================================================

Each audit entry should store:

Actor User ID

Organization ID

Action

Module

Resource Type

Resource ID

Previous Value

New Value

Timestamp

IP Address

User Agent

Correlation ID

Previous Hash

Current Hash

==================================================
HASH CHAIN
==================================================

Implement a cryptographic chain.

Current Hash = SHA-256(
Previous Hash +
Timestamp +
Actor +
Action +
Resource +
Payload
)

Every new record must reference the previous record.

Provide an endpoint to verify chain integrity.

==================================================
EVENT SOURCES
==================================================

Consume audit events from:

Authentication

Support Hub

Review Console

Cross-Organization Collaboration

Future modules should easily register new events.

==================================================
RBAC
==================================================

USER

No audit access.

SUPPORT_AGENT

View limited audit entries.

SUPPORT_MANAGER

View organization audit history.

ORG_ADMIN

Full organization audit access.

==================================================
TENANT ISOLATION
==================================================

Every query MUST validate:

Organization ID

Permissions

Never expose audit records from another organization.

==================================================
SEARCH
==================================================

Search by:

Actor

Action

Module

Resource

Correlation ID

==================================================
FILTERS
==================================================

Date Range

Action

Module

Actor

Resource Type

Organization

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

Action

==================================================
CSV EXPORT
==================================================

Generate downloadable CSV including:

Timestamp

Actor

Module

Action

Resource

Organization

==================================================
API ENDPOINTS
==================================================

GET /audit

GET /audit/:id

GET /audit/timeline

GET /audit/export

GET /audit/verify

==================================================
VALIDATION
==================================================

Use Zod.

Create DTOs for:

Search

Filters

Pagination

Export

==================================================
ERROR HANDLING
==================================================

Handle:

Audit record not found

Permission denied

Organization mismatch

Invalid hash chain

CSV generation failure

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

Repository-Service-Controller architecture

The generated code must compile successfully without breaking previous modules.