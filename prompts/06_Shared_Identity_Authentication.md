You are a Principal Backend Engineer and Security Architect.

The backend foundation has already been implemented successfully.

Project stack:

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL (Neon)
- Redis (code integration only; Redis may not be running during generation)
- JWT
- Argon2
- Zod

The project already contains:

- Express app
- Prisma client
- Redis client
- Logger
- Middleware
- Docker configuration
- Worker infrastructure
- Base routers
- Environment configuration

Your task is to implement ONLY the Shared Identity & Authentication module.

Do NOT modify unrelated modules unless required for integration.

==================================================
OBJECTIVES
==================================================

Implement a complete production-ready authentication system.

Support:

- User Registration
- Login
- Refresh Tokens
- Logout
- Logout Everywhere
- Session Management
- Organization Switching
- Authentication Middleware
- Authorization Context
- Secure Password Hashing
- JWT Authentication

Do NOT implement:

- Ticket business logic
- Pull Request logic
- AI features
- Notification logic
- Audit business logic
- Cross-organization collaboration
- Invitation acceptance

==================================================
PART 1
PROJECT STRUCTURE
==================================================

Inside Identity Module create:

controllers

services

repositories

dtos

validators

types

utils

==================================================
PART 2
REGISTRATION
==================================================

Implement:

POST /auth/register

Requirements:

Validate request using Zod.

Hash password using Argon2id.

Create User.

If organizationName is provided:

- Create Organization
- Create Organization Membership
- Assign ORG_ADMIN role
- Set as active organization

Otherwise:

Create only the user.

Create initial login session.

Generate Access Token.

Generate Refresh Token.

Return:

User

Organizations

Current Organization

Session

Tokens

==================================================
PART 3
LOGIN
==================================================

Implement:

POST /auth/login

Requirements:

Validate credentials.

Verify Argon2 password.

Create new session.

Store hashed refresh token.

Return:

Access Token

Refresh Token

User

Organizations

Current Organization

Session ID

==================================================
PART 4
JWT SERVICE
==================================================

Implement reusable JWT service.

Support:

Access Tokens

Refresh Tokens

Use separate secrets.

Include:

sub

email

sessionId

activeOrgId

tokenVersion

jti

Implement expiration.

==================================================
PART 5
REFRESH TOKEN ROTATION
==================================================

Implement:

POST /auth/refresh

Requirements:

Verify refresh token.

Verify session.

Issue new access token.

Issue new refresh token.

Replace stored refresh token hash.

Invalidate previous refresh token.

Protect against replay attacks.

==================================================
PART 6
SESSION MANAGEMENT
==================================================

Implement repository methods for:

Create Session

Get Session

Get User Sessions

Update Last Active

Revoke Session

Revoke All Sessions

Switch Active Organization

==================================================
PART 7
REDIS INTEGRATION
==================================================

Implement Redis integration layer.

Generate production-ready code.

If Redis is unavailable during development, the code should fail gracefully without preventing project generation.

Cache:

Session metadata

Refresh metadata

Revoked JWT IDs

Session expiration

==================================================
PART 8
LOGOUT
==================================================

Implement:

POST /auth/logout

Requirements:

Revoke current session.

Delete Redis session.

Blacklist current JWT ID.

==================================================
PART 9
LOGOUT EVERYWHERE
==================================================

Implement:

POST /auth/logout-all

Requirements:

Revoke every active session.

Delete Redis caches.

Invalidate refresh tokens.

==================================================
PART 10
ORGANIZATION SWITCHING
==================================================

Implement:

POST /auth/switch-org

Requirements:

Verify user membership.

Update active organization.

Issue new Access Token.

Update session.

==================================================
PART 11
AUTHENTICATION MIDDLEWARE
==================================================

Implement middleware to:

Verify JWT

Check expiration

Verify session

Load user

Load active organization

Attach authenticated user to request.

==================================================
PART 12
AUTHORIZATION CONTEXT
==================================================

Attach to request:

userId

email

sessionId

activeOrgId

roles

platformAdmin

==================================================
PART 13
DTO VALIDATION
==================================================

Create Zod schemas for:

Register

Login

Refresh

Logout

Logout All

Switch Organization

==================================================
PART 14
ROUTES
==================================================

Implement:

POST /auth/register

POST /auth/login

POST /auth/refresh

POST /auth/logout

POST /auth/logout-all

POST /auth/switch-org

GET /auth/me

GET /auth/sessions

==================================================
PART 15
SECURITY
==================================================

Implement:

Argon2id password hashing

Refresh token hashing

JWT replay protection

Secure error responses

Input validation

Constant-time password verification

Login rate-limit hooks

Never leak whether a user exists.

==================================================
PART 16
DOCUMENTATION
==================================================

Generate:

1. API documentation.

2. Example requests.

3. Example responses.

4. Folder structure.

5. List of all generated files.

6. Commands required to run:

npm install

npx prisma generate

npm run build

Do NOT execute migrations automatically.

==================================================
IMPORTANT
==================================================

Generate production-quality TypeScript.

Follow the existing Repository → Service → Controller architecture.

Reuse existing middleware and utilities.

Do not rewrite previously implemented modules unless necessary.

Do not remove existing code.

Keep the implementation modular, scalable, and interview-quality.