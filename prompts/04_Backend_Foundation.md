Act as a Principal Backend Architect and Senior Node.js Engineer.

The system architecture and database design have been finalized.

Your task is to design the backend foundation for the Unified Organization Workspace.

Do NOT implement business logic.

Do NOT implement authentication.

Do NOT implement ticket APIs.

Do NOT implement PR APIs.

Generate ONLY the backend foundation.

The backend must use:

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis
- BullMQ
- JWT
- Zod
- Pino Logger

Generate:

## 1. Recommended folder structure

Show the complete backend directory tree.

## 2. Explain every folder

Explain the purpose of every directory.

## 3. Express application architecture

Explain:

- app.ts
- server.ts
- routers
- controllers
- services
- repositories
- middleware
- config
- utils
- workers

## 4. Dependency Injection strategy

Explain how services depend on repositories.

## 5. Configuration layer

Explain:

- environment loading
- config validation
- secrets management

## 6. Logging architecture

Use Pino.

Explain request logging and error logging.

## 7. Global Error Handling

Explain:

- custom errors
- validation errors
- database errors
- unknown exceptions

## 8. Validation Strategy

Use Zod.

Explain request validation.

## 9. Prisma Integration

Explain:

- Prisma Client
- migrations
- singleton client
- transaction strategy

Do not generate schema again.

## 10. Redis Architecture

Explain:

- caching
- session storage
- BullMQ queues

## 11. Background Worker Architecture

Explain how workers are separated from the API server.

## 12. API Versioning

Design:

/api/v1/

Explain versioning strategy.

## 13. Middleware Stack

Explain middleware order:

- Helmet
- CORS
- Compression
- Rate limiting
- Authentication
- Authorization
- Validation
- Logging
- Error handler

## 14. Security Foundation

Explain:

- JWT handling
- password hashing
- CORS
- HTTP headers
- request size limits

## 15. Environment Variables

List every required environment variable.

Do not provide actual credentials.

## 16. Docker Architecture

Explain:

- backend container
- postgres
- redis
- worker container

## 17. Development Workflow

Explain:

- local development
- migrations
- seeding
- testing
- production deployment

Finally review the architecture and confirm it is ready for implementing authentication.

Do NOT generate routes.

Do NOT generate controllers.

Do NOT generate business logic.

Only generate the backend foundation.