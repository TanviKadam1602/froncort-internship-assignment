You are a Senior Frontend Engineer.

The backend is COMPLETE.

The frontend foundation already exists using:

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Axios
- TanStack Query
- React Hook Form
- Zod

Do NOT modify backend code.

Reuse the existing frontend architecture.

==================================================
OBJECTIVE
==================================================

Implement the complete Authentication and Organization Management frontend.

Use the existing backend APIs.

Generate production-ready code.

==================================================
PAGES
==================================================

Implement:

/login

/register

/dashboard

/profile

/settings

==================================================
AUTHENTICATION
==================================================

Implement:

Login Form

Register Form

JWT Login

Refresh Token Flow

Persistent Login

Protected Routes

Logout

Automatic Logout on Refresh Failure

Session Expiration Handling

==================================================
ORGANIZATION
==================================================

Implement:

Organization Switcher

Current Organization Badge

Organization Selector Dropdown

Create Organization Modal

Join Organization Flow

Organization Settings Page

Organization Members List

Organization Invitations UI

==================================================
PROFILE
==================================================

Implement:

Avatar

Name

Email

Role

Current Organization

Edit Profile

Change Password

Logout Button

==================================================
RBAC
==================================================

Frontend must support:

USER

SUPPORT_AGENT

SUPPORT_MANAGER

ORG_ADMIN

Hide UI elements the user cannot access.

Create reusable:

<RoleGuard>

component.

==================================================
FORMS
==================================================

Use:

React Hook Form

Zod

Reusable Inputs

Validation

Loading States

==================================================
STATE
==================================================

Use:

React Context

TanStack Query

Do NOT use Redux.

==================================================
API
==================================================

Connect to backend endpoints.

Create reusable hooks.

Examples:

useLogin()

useRegister()

useCurrentUser()

useOrganizations()

useSwitchOrganization()

==================================================
LAYOUT
==================================================

Authenticated users should see:

Sidebar

Top Navigation

Breadcrumb

Notification Bell

Profile Menu

Organization Switcher

Unauthenticated users should see:

Minimal Layout

==================================================
UI COMPONENTS
==================================================

Create reusable:

LoginCard

RegisterCard

ProfileCard

OrganizationCard

OrganizationSwitcher

MemberCard

InviteDialog

PermissionGuard

RoleBadge

==================================================
ERROR HANDLING
==================================================

Handle:

401

403

404

500

Display toast notifications.

==================================================
LOADING STATES
==================================================

Use:

Skeletons

Spinners

Button Loading

==================================================
RESPONSIVE
==================================================

Support:

Desktop

Tablet

Mobile

==================================================
ACCESSIBILITY
==================================================

Use:

Keyboard Navigation

ARIA Labels

Focus Management

==================================================
THEME
==================================================

Support:

Light

Dark

System

==================================================
DOCUMENTATION
==================================================

Generate:

Folder Structure

Component List

Generated Files

API Connections

==================================================
VERIFY
==================================================

Application must successfully run:

npm install

npm run build

==================================================
IMPORTANT
==================================================

Generate production-ready code.

Do not modify backend.

Reuse existing frontend architecture.

Keep components reusable.

Follow Next.js 15 App Router best practices.