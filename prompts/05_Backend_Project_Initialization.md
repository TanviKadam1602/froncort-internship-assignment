Act as a Principal Backend Engineer and Senior TypeScript Architect.

The architecture, database design, and backend foundation have already been finalized.

Your task is to IMPLEMENT the backend infrastructure exactly according to those designs.

DO NOT implement authentication logic.

DO NOT implement RBAC logic.

DO NOT implement Ticket APIs.

DO NOT implement PR APIs.

DO NOT implement business logic.

This phase is ONLY for creating the production-ready backend foundation.

Use:

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- Redis
- BullMQ
- Zod
- Pino
- Helmet
- CORS
- Compression
- dotenv

Generate production-quality code.

---------------------------------------------------

PART 1

Create the complete backend project structure exactly as designed.

Generate every required directory and placeholder file.

---------------------------------------------------

PART 2

Generate:

package.json

Include production dependencies and development dependencies.

Include scripts for:

- dev
- build
- start
- prisma generate
- prisma migrate
- prisma studio
- lint
- format
- test

---------------------------------------------------

PART 3

Generate:

tsconfig.json

Use strict TypeScript settings.

---------------------------------------------------

PART 4

Generate:

.env.example

Use:

NODE_ENV=

PORT=

DATABASE_URL=

REDIS_URL=

JWT_ACCESS_SECRET=

JWT_REFRESH_SECRET=

JWT_ACCESS_EXPIRATION=

JWT_REFRESH_EXPIRATION=

AI_PROVIDER=

OPENAI_API_KEY=

GEMINI_API_KEY=

CORS_ORIGIN=

Do NOT use real credentials.

---------------------------------------------------

PART 5

Generate:

src/config/

Implement:

env.config.ts

using Zod validation.

Create strongly typed configuration.

Fail immediately if required variables are missing.

---------------------------------------------------

PART 6

Generate:

src/core/database/prisma.client.ts

Implement Prisma Singleton.

---------------------------------------------------

PART 7

Generate:

src/core/redis/redis.client.ts

Implement Redis Singleton.

---------------------------------------------------

PART 8

Generate:

src/core/logger/logger.ts

Implement production Pino logger.

Support:

- pretty logs in development

- JSON logs in production

- request ids

- child loggers

---------------------------------------------------

PART 9

Generate:

src/app.ts

Configure middleware in the correct order:

Helmet

CORS

Compression

JSON Parser

Request Logger

API Router placeholder

404 Handler

Global Error Handler

---------------------------------------------------

PART 10

Generate:

src/server.ts

Include:

Graceful shutdown

Prisma disconnect

Redis disconnect

SIGTERM

SIGINT

Unhandled Rejection

Uncaught Exception

---------------------------------------------------

PART 11

Generate middleware skeletons only.

Implement:

request logger

error handler

validation middleware

authentication placeholder

tenant placeholder

RBAC placeholder

Do NOT implement business logic.

---------------------------------------------------

PART 12

Generate utility classes:

ApiResponse

ApiError

AsyncHandler

---------------------------------------------------

PART 13

Generate Docker files.

Dockerfile.api

Dockerfile.worker

docker-compose.yml

Include:

PostgreSQL

Redis

API

Worker

---------------------------------------------------

PART 14

Generate Prisma initialization commands.

Do NOT generate schema.

---------------------------------------------------

PART 15

Generate README instructions explaining:

Installation

Environment setup

Running locally

Running Docker

Running Prisma

Running Redis

Running Worker

---------------------------------------------------

IMPORTANT

Generate REAL production-ready code.

Do NOT omit files.

Do NOT simplify architecture.

Do NOT implement authentication.

Do NOT implement RBAC.

Do NOT implement business logic.

The result should compile successfully and provide a clean backend foundation that is ready for Phase 2 implementation.