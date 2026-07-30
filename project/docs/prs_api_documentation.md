# Review Console (Pull Requests Module) API Documentation

Production-grade PR Workflow, $N$-Approval Engine, PR Versioning Snapshots, Textual Version Diffs, and Discussion Comments API documentation for the **Review Console** dashboard.

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
src/modules/prs/
├── controllers/
│   └── pr.controller.ts              # HTTP handlers for PRs, reviews, diffs, & comments
├── services/
│   └── pr.service.ts                 # Business logic, versioning snapshots, & N-approval engine
├── repositories/
│   └── pr.repository.ts              # Prisma database queries with activeOrgId tenant scoping
├── dtos/
│   └── pr.dto.ts                     # Zod validation schemas for all routes
├── types/
│   └── pr.types.ts                   # TypeScript interfaces for PR filter options & diff format
├── utils/
│   └── pr-diff.builder.ts            # Textual unified diff generator between versions
└── prs.router.ts                     # Express router with RBAC and middleware pipeline
```

---

## 📄 List of Generated Files

1. [src/modules/prs/types/pr.types.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/prs/types/pr.types.ts)
2. [src/modules/prs/dtos/pr.dto.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/prs/dtos/pr.dto.ts)
3. [src/modules/prs/utils/pr-diff.builder.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/prs/utils/pr-diff.builder.ts)
4. [src/modules/prs/repositories/pr.repository.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/prs/repositories/pr.repository.ts)
5. [src/modules/prs/services/pr.service.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/prs/services/pr.service.ts)
6. [src/modules/prs/controllers/pr.controller.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/prs/controllers/pr.controller.ts)
7. [src/modules/prs/prs.router.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/prs/prs.router.ts)
8. [docs/prs_api_documentation.md](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/docs/prs_api_documentation.md)

---

## 📡 API Endpoint Reference & Examples

### 1. Create Pull Request (Version 1 Snapshot)
`POST /api/v1/prs`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "title": "Refactor JWT Auth Middleware",
  "description": "Implements Redis jti blacklisting and session hydration.",
  "diffContent": "const authenticate = () => { console.log('v1'); }",
  "requiresNApprovals": 2,
  "reviewerIds": ["r1f7a050-8888-4b55-8b39-888888888888"]
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Pull Request created successfully",
  "data": {
    "id": "p1f7a050-1010-4b55-8b39-101010101010",
    "prNumber": 1,
    "orgId": "d2f7a050-2222-4b55-8b39-222222222222",
    "title": "Refactor JWT Auth Middleware",
    "status": "DRAFT",
    "requiresNApprovals": 2,
    "currentVersionNumber": 1,
    "createdAt": "2026-07-30T23:15:00.000Z"
  }
}
```

---

### 2. Update PR & Create Version Snapshot
`PATCH /api/v1/prs/:id`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "title": "Refactor JWT Auth Middleware v2",
  "diffContent": "const authenticate = () => { console.log('v2 with Redis check'); }"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Pull Request updated successfully",
  "data": {
    "id": "p1f7a050-1010-4b55-8b39-101010101010",
    "currentVersionNumber": 2,
    "title": "Refactor JWT Auth Middleware v2"
  }
}
```

---

### 3. Record Reviewer Vote ($N$-Approval Threshold Check)
`POST /api/v1/prs/:id/review`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "status": "APPROVED",
  "comment": "LGTM! Ready to merge once CI passes."
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Review vote recorded successfully",
  "data": {
    "id": "p1f7a050-1010-4b55-8b39-101010101010",
    "status": "APPROVED"
  }
}
```

---

### 4. Get Version Diff View
`GET /api/v1/prs/:id/versions/2/diff?fromVersion=1`

**Headers**: `Authorization: Bearer <accessToken>`

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "PR version diff retrieved successfully",
  "data": {
    "prId": "p1f7a050-1010-4b55-8b39-101010101010",
    "fromVersion": 1,
    "toVersion": 2,
    "diffContent": "--- Version 1\n+++ Version 2\n@@ -1,1 +1,1 @@\n-const authenticate = () => { console.log('v1'); }\n+const authenticate = () => { console.log('v2 with Redis check'); }\n"
  }
}
```

---

### 5. Update PR Comment
`PATCH /api/v1/prs/comments/:commentId`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "content": "Updated comment: Please double check error handling in line 42."
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "PR Comment updated successfully",
  "data": {
    "id": "c1f7a050-5555-4b55-8b39-555555555555",
    "prId": "p1f7a050-1010-4b55-8b39-101010101010",
    "content": "Updated comment: Please double check error handling in line 42.",
    "updatedAt": "2026-07-30T23:20:00.000Z"
  }
}
```
