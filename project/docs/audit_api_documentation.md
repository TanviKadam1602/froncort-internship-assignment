# Audit System API Documentation

Production-grade Immutable Audit System, SHA-256 Cryptographic Hash Chain Verification, Timeline View, and CSV Export documentation.

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
src/modules/audit/
├── controllers/
│   └── audit.controller.ts            # HTTP handlers for search, timeline, CSV export, & verification
├── services/
│   └── audit.service.ts               # Business logic, timeline grouping, & hash chain integrity check
├── repositories/
│   └── audit.repository.ts            # Prisma queries for immutable logs & hash chain calculation
├── dtos/
│   └── audit.dto.ts                   # Zod validation schemas for query filtering & exports
├── types/
│   └── audit.types.ts                 # TypeScript interfaces for audit filtering & verification results
└── utils/
    ├── hash-chain.builder.ts          # Cryptographic SHA-256 chain calculation (Previous + Current Hash)
    └── csv-exporter.ts                # Downloadable CSV spreadsheet generator
```

---

## 📄 List of Generated Files

1. [src/modules/audit/types/audit.types.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/audit/types/audit.types.ts)
2. [src/modules/audit/dtos/audit.dto.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/audit/dtos/audit.dto.ts)
3. [src/modules/audit/utils/hash-chain.builder.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/audit/utils/hash-chain.builder.ts)
4. [src/modules/audit/utils/csv-exporter.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/audit/utils/csv-exporter.ts)
5. [src/modules/audit/repositories/audit.repository.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/audit/repositories/audit.repository.ts)
6. [src/modules/audit/services/audit.service.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/audit/services/audit.service.ts)
7. [src/modules/audit/controllers/audit.controller.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/audit/controllers/audit.controller.ts)
8. [src/modules/audit/audit.router.ts](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/src/modules/audit/audit.router.ts)
9. [docs/audit_api_documentation.md](file:///C:/Users/Tanvi/OneDrive/Desktop/Froncort-Internship-Assignment/project/docs/audit_api_documentation.md)

---

## 📡 API Endpoint Reference & Examples

### 1. List / Search Audit Logs
`GET /api/v1/audit?page=1&limit=10&search=MERGE_PR&sortBy=newest`

**Headers**: `Authorization: Bearer <accessToken>`

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Audit log entries retrieved successfully",
  "data": [
    {
      "id": "a1f7a050-9999-4b55-8b39-999999999999",
      "timestamp": "2026-07-30T23:40:00.000Z",
      "actorId": "c1f7a050-1234-4b55-8b39-111111111111",
      "actorEmail": "admin@acme.com",
      "orgId": "d2f7a050-2222-4b55-8b39-222222222222",
      "actionType": "MERGE_PR",
      "module": "PRS",
      "resourceType": "PULL_REQUEST",
      "resourceId": "p1f7a050-1010-4b55-8b39-101010101010",
      "previousHash": "a3f5...",
      "currentHash": "e9b2..."
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

### 2. Verify Cryptographic Hash Chain Integrity
`GET /api/v1/audit/verify`

**Headers**: `Authorization: Bearer <accessToken>`

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Cryptographic hash chain integrity check completed",
  "data": {
    "isChainValid": true,
    "totalRecords": 45,
    "message": "Cryptographic hash chain verified successfully across 45 records. Zero tampering detected."
  }
}
```

---

### 3. Get Visual Audit Timeline
`GET /api/v1/audit/timeline`

**Headers**: `Authorization: Bearer <accessToken>`

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Audit timeline retrieved successfully",
  "data": [
    {
      "date": "2026-07-30",
      "events": [
        {
          "id": "a1f7a050-9999-4b55-8b39-999999999999",
          "actionType": "MERGE_PR",
          "actorEmail": "admin@acme.com",
          "timestamp": "2026-07-30T23:40:00.000Z"
        }
      ]
    }
  ]
}
```

---

### 4. Export Audit Logs as CSV
`GET /api/v1/audit/export`

**Headers**: `Authorization: Bearer <accessToken>`

**Response (200 OK)**:
```csv
"Timestamp","Actor Email","Actor ID","Module","Action","Resource Type","Resource ID","Organization ID"
"2026-07-30T23:40:00.000Z","admin@acme.com","c1f7a050-1234-4b55-8b39-111111111111","PRS","MERGE_PR","PULL_REQUEST","p1f7a050-1010-4b55-8b39-101010101010","d2f7a050-2222-4b55-8b39-222222222222"
```
