# Unified Organization Workspace API (Backend Foundation)

Production-ready Node.js, Express, TypeScript, Prisma, and PostgreSQL backend foundation for the **Unified Organization Workspace** (Support Hub + Review & Audit Console).

---

## 🛠️ Architecture & Tech Stack

- **Runtime**: Node.js (v20+) with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (v15) via Prisma ORM
- **Cache & Sessions**: Redis (v7) via `ioredis`
- **Background Jobs**: BullMQ (Redis-backed queues)
- **Validation**: Zod schema validation
- **Logging**: Pino structured JSON logging
- **Security**: Helmet, CORS, Argon2id, JWT with Redis revocation blacklists

---

## 📁 Directory Structure

```
project/
├── prisma/
│   ├── schema.prisma          # PostgreSQL Database Schema & Relationships
│   └── seed.ts                # Database Seeder
├── src/
│   ├── config/                # Zod Environment Validation (env.config.ts)
│   ├── core/
│   │   ├── database/          # Prisma Client Singleton
│   │   ├── redis/             # Redis Client Singleton
│   │   ├── logger/            # Pino Structured Logger
│   │   └── utils/             # ApiResponse, ApiError, AsyncHandler
│   ├── middleware/            # Middleware Pipeline (Logging, Auth, Validation, Error)
│   ├── modules/               # Domain Modules (Identity, Tickets, PRs, Cross-Org, Audit, AI, Notifications)
│   ├── workers/               # BullMQ Background Worker Processes
│   ├── app.ts                 # Express Middleware Assembly
│   └── server.ts              # HTTP Server Listener & Graceful Shutdown
├── docker/                    # Dockerfiles for API & Worker
├── docker-compose.yml         # Container Orchestration
├── package.json
└── tsconfig.json
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
Ensure you have the following installed locally:
- Node.js (v20 or higher)
- npm (v10 or higher)
- Docker Desktop & Docker Compose (or local PostgreSQL and Redis instances)

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your database connection string and Redis URL are correctly configured.

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Infrastructure Containers (PostgreSQL & Redis)
```bash
docker-compose up -d postgres redis
```

### 5. Run Prisma Migrations & Generate Client
```bash
# Generate Prisma Client
npm run prisma:generate

# Run DB Migrations
npm run prisma:migrate
```

### 6. Run API Server & Worker
```bash
# Start API in Development Mode (Port 4000)
npm run dev

# Start Background Worker in a separate terminal
npm run dev:worker
```

---

## 🐳 Docker Deployment

Run the complete multi-container stack (PostgreSQL, Redis, API, Worker):

```bash
# Build and start all services in detached mode
docker-compose up --build -d

# View API Logs
docker-compose logs -f api

# View Worker Logs
docker-compose logs -f worker

# Stop containers
docker-compose down
```

---

## 🧪 Health Check

Test that the API is running correctly:

```bash
curl http://localhost:4000/health
```

Expected Response:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "System healthy",
  "data": {
    "status": "UP",
    "uptime": 4.12,
    "timestamp": "2026-07-30T21:50:00.000Z"
  }
}
```

---

## 🛡️ License

ISC License - Unified Organization Workspace.
