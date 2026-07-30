# Enterprise Multi-Tenant Unified Workspace Platform

Production-ready B2B Enterprise SaaS Platform supporting multi-tenant isolation, cross-organization collaboration, N-approval code review voting engine, cryptographic SHA-256 hash-chained audit system, pluggable AI progress digest service, and Next.js 15 App Router frontend.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: Next.js 15 App Router, React 18, TypeScript, Tailwind CSS, Lucide React, Axios.
- **Backend API**: Node.js, Express, TypeScript, Repository-Service-Controller Pattern.
- **Database & ORM**: PostgreSQL, Prisma ORM.
- **Cache & Async Queues**: Redis, BullMQ background workers (`ai-digest.worker.ts`, `notification.worker.ts`).
- **Security & RBAC**: Argon2id password hashing, Dual JWT (Access Token + HttpOnly Refresh Cookie), Redis `jti` revocation list, Multi-tenant org context middleware.

---

## 🚀 Quickstart & Verification Guide

### 1. Backend Setup
```bash
cd project
npm install
npx prisma generate
npm run build
```

### 2. Frontend Setup
```bash
cd project/frontend
npm install
npm run build
```

### 3. Docker Compose Production Deployment
```bash
docker-compose up -d --build
```

---

## 🛰️ Verification Commands Summary

```bash
# Verify Backend Build
cd project && npm run build

# Verify Frontend Build
cd project/frontend && npm run build
```
