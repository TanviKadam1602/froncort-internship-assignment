# Production Backend Foundation Architecture & Technical Design
## Unified Organization Workspace (Ticketing + PR/Audit Console)

---

## 1. Complete Backend Folder Structure

```
apps/api/
├── prisma/
│   ├── schema.prisma                 # Finalized PostgreSQL Prisma Schema
│   ├── migrations/                   # Sequential DB migration SQL scripts
│   └── seed.ts                       # Database seeder (2 Orgs, sample Tickets & PRs)
│
├── src/
│   ├── config/                       # Type-safe Configuration & Environment Validation
│   │   ├── env.config.ts             # Zod environment variable schema & validator
│   │   ├── redis.config.ts           # Redis client connection options
│   │   ├── cors.config.ts            # CORS whitelist & headers configuration
│   │   └── security.config.ts        # Rate limiter & security token parameters
│   │
│   ├── core/                         # Core Infrastructure Utilities & Clients
│   │   ├── database/                 # Prisma DB Client Singleton & Extensions
│   │   │   └── prisma.client.ts
│   │   ├── redis/                    # Redis Connection Singleton & Cache Helper
│   │   │   └── redis.client.ts
│   │   ├── logger/                   # Pino Logger Singleton & Request Serializers
│   │   │   └── logger.ts
│   │   ├── queue/                    # BullMQ Queue Factory & Scheduler Connection
│   │   │   └── bullmq.queue.ts
│   │   └── errors/                   # Custom Domain Error Hierarchy
│   │       ├── base.error.ts
│   │       ├── unauthorized.error.ts
│   │       ├── forbidden.error.ts
│   │       ├── not-found.error.ts
│   │       ├── validation.error.ts
│   │       └── bola.error.ts
│   │
│   ├── middleware/                   # Express HTTP Middleware Pipeline
│   │   ├── rate-limiter.middleware.ts# Redis-backed sliding window rate limiter
│   │   ├── request-logger.middleware.ts# Pino HTTP logger middleware
│   │   ├── authenticate.middleware.ts# JWT validation & Redis blacklist check
│   │   ├── tenant-context.middleware.ts# Active Org context & BOLA query guard
│   │   ├── rbac.middleware.ts        # Role-based access control guard
│   │   ├── validate.middleware.ts    # Zod schema request body/query validator
│   │   └── global-error.middleware.ts# Centralized Express error handler
│   │
│   ├── modules/                      # Domain Modules (Modular Monolith Boundaries)
│   │   ├── identity/                 # Auth, JWT, Org Switcher & Sessions
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── dtos/                 # Zod Request Validation Schemas
│   │   │   └── identity.router.ts
│   │   │
│   │   ├── tickets/                  # Support Hub Tickets, Comments & Attachments
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── dtos/
│   │   │   └── tickets.router.ts
│   │   │
│   │   ├── prs/                      # PR Workflow, Approvals & Version Diffs
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── dtos/
│   │   │   └── prs.router.ts
│   │   │
│   │   ├── cross-org/                # Org Connections & Shared Resource Engine
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── dtos/
│   │   │   └── cross-org.router.ts
│   │   │
│   │   ├── audit/                    # Audit Interceptor & CSV Streamer
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   └── audit.router.ts
│   │   │
│   │   ├── ai-digest/                # AI Provider Factory & Scoped Summary Aggregator
│   │   │   ├── providers/            # Pluggable AI Service Implementations
│   │   │   │   ├── ai-provider.interface.ts
│   │   │   │   ├── openai.provider.ts
│   │   │   │   ├── gemini.provider.ts
│   │   │   │   └── ai-provider.factory.ts # Dynamically loads provider based on AI_PROVIDER
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   └── ai.router.ts
│   │   │
│   │   └── notifications/            # In-App Notification Feed & SSE Streamer
│   │       ├── controllers/
│   │       ├── services/
│   │       ├── repositories/
│   │       └── notifications.router.ts
│   │
│   ├── workers/                      # Background Worker Process Entrypoints
│   │   ├── ai-digest.worker.ts       # Scheduled BullMQ AI Digest Processor
│   │   └── worker-runner.ts          # Dedicated Worker Process Entrypoint
│   │
│   ├── app.ts                        # Express App Initialization & Middleware Pipeline
│   └── server.ts                     # HTTP Server Listener & Graceful Shutdown
│
├── docker/                           # Dockerfiles & Compose Config
│   ├── Dockerfile.api
│   ├── Dockerfile.worker
│   └── docker-compose.yml
│
├── tsconfig.json                     # TypeScript Strict Compiler Options
├── package.json                      # API Dependencies & Scripts
└── .env.example                      # Environment Template
```

---

## 2. Directory Purpose Breakdown

| Directory | Architectural Purpose |
| :--- | :--- |
| `src/config/` | Centralizes environment loading, secret parsing, and Zod configuration schema validation. Guarantees the application crashes immediately at startup if an environment variable is missing or malformed. |
| `src/core/` | Houses infrastructure singletons (Prisma client, Redis client, Pino logger, BullMQ queues) and the custom domain error class hierarchy. Completely decoupled from Express routes. |
| `src/middleware/` | Contains the HTTP request processing pipeline (security headers, rate limiting, request logging, JWT auth, tenant isolation, validation, global error handling). |
| `src/modules/` | Encapsulates domain logic into modular boundaries (Identity, Tickets, PRs, Cross-Org, Audit, AI Digest, Notifications). Each module contains its own controllers, services, repositories, DTOs, and router. |
| `src/modules/ai-digest/providers/` | Pluggable AI provider implementations (`OpenAIProvider`, `GeminiProvider`) decoupled via `AIProviderFactory` reading `AI_PROVIDER`. |
| `src/workers/` | Entrypoint for background job consumers executed in an isolated process without taking up main HTTP event loop resources. |

---

## 3. Express Application Architecture & Layering

```
[ HTTP Request ]
       |
       v
  [ Router ] --------> Validates Request Body / Params via Zod DTO
       |
       v
[ Controller ] ------> Parses HTTP context (Req/Res), extracts validated DTO & User Context
       |
       v
  [ Service ] -------> Encapsulates pure business logic, authorization rules & transactions
       |
       v
[ Repository ] -----> Interacts exclusively with Prisma ORM / PostgreSQL DB
```

1. **`server.ts`**: Handles network port binding, HTTP server listener setup, signal handling (`SIGTERM`, `SIGINT`), and graceful shutdown of DB connections, Redis pools, and BullMQ queues.
2. **`app.ts`**: Instantiates Express, configures root middleware (Helmet, CORS, Body Parsers, Logging), mounts versioned API routers (`/api/v1/...`), and attaches the global error handler.
3. **Routers**: Map HTTP endpoints (`GET`, `POST`, `PUT`, `DELETE`) to middleware pipelines and controller actions.
4. **Controllers**: Handle HTTP-specific request parsing, invoke service layer methods, and format HTTP responses (`200 OK`, `201 Created`). Contain zero SQL or ORM queries.
5. **Services**: Implement domain business rules, coordinate multi-repository operations, trigger event notifications, and execute database transactions.
6. **Repositories**: Abstract Prisma ORM database operations behind domain methods (e.g., `TicketRepository.findAccessibleTicketsForOrg(orgId, sharedIds)`).
7. **Middleware**: Modular request interceptors for cross-cutting concerns (Auth, RBAC, Validation, Tenant Guards).
8. **Workers**: Independent Node.js processes running BullMQ consumer loops for async jobs (AI digests, notification sweeps).

---

## 4. Dependency Injection & Pluggable AI Provider Architecture

To achieve clean separation of concerns and maintain unit-testability, the backend uses **Constructor-Based Dependency Injection** and the **Factory/Adapter Pattern** for AI providers:

* **Repository Injection**: Services accept Repository interfaces as constructor arguments.
  ```typescript
  // Service Layer Example Architecture Pattern
  export class TicketService {
    constructor(
      private readonly ticketRepo: ITicketRepository,
      private readonly auditRepo: IAuditRepository,
      private readonly notificationRepo: INotificationRepository
    ) {}

    async createTicket(dto: CreateTicketDTO, actorContext: ActorContext): Promise<Ticket> {
      // Business logic & multi-repository coordination
    }
  }
  ```
* **Pluggable AI Provider Strategy**: The AI Digest Service does not hardcode an LLM SDK. Instead, it consumes an `IAIProvider` interface instantiated by `AIProviderFactory`:
  ```typescript
  export interface IAIProvider {
    generateDigestSummary(promptContext: DigestPromptContext): Promise<string>;
  }

  export class AIProviderFactory {
    static getProvider(config: EnvConfig): IAIProvider {
      switch (config.AI_PROVIDER) {
        case 'openai':
          return new OpenAIProvider(config.OPENAI_API_KEY);
        case 'gemini':
          return new GeminiProvider(config.GEMINI_API_KEY);
        default:
          throw new Error(`Unsupported AI_PROVIDER: ${config.AI_PROVIDER}`);
      }
    }
  }
  ```

---

## 5. Configuration & Environment Layer

Environment variable parsing is enforced via **Zod Schema Validation** inside `src/config/env.config.ts`:

* **Startup Guard**: When `server.ts` boots, `envSchema.parse(process.env)` executes. If any mandatory variable (`DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `REDIS_URL`) is missing or invalid, the process aborts immediately with a clear diagnostic log.
* **Secrets Management**: Sensitive secrets (JWT signing keys, DB passwords, API keys) are loaded exclusively from system environment variables or secure secret managers (e.g. AWS Secrets Manager / Docker Secrets), never hardcoded in source control.

---

## 6. Pino Logging Architecture

The backend uses **Pino** for structured JSON logging:

* **High Performance**: Asynchronous JSON serialization with zero main-thread blocking overhead.
* **Request Correlation ID**: Every HTTP request is assigned a `x-request-id` header (or auto-generated UUID). Pino serializes this `requestId` across all child loggers in controllers, services, and repositories.
* **Request/Response Serialization**: Automatically sanitizes sensitive parameters (`password`, `authorization`, `refreshToken`) before writing logs.
* **Error Serializer**: Captures full error stack traces, error codes, and request contexts.

---

## 7. Global Error Handling Strategy

Centralized error handling is managed by `src/middleware/global-error.middleware.ts`. All custom errors inherit from a base `AppError` class:

```
                          +------------------------+
                          |   AppError (Base)      |
                          | (statusCode, isOperational) |
                          +-----------+------------+
                                      |
       +------------------+-----------+-----------+------------------+
       |                  |                       |                  |
+------v-------+   +------v-------+        +------v-------+   +------v-------+
| Unauthorized |   |  Forbidden   |        |   NotFound   |   | BOLA / Tenant|
|  Error (401) |   |  Error (403) |        |  Error (404) |   |  Error (403) |
+--------------+   +--------------+        +--------------+   +--------------+
```

### Error Handler Dispatch Logic:
1. **`AppError` (Domain Errors)**: Formatted directly to clean JSON responses: `{ success: false, error: { code: "UNAUTHORIZED", message: "Invalid credentials" } }`.
2. **`ZodError` (Validation Errors)**: Formatted to HTTP `400 Bad Request` with structured field-level error messages: `{ success: false, error: { code: "VALIDATION_ERROR", details: [...] } }`.
3. **`PrismaClientKnownRequestError` (Database Errors)**: Mapped to safe HTTP responses (e.g., Unique constraint violation `P2002` $\rightarrow$ `409 Conflict`). Internal database error details are hidden from clients.
4. **Unknown Exceptions**: Logged with `FATAL` log level to Pino; returns generic `500 Internal Server Error` without leaking stack traces.

---

## 8. Request Validation Strategy (Zod)

Validation is performed at the router boundary using a generic Express middleware `validateRequest(schema)`:

```typescript
// Architectural Validation Wrapper Pattern
export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = parsed.body;
      req.query = parsed.query;
      req.params = parsed.params;
      return next();
    } catch (error) {
      return next(error); // Caught by Global Error Middleware
    }
  };
};
```

---

## 9. Prisma Integration & Connection Lifecycle

* **Singleton Client**: A single `PrismaClient` instance is exported from `src/core/database/prisma.client.ts` with connection pooling enabled.
* **Transaction Strategy**: Multi-entity mutations (e.g., ticket creation + audit log insertion) use interactive transactions: `prisma.$transaction(async (tx) => { ... })`.
* **Soft Delete Extension**: Prisma Client extensions automatically append `where: { deletedAt: null }` on all standard entity read queries.

---

## 10. Redis Architecture & Caching Layer

Redis serves 4 distinct infrastructure capabilities:
1. **JWT Revocation Blacklist**: Stores invalidated JWT `jti` identifiers (`jwt:blacklist:<jti>`) with TTL matching token expiry.
2. **Refresh Token Sessions**: Stores active session metadata (`ref:session:<sessionId>`).
3. **BullMQ Background Queues**: Holds pending and active delayed jobs (`bull:ai-digest-queue`, `bull:notification-queue`).
4. **Sliding Window Rate Limiter**: Stores IP and User request counters (`ratelimit:<ip>`).

---

## 11. Background Worker Architecture

```
                                +---------------------------+
                                |    API SERVER PROCESS     |
                                | (Express / HTTP Listeners)|
                                +-------------+-------------+
                                              |
                                     Enqueues Job Event
                                              |
                                              v
                                +---------------------------+
                                |        REDIS QUEUE        |
                                |     (BullMQ Job Store)    |
                                +-------------+-------------+
                                              |
                                     Consumes Job Event
                                              |
                                              v
                                +---------------------------+
                                | BACKGROUND WORKER PROCESS |
                                |   (Isolated Node.js Process)
                                +---------------------------+
```

* **Process Isolation**: The background worker runs as an independent container/process (`npm run start:worker`).
* **Zero HTTP Impact**: Heavy tasks (AI progress aggregations, prompt construction, LLM API network waits) execute entirely on the worker process without slowing down client API HTTP request response times.

---

## 12. API Versioning & Routing Architecture

Endpoints are prefixed with explicit version namespaces:

* **Root Path**: `/api/v1/`
* **Domain Sub-Routes**:
  * `/api/v1/auth` - Authentication & Org Switching
  * `/api/v1/tickets` - Support Hub Tickets & Comments
  * `/api/v1/prs` - Review Console Pull Requests & Versions
  * `/api/v1/cross-org` - Connections & Shared Resources
  * `/api/v1/audit-logs` - Unified Audit Viewer & CSV Export
  * `/api/v1/notifications` - In-App Notification Bell Feed
  * `/api/v1/ai` - AI Progress Digest API

---

## 13. Express Middleware Pipeline Execution Order

```
 1. [ Request Received ]
 2. [ Helmet Middleware ]           <-- Sets Security HTTP Headers (CSP, HSTS, X-Frame)
 3. [ CORS Middleware ]             <-- Enforces Whitelisted Frontend Domains
 4. [ Compression Middleware ]      <-- Gzip / Brotli Payload Compression
 5. [ Rate Limiter Middleware ]     <-- Redis-backed Sliding Window Protection
 6. [ Body Parser Middleware ]       <-- Express JSON (Max 10MB for Attachments)
 7. [ Pino Request Logger ]         <-- Generates x-request-id & Logs Request Start
 8. [ Authenticate Guard ]          <-- Verifies Bearer JWT & Redis Blacklist
 9. [ Tenant Context Guard ]        <-- Verifies Active Org Context & BOLA Scoping
10. [ RBAC Authorization Guard ]    <-- Checks Role Hierarchy (Org Admin, Agent, etc)
11. [ Zod Schema Validator ]        <-- Validates Body, Query, & Path Params
12. [ Domain Controller Handler ]   <-- Executes Business Logic
13. [ Global Error Handler ]        <-- Intercepts Errors & Formats Standard JSON Error
```

---

## 14. Security Foundation & Hardening

1. **JWT Handling**: Access Tokens signed using asymmetric keys (`RS256`) or strong secrets (`HS256`). Tokens include `jti` for individual revocation. Secret verified using `JWT_ACCESS_SECRET`.
2. **Password Hashing**: Argon2id with memory cost 65536, time cost 3, parallelism 4, and unique salt per user.
3. **CORS Configuration**: Restricts API calls strictly to approved frontend origin URLs (`https://app.workspace.com`).
4. **HTTP Security Headers**: Enforced via Helmet.js (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`).
5. **Request Payload Limits**: Express JSON parser body size capped at `10mb` to prevent payload overflow attacks.

---

## 15. Required Environment Variables Template (`.env.example`)

```env
# Node Environment
NODE_ENV=development
PORT=4000
API_PREFIX=/api/v1

# Database (PostgreSQL via Prisma)
DATABASE_URL=postgresql://user:password@localhost:5432/unified_workspace?schema=public

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Authentication & Security Tokens
JWT_ACCESS_SECRET=super_secret_jwt_access_signing_key_min_32_chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_SECRET=super_secret_jwt_refresh_signing_key_min_32_chars
JWT_REFRESH_EXPIRATION=7d

# CORS Allowed Origins
CORS_ORIGIN=http://localhost:3000

# Pluggable AI Provider Configuration (openai | gemini)
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 16. Docker Architecture & Container Setup

```yaml
# docker-compose.yml Architecture
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: unified_workspace
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build:
      context: .
      dockerfile: docker/Dockerfile.api
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:postgrespassword@postgres:5432/unified_workspace
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  worker:
    build:
      context: .
      dockerfile: docker/Dockerfile.worker
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:postgrespassword@postgres:5432/unified_workspace
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

volumes:
  pgdata:
```

---

## 17. Development Workflow

1. **Local Setup**:
   * Run `docker-compose up -d postgres redis` to spin up local infrastructure.
   * Execute `npx prisma migrate dev` to apply database migrations.
   * Execute `npm run seed` to populate 2 sample organizations, test users, tickets, and PRs.
2. **Local Run**:
   * API Server: `npm run dev:api` (nodemon + ts-node).
   * Background Worker: `npm run dev:worker`.
3. **Automated Testing**:
   * Unit & Integration Tests: `npm run test` (Jest / Vitest verifying BOLA isolation and session sync).
4. **Production Build**:
   * `npm run build` compiles TypeScript to optimized JavaScript in `dist/`.

---

## 18. Readiness Confirmation

The backend architecture foundation is fully updated, configured, and verified. 

We are ready to proceed with **Workspace Setup & Implementation**.
