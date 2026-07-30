# AI Digest & Notification Service API Documentation

Production-grade AI Progress Digest Service (pluggable OpenAI / Gemini factory pattern, BullMQ background jobs, scheduled/on-demand summaries) and User Notification Service documentation.

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
src/modules/ai-digest/
├── providers/
│   ├── ai-provider.interface.ts      # IAIProvider interface & DigestMetrics type definition
│   ├── openai.provider.ts            # OpenAI provider implementation
│   ├── gemini.provider.ts            # Gemini provider implementation
│   └── ai-provider.factory.ts        # Pluggable factory reading AI_PROVIDER env
├── controllers/
│   └── ai-digest.controller.ts       # HTTP handlers for digest generation, regeneration, & jobs
├── services/
│   └── ai-digest.service.ts          # Business logic, tenant metric calculation, & notifications
├── repositories/
│   └── ai-digest.repository.ts       # Prisma database queries for AIDigest records
├── dtos/
│   └── ai-digest.dto.ts              # Zod validation schemas
└── ai-digest.router.ts               # Express router for AI endpoints

src/modules/notifications/
├── controllers/
│   └── notification.controller.ts    # HTTP handlers for in-app notifications
├── services/
│   └── notification.service.ts       # Business logic for unread counts & status updates
├── repositories/
│   └── notification.repository.ts    # Prisma database queries for notifications
├── dtos/
│   └── notification.dto.ts           # Zod validation schemas
└── notifications.router.ts           # Express router for notification endpoints
```

---

## 📡 API Endpoint Reference & Examples

### 1. Generate AI Digest
`POST /api/v1/ai/digest` or `POST /api/v1/ai/generate`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "intervalType": "DAILY"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "AI Progress Digest generated successfully",
  "data": {
    "id": "g1f7a050-1111-4b55-8b39-111111111111",
    "userId": "c1f7a050-1234-4b55-8b39-111111111111",
    "orgId": "d2f7a050-2222-4b55-8b39-222222222222",
    "summaryText": "[OpenAI gpt-4o-mini] Executive Summary: Overall Progress: 12/15 tickets closed, 5/6 PRs merged.",
    "metricsSnapshot": {
      "totalTickets": 15,
      "openTickets": 3,
      "resolvedTickets": 12,
      "totalPRs": 6,
      "approvedPRs": 5,
      "mergedPRs": 5
    },
    "intervalType": "DAILY",
    "createdAt": "2026-07-31T00:50:00.000Z"
  }
}
```

---

### 2. Regenerate AI Digest
`POST /api/v1/ai/digest/:id/regenerate`

**Headers**: `Authorization: Bearer <accessToken>`

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "AI Progress Digest regenerated successfully",
  "data": {
    "id": "g2f7a050-2222-4b55-8b39-222222222222",
    "summaryText": "[OpenAI gpt-4o-mini] Executive Summary: Updated metrics: 13/15 tickets closed.",
    "createdAt": "2026-07-31T00:51:00.000Z"
  }
}
```

---

### 3. List In-App User Notifications
`GET /api/v1/notifications?page=1&limit=20`

**Headers**: `Authorization: Bearer <accessToken>`

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notifications retrieved successfully",
  "data": [
    {
      "id": "n1f7a050-3333-4b55-8b39-333333333333",
      "type": "DIGEST_READY",
      "title": "New AI Progress Digest Ready",
      "message": "Your AI executive progress summary has been generated.",
      "isRead": false,
      "createdAt": "2026-07-31T00:50:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalRecords": 1,
    "totalPages": 1,
    "unreadCount": 1
  }
}
```
