# Support Hub (Tickets Module) API Documentation

Production-grade Ticketing, Comments, Attachments Metadata, Pagination, Search, Filtering, and Tenant-Isolated RBAC documentation for the **Support Hub** dashboard.

---

## 🚀 Verification Commands

```bash
# 1. Install Dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Compile Production TypeScript Build
npm run build
```
*(Note: Do NOT execute migrations automatically. Run `npx prisma migrate dev` when connecting to a live PostgreSQL instance.)*

---

## 📁 Directory & File Structure

```
src/modules/tickets/
├── controllers/
│   └── ticket.controller.ts           # HTTP handlers & response formatting
├── services/
│   └── ticket.service.ts              # Business logic & RBAC permission checks
├── repositories/
│   └── ticket.repository.ts           # Prisma queries with activeOrgId tenant scoping
├── dtos/
│   └── ticket.dto.ts                  # Zod validation schemas for all routes
├── types/
│   └── ticket.types.ts                # TypeScript interfaces for filtering & pagination
├── utils/
│   └── ticket-filter.builder.ts       # Dynamic Prisma WHERE & ORDER BY query builder
└── tickets.router.ts                  # Express route definitions & middleware wiring
```

---

## 📄 List of Generated Files

1. [src/modules/tickets/types/ticket.types.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/tickets/types/ticket.types.ts)
2. [src/modules/tickets/dtos/ticket.dto.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/tickets/dtos/ticket.dto.ts)
3. [src/modules/tickets/utils/ticket-filter.builder.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/tickets/utils/ticket-filter.builder.ts)
4. [src/modules/tickets/repositories/ticket.repository.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/tickets/repositories/ticket.repository.ts)
5. [src/modules/tickets/services/ticket.service.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/tickets/services/ticket.service.ts)
6. [src/modules/tickets/controllers/ticket.controller.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/tickets/controllers/ticket.controller.ts)
7. [src/modules/tickets/tickets.router.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/tickets/tickets.router.ts)
8. [docs/tickets_api_documentation.md](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/docs/tickets_api_documentation.md)

---

## 📡 API Endpoint Reference & Examples

### 1. Create Support Ticket
`POST /api/v1/tickets`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "title": "Cannot access billing portal after org switch",
  "description": "When switching from Org A to Org B, the billing settings tab throws a 403 error.",
  "priority": "HIGH",
  "category": "BILLING",
  "tags": ["bug", "auth", "portal"]
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Support ticket created successfully",
  "data": {
    "id": "t1f7a050-1010-4b55-8b39-101010101010",
    "ticketNumber": 1,
    "orgId": "d2f7a050-2222-4b55-8b39-222222222222",
    "authorId": "c1f7a050-1234-4b55-8b39-111111111111",
    "assigneeId": null,
    "title": "Cannot access billing portal after org switch",
    "description": "When switching from Org A to Org B, the billing settings tab throws a 403 error.",
    "status": "OPEN",
    "priority": "HIGH",
    "category": "BILLING",
    "tags": ["bug", "auth", "portal"],
    "createdAt": "2026-07-30T22:35:00.000Z",
    "updatedAt": "2026-07-30T22:35:00.000Z"
  }
}
```

---

### 2. List Tickets (Search, Pagination, Filtering, Sorting)
`GET /api/v1/tickets?page=1&limit=10&status=OPEN&priority=HIGH&search=billing&sortBy=newest`

**Headers**: `Authorization: Bearer <accessToken>`

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Tickets retrieved successfully",
  "data": [
    {
      "id": "t1f7a050-1010-4b55-8b39-101010101010",
      "ticketNumber": 1,
      "title": "Cannot access billing portal after org switch",
      "status": "OPEN",
      "priority": "HIGH",
      "category": "BILLING",
      "author": {
        "id": "c1f7a050-1234-4b55-8b39-111111111111",
        "fullName": "Alice Admin",
        "email": "admin@acme.com"
      },
      "assignee": null,
      "_count": {
        "comments": 2,
        "attachments": 1
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalRecords": 1,
    "totalPages": 1
  }
}
```

---

### 3. Assign Ticket
`PATCH /api/v1/tickets/:id/assign`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "assigneeId": "u2f7a050-8888-4b55-8b39-888888888888"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ticket assigned successfully",
  "data": {
    "id": "t1f7a050-1010-4b55-8b39-101010101010",
    "assigneeId": "u2f7a050-8888-4b55-8b39-888888888888",
    "assignee": {
      "id": "u2f7a050-8888-4b55-8b39-888888888888",
      "fullName": "Bob Agent",
      "email": "agent@acme.com"
    }
  }
}
```

---

### 4. Change Ticket Status
`PATCH /api/v1/tickets/:id/status`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "status": "IN_PROGRESS"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ticket status updated successfully",
  "data": {
    "id": "t1f7a050-1010-4b55-8b39-101010101010",
    "status": "IN_PROGRESS"
  }
}
```

---

### 5. Add Comment to Ticket
`POST /api/v1/tickets/:id/comments`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "content": "Investigating the session headers for Org B context."
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Comment added successfully",
  "data": {
    "id": "m1f7a050-9999-4b55-8b39-999999999999",
    "ticketId": "t1f7a050-1010-4b55-8b39-101010101010",
    "content": "Investigating the session headers for Org B context.",
    "author": {
      "id": "u2f7a050-8888-4b55-8b39-888888888888",
      "fullName": "Bob Agent"
    },
    "createdAt": "2026-07-30T22:38:00.000Z"
  }
}
```

---

### 6. Upload Attachment Metadata
`POST /api/v1/tickets/:id/attachments`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "fileName": "error_screenshot.png",
  "fileUrl": "https://storage.acme.com/attachments/error_screenshot.png",
  "fileSize": 204800,
  "mimeType": "image/png"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Attachment uploaded successfully",
  "data": {
    "id": "a1f7a050-7777-4b55-8b39-777777777777",
    "ticketId": "t1f7a050-1010-4b55-8b39-101010101010",
    "fileName": "error_screenshot.png",
    "fileUrl": "https://storage.acme.com/attachments/error_screenshot.png",
    "fileSize": 204800,
    "mimeType": "image/png",
    "createdAt": "2026-07-30T22:39:00.000Z"
  }
}
```
