# Cross-Organization Collaboration API Documentation

Production-grade Organization Connections (Partner Handshake) and Cross-Tenant Resource Sharing API documentation.

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

---

## 📁 Directory & File Structure

```
src/modules/cross-org/
├── controllers/
│   └── cross-org.controller.ts        # HTTP handlers for partner connections & resource sharing
├── services/
│   └── cross-org.service.ts           # Business logic enforcing active connection requirement
├── repositories/
│   └── cross-org.repository.ts        # Prisma database queries for connections & shared resources
├── dtos/
│   └── cross-org.dto.ts               # Zod validation schemas for all endpoints
├── types/
│   └── cross-org.types.ts             # TypeScript interfaces for cross-org data structures
└── cross-org.router.ts                # Express route definitions & middleware assembly
```

---

## 📄 List of Generated Files

1. [src/modules/cross-org/types/cross-org.types.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/cross-org/types/cross-org.types.ts)
2. [src/modules/cross-org/dtos/cross-org.dto.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/cross-org/dtos/cross-org.dto.ts)
3. [src/modules/cross-org/repositories/cross-org.repository.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/cross-org/repositories/cross-org.repository.ts)
4. [src/modules/cross-org/services/cross-org.service.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/cross-org/services/cross-org.service.ts)
5. [src/modules/cross-org/controllers/cross-org.controller.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/cross-org/controllers/cross-org.controller.ts)
6. [src/modules/cross-org/cross-org.router.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/cross-org/cross-org.router.ts)
7. [docs/cross_org_api_documentation.md](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/docs/cross_org_api_documentation.md)

---

## 📡 API Endpoint Reference & Examples

### 1. Request Partner Organization Connection
`POST /api/v1/cross-org/connections`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "targetOrgSlug": "stark-industries"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Partner connection request sent successfully",
  "data": {
    "id": "c1f7a050-4444-4b55-8b39-444444444444",
    "requesterOrgId": "d2f7a050-2222-4b55-8b39-222222222222",
    "targetOrgId": "e3f7a050-3333-4b55-8b39-333333333333",
    "status": "PENDING",
    "requestedAt": "2026-07-30T23:35:00.000Z"
  }
}
```

---

### 2. Accept Partner Connection
`PATCH /api/v1/cross-org/connections/:id`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "status": "ACCEPTED"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Partner connection status updated successfully",
  "data": {
    "id": "c1f7a050-4444-4b55-8b39-444444444444",
    "status": "ACCEPTED",
    "respondedAt": "2026-07-30T23:36:00.000Z"
  }
}
```

---

### 3. Share Resource with Partner Org
`POST /api/v1/cross-org/resources`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "targetOrgId": "e3f7a050-3333-4b55-8b39-333333333333",
  "resourceType": "TICKET",
  "resourceId": "t1f7a050-1010-4b55-8b39-101010101010",
  "permission": "READ_COMMENT"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Resource shared with partner organization successfully",
  "data": {
    "id": "s1f7a050-5555-4b55-8b39-555555555555",
    "sourceOrgId": "d2f7a050-2222-4b55-8b39-222222222222",
    "targetOrgId": "e3f7a050-3333-4b55-8b39-333333333333",
    "resourceType": "TICKET",
    "resourceId": "t1f7a050-1010-4b55-8b39-101010101010",
    "permission": "READ_COMMENT",
    "createdAt": "2026-07-30T23:36:30.000Z"
  }
}
```

---

### 4. Get Shared Resource Details
`GET /api/v1/cross-org/resources/:id`

**Headers**: `Authorization: Bearer <accessToken>`

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Shared resource retrieved successfully",
  "data": {
    "shareDetails": {
      "id": "s1f7a050-5555-4b55-8b39-555555555555",
      "resourceType": "TICKET",
      "permission": "READ_COMMENT",
      "sourceOrg": { "name": "Acme Corporation", "slug": "acme-corp" },
      "targetOrg": { "name": "Stark Industries", "slug": "stark-ind" }
    },
    "resource": {
      "id": "t1f7a050-1010-4b55-8b39-101010101010",
      "ticketNumber": 1,
      "title": "Cannot access billing portal after org switch",
      "status": "OPEN",
      "priority": "HIGH"
    }
  }
}
```
