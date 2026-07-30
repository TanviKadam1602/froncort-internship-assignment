# Notification Service API Documentation

Production-grade In-App Notifications, BullMQ Background Processing, Audit Hooks, and User Notification Preferences documentation.

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
src/modules/notifications/
├── controllers/
│   └── notification.controller.ts     # HTTP handlers for notifications & preferences
├── services/
│   └── notification.service.ts        # Business logic & audit event hook triggers
├── repositories/
│   └── notification.repository.ts     # Prisma database queries for notifications & preferences
├── dtos/
│   └── notification.dto.ts            # Zod validation schemas
├── queues/
│   └── notification.queue.ts          # BullMQ queue producer ('notifications')
├── utils/
│   └── audit-hook.helper.ts           # NotificationAuditHook for structured audit logging
└── notifications.router.ts            # Express router mapping endpoints

src/workers/
└── notification.worker.ts             # Dedicated BullMQ background worker for notification delivery
```

---

## 📄 List of Generated Files

1. [src/modules/notifications/dtos/notification.dto.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/notifications/dtos/notification.dto.ts)
2. [src/modules/notifications/utils/audit-hook.helper.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/notifications/utils/audit-hook.helper.ts)
3. [src/modules/notifications/queues/notification.queue.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/notifications/queues/notification.queue.ts)
4. [src/workers/notification.worker.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/workers/notification.worker.ts)
5. [src/modules/notifications/repositories/notification.repository.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/notifications/repositories/notification.repository.ts)
6. [src/modules/notifications/services/notification.service.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/notifications/services/notification.service.ts)
7. [src/modules/notifications/controllers/notification.controller.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/notifications/controllers/notification.controller.ts)
8. [src/modules/notifications/notifications.router.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/notifications/notifications.router.ts)
9. [docs/notification_api_documentation.md](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/docs/notification_api_documentation.md)

---

## 📡 API Endpoint Reference & Examples

### 1. Create In-App Notification
`POST /api/v1/notifications`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "type": "TICKET_ASSIGNED",
  "title": "New Support Ticket Assigned",
  "message": "Ticket #104 'Database connection leak' has been assigned to you.",
  "linkUrl": "/tickets/t1f7a050-1010-4b55-8b39-101010101010"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Notification created successfully",
  "data": {
    "id": "n1f7a050-8888-4b55-8b39-888888888888",
    "userId": "c1f7a050-1234-4b55-8b39-111111111111",
    "orgId": "d2f7a050-2222-4b55-8b39-222222222222",
    "type": "TICKET_ASSIGNED",
    "title": "New Support Ticket Assigned",
    "message": "Ticket #104 'Database connection leak' has been assigned to you.",
    "isRead": false,
    "createdAt": "2026-07-31T00:55:00.000Z"
  }
}
```

---

### 2. List In-App User Notifications
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
      "id": "n1f7a050-8888-4b55-8b39-888888888888",
      "type": "TICKET_ASSIGNED",
      "title": "New Support Ticket Assigned",
      "message": "Ticket #104 'Database connection leak' has been assigned to you.",
      "isRead": false,
      "createdAt": "2026-07-31T00:55:00.000Z"
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

---

### 3. Mark Notification as Read
`PATCH /api/v1/notifications/:id/read`

**Headers**: `Authorization: Bearer <accessToken>`

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notification marked as read",
  "data": {
    "message": "Notification marked as read"
  }
}
```

---

### 4. Update Notification Preferences
`PATCH /api/v1/notifications/preferences`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "emailNotifications": true,
  "inAppNotifications": true,
  "digestNotifications": true,
  "prReviewNotifications": false
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notification preferences updated successfully",
  "data": {
    "id": "p1f7a050-9999-4b55-8b39-999999999999",
    "userId": "c1f7a050-1234-4b55-8b39-111111111111",
    "orgId": "d2f7a050-2222-4b55-8b39-222222222222",
    "emailNotifications": true,
    "inAppNotifications": true,
    "digestNotifications": true,
    "prReviewNotifications": false,
    "updatedAt": "2026-07-31T00:56:00.000Z"
  }
}
```

---

### 🛡️ Audit Events Emitted
* `NOTIFICATION_CREATED` — Emitted when a new notification is generated.
* `NOTIFICATION_READ` — Emitted when a user marks a notification as read.
* `NOTIFICATION_DELETED` — Emitted when a notification is deleted.
* `PREFERENCE_UPDATED` — Emitted when user notification preferences are modified.
