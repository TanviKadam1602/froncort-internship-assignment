# Shared Identity & Authentication API Documentation

Production-grade Authentication, Session Synchronization, Refresh Token Rotation, Organization Switching, and Logout-All documentation for the **Unified Organization Workspace**.

---

## 🚀 Commands Required to Run

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

## 📁 Generated Files Map

- **Security & Token Management**:
  - [src/core/security/password.service.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/core/security/password.service.ts) — Argon2id password hashing & SHA-256 refresh token hashing.
  - [src/core/security/jwt.service.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/core/security/jwt.service.ts) — JWT Access/Refresh token signing, verification, and Redis `jti` blacklist revocation.
  - [src/core/redis/session.cache.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/core/redis/session.cache.ts) — Redis session metadata cache with graceful fallback.

- **Identity Domain Layer**:
  - [src/modules/identity/dtos/identity.dto.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/identity/dtos/identity.dto.ts) — Zod validation schemas for Register, Login, Refresh, and Switch Org.
  - [src/modules/identity/repositories/identity.repository.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/identity/repositories/identity.repository.ts) — Prisma database queries for User, Organization, OrgMember, and UserSession.
  - [src/modules/identity/services/identity.service.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/identity/services/identity.service.ts) — Auth business logic, token rotation, org switching, and logout-all.
  - [src/modules/identity/controllers/identity.controller.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/identity/controllers/identity.controller.ts) — HTTP request handlers & HttpOnly cookie management.
  - [src/modules/identity/identity.router.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/identity/identity.router.ts) — Express route definitions.

- **Middleware Layers**:
  - [src/middleware/authenticate.middleware.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/middleware/authenticate.middleware.ts) — Bearer token validation, Redis blacklist check, and request context attachment (`req.user`).
  - [src/middleware/tenant-context.middleware.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/middleware/tenant-context.middleware.ts) — Active organization context guard.
  - [src/middleware/rbac.middleware.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/middleware/rbac.middleware.ts) — Role permission check guard (`requireRoles`).

---

## 📡 API Endpoint Reference & Examples

### 1. Register User & Organization
`POST /api/v1/auth/register`

**Request Body**:
```json
{
  "email": "admin@acme.com",
  "password": "Password123",
  "fullName": "Alice Admin",
  "orgName": "Acme Corporation",
  "orgSlug": "acme-corp"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registration and organization setup successful",
  "data": {
    "user": {
      "id": "c1f7a050-1234-4b55-8b39-111111111111",
      "email": "admin@acme.com",
      "fullName": "Alice Admin",
      "isPlatformSuperAdmin": false
    },
    "activeOrg": {
      "id": "d2f7a050-2222-4b55-8b39-222222222222",
      "name": "Acme Corporation",
      "slug": "acme-corp",
      "role": "ORG_ADMIN"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "15m"
  }
}
```

---

### 2. User Login
`POST /api/v1/auth/login`

**Request Body**:
```json
{
  "email": "admin@acme.com",
  "password": "Password123"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "c1f7a050-1234-4b55-8b39-111111111111",
      "email": "admin@acme.com",
      "fullName": "Alice Admin",
      "isPlatformSuperAdmin": false
    },
    "activeOrg": {
      "id": "d2f7a050-2222-4b55-8b39-222222222222",
      "name": "Acme Corporation",
      "slug": "acme-corp",
      "role": "ORG_ADMIN"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "15m"
  }
}
```

---

### 3. Refresh Access Token (Rotation)
`POST /api/v1/auth/refresh`

**Headers**: Sent automatically via `HttpOnly` Cookie (`refreshToken`) or Request Body.

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "15m"
  }
}
```

---

### 4. Switch Active Organization
`POST /api/v1/auth/switch-org`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "targetOrgId": "e3f7a050-3333-4b55-8b39-333333333333"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Switched organization context successfully",
  "data": {
    "activeOrg": {
      "id": "e3f7a050-3333-4b55-8b39-333333333333",
      "name": "Stark Industries",
      "slug": "stark-ind",
      "role": "REVIEWER_APPROVER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 5. Logout Current Session
`POST /api/v1/auth/logout`

**Headers**: `Authorization: Bearer <accessToken>`

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully",
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

### 6. Logout All Sessions ("Logout-Everywhere")
`POST /api/v1/auth/logout-all`

**Headers**: `Authorization: Bearer <accessToken>`

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out from all sessions successfully",
  "data": {
    "message": "Logged out from all devices successfully"
  }
}
```

---

### 7. Get Current User Profile & Memberships
`GET /api/v1/auth/me`

**Headers**: `Authorization: Bearer <accessToken>`

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Current user profile fetched successfully",
  "data": {
    "user": {
      "id": "c1f7a050-1234-4b55-8b39-111111111111",
      "email": "admin@acme.com",
      "fullName": "Alice Admin",
      "isPlatformSuperAdmin": false
    },
    "activeOrg": {
      "id": "d2f7a050-2222-4b55-8b39-222222222222",
      "name": "Acme Corporation",
      "slug": "acme-corp",
      "role": "ORG_ADMIN"
    },
    "memberships": [
      {
        "orgId": "d2f7a050-2222-4b55-8b39-222222222222",
        "name": "Acme Corporation",
        "slug": "acme-corp",
        "role": "ORG_ADMIN"
      },
      {
        "orgId": "e3f7a050-3333-4b55-8b39-333333333333",
        "name": "Stark Industries",
        "slug": "stark-ind",
        "role": "REVIEWER_APPROVER"
      }
    ]
  }
}
```

---

### 8. Get Active Sessions
`GET /api/v1/auth/sessions`

**Headers**: `Authorization: Bearer <accessToken>`

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Active user sessions fetched successfully",
  "data": [
    {
      "id": "s1f7a050-7777-4b55-8b39-777777777777",
      "activeOrgId": "d2f7a050-2222-4b55-8b39-222222222222",
      "userAgent": "Mozilla/5.0...",
      "ipAddress": "127.0.0.1",
      "createdAt": "2026-07-30T22:00:00.000Z",
      "expiresAt": "2026-08-06T22:00:00.000Z",
      "activeOrg": {
        "id": "d2f7a050-2222-4b55-8b39-222222222222",
        "name": "Acme Corporation",
        "slug": "acme-corp"
      }
    }
  ]
}
```
