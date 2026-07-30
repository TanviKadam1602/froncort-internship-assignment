You are a Principal Backend Engineer.

The project already contains:

- Backend Foundation
- Shared Identity & Authentication
- RBAC
- Support Hub
- Review Console
- Cross-Organization Collaboration
- Audit System
- AI Progress Tracker
- Prisma
- PostgreSQL
- Redis
- BullMQ

Your task is to implement the complete Notification System.

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

BullMQ

Zod

==================================================
PROJECT STRUCTURE
==================================================

Create:

src/modules/notifications/

Inside create:

controllers/

services/

repositories/

workers/

queues/

dtos/

validators/

types/

utils/

==================================================
DATABASE
==================================================

Reuse the existing Notification model.

Do NOT redesign the schema unless absolutely necessary.

==================================================
FEATURES
==================================================

Implement:

✔ Create notification

✔ List notifications

✔ Get notification

✔ Mark notification as read

✔ Mark all as read

✔ Delete notification

✔ Delete all read notifications

✔ Notification preferences

✔ Background notification queue

✔ Retry failed jobs

✔ Search

✔ Filters

✔ Pagination

==================================================
NOTIFICATION TYPES
==================================================

Support:

Support Ticket

Pull Request

Review Request

Organization Invitation

Organization Connection

Shared Resource

Audit Alert

AI Digest

System

Support future notification types using enums.

==================================================
DELIVERY
==================================================

Implement in-app notifications.

Design the service to support future Email, SMS and Push providers without changing business logic.

==================================================
EVENT SOURCES
==================================================

Generate notifications from:

Authentication

Support Hub

Review Console

Cross-Organization Collaboration

Audit System

AI Progress Tracker

==================================================
NOTIFICATION MODEL
==================================================

Store:

Recipient

Organization

Title

Message

Notification Type

Priority

Read Status

Metadata

Created At

Read At

==================================================
QUEUE
==================================================

Use BullMQ.

Queue Name:

notifications

Jobs:

Create Notification

Retry Notification

Delete Expired Notifications

==================================================
WORKER
==================================================

Create dedicated worker.

Process jobs asynchronously.

Retry failures.

Log failures.

==================================================
RBAC
==================================================

USER

View own notifications.

SUPPORT_AGENT

View own notifications.

SUPPORT_MANAGER

View own notifications.

ORG_ADMIN

View own notifications.

Administrators cannot access another user's notifications.

==================================================
TENANT ISOLATION
==================================================

Every repository query MUST validate:

User ID

Organization ID

Permissions

Never expose notifications belonging to another user.

==================================================
SEARCH
==================================================

Search by:

Title

Message

Type

Priority

==================================================
FILTERS
==================================================

Read

Unread

Priority

Notification Type

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

Priority

==================================================
API ENDPOINTS
==================================================

POST   /notifications

GET    /notifications

GET    /notifications/:id

PATCH  /notifications/:id/read

PATCH  /notifications/read-all

DELETE /notifications/:id

DELETE /notifications/read

GET    /notifications/preferences

PATCH  /notifications/preferences

==================================================
VALIDATION
==================================================

Use Zod.

Create DTOs for:

Create Notification

Preferences

Search

Filters

Pagination

==================================================
ERROR HANDLING
==================================================

Handle:

Notification not found

Permission denied

Organization mismatch

Worker failure

Queue failure

==================================================
AUDIT
==================================================

Emit audit events for:

Notification Created

Notification Read

Notification Deleted

Preference Updated

Reuse the existing audit infrastructure.

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

BullMQ

Redis

Repository-Service-Controller architecture

The generated project must compile successfully without breaking previous modules.