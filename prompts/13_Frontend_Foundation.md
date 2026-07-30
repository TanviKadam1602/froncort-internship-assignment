You are a Senior Frontend Architect.

The backend is COMPLETE and must NOT be modified.

Backend provides:

- JWT Authentication
- RBAC
- Organization Switching
- Support Hub APIs
- Review Console APIs
- Cross Organization APIs
- Audit APIs
- AI APIs
- Notification APIs

Your task is to build the complete frontend foundation using modern Next.js best practices.

==================================================
TECH STACK
==================================================

Next.js 15

React 19

TypeScript

Tailwind CSS

shadcn/ui

React Hook Form

Zod

TanStack Query

Axios

Lucide React

==================================================
PROJECT STRUCTURE
==================================================

Create:

frontend/

Inside:

src/

app/

components/

features/

hooks/

contexts/

providers/

services/

lib/

types/

styles/

==================================================
APP ROUTER
==================================================

Use Next.js App Router.

Create:

layout.tsx

page.tsx

loading.tsx

error.tsx

not-found.tsx

==================================================
LAYOUT
==================================================

Create a professional SaaS dashboard layout.

Include:

Top Navigation

Sidebar

Organization Switcher

Notification Bell

Profile Menu

Breadcrumb

Responsive Mobile Drawer

==================================================
AUTHENTICATION
==================================================

Implement frontend authentication infrastructure.

Create:

Auth Context

Protected Route

Axios Interceptors

Automatic JWT Refresh

Logout on Refresh Failure

Persist Login

==================================================
API CLIENT
==================================================

Create reusable Axios client.

Support:

Access Token

Refresh Token

Automatic Retry

401 Refresh Flow

Error Handling

Base URL from environment variables

==================================================
STATE MANAGEMENT
==================================================

Use:

React Context

TanStack Query

Do NOT use Redux.

==================================================
THEME
==================================================

Implement:

Light Mode

Dark Mode

System Theme

Theme Toggle

==================================================
SHADCN COMPONENTS
==================================================

Create reusable UI components.

Examples:

Button

Card

Dialog

Modal

Input

Textarea

Select

Table

Badge

Avatar

Tabs

Dropdown

Pagination

Toast

Skeleton

Loader

Empty State

==================================================
COMMON COMPONENTS
==================================================

Create:

Page Header

Search Bar

Filter Bar

Organization Selector

Status Badge

Priority Badge

Role Badge

Permission Guard

Data Table

Confirmation Dialog

==================================================
FORMS
==================================================

Use:

React Hook Form

Zod Validation

Reusable Form Components

==================================================
ERROR HANDLING
==================================================

Implement:

Global Error Boundary

Toast Notifications

Loading States

Empty States

404 Page

==================================================
ENVIRONMENT
==================================================

Create support for:

NEXT_PUBLIC_API_BASE_URL

==================================================
ROUTES
==================================================

Prepare routing for:

/

/login

/register

/dashboard

/support

/reviews

/collaboration

/audit

/ai

/notifications

/settings

Do NOT implement full pages yet.

Create placeholders.

==================================================
RESPONSIVE DESIGN
==================================================

Support:

Desktop

Tablet

Mobile

==================================================
ACCESSIBILITY
==================================================

Use:

ARIA Labels

Keyboard Navigation

Focus Management

==================================================
DOCUMENTATION
==================================================

Generate:

Folder Structure

Component List

Generated File List

Installation Commands

Run Commands

==================================================
VERIFY
==================================================

Project must build successfully using:

npm install

npm run build

==================================================
IMPORTANT
==================================================

Generate production-ready code.

Do NOT modify backend.

Do NOT create business pages yet.

Only build the frontend foundation and reusable infrastructure.