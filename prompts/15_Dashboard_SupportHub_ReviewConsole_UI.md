You are a Senior Full-Stack Frontend Engineer.

The backend is COMPLETE.

The frontend foundation, authentication, profile, settings, organization switching, RBAC, and protected routing are already implemented.

Do NOT modify backend code.

Reuse the existing frontend architecture.

==================================================
OBJECTIVE
==================================================

Implement the main application dashboard and complete UI for:

1. Dashboard
2. Support Hub
3. Review Console

Everything should be production-ready and connected to existing backend APIs.

==================================================
DASHBOARD
==================================================

Implement a modern SaaS dashboard.

Sections:

• Welcome Card
• Organization Summary
• Recent Activity
• Recent Tickets
• Recent Pull Requests
• AI Digest Preview
• Notifications Preview
• Quick Actions

Dashboard Metrics:

• Open Tickets
• Closed Tickets
• Pending Reviews
• Completed Reviews
• Active Members
• Organizations
• Connected Organizations

Charts:

• Ticket Status
• Tickets Per Priority
• PR Status
• Weekly Activity

Use reusable chart components.

==================================================
SUPERVISOR DASHBOARD
==================================================

For SUPPORT_MANAGER and ORG_ADMIN show:

• Team Performance
• Ticket SLA
• Pending Reviews
• Active Reviewers
• Ticket Assignment Overview

==================================================
SUPPORT HUB
==================================================

Implement complete ticket management.

Pages:

/tickets

/tickets/new

/tickets/[id]

Features:

• Ticket List
• Ticket Details
• Ticket Timeline
• Comments
• Attachments
• Assignee
• Status
• Priority
• Category

Actions:

Create Ticket

Edit Ticket

Delete Ticket

Assign Ticket

Resolve Ticket

Reopen Ticket

Close Ticket

==================================================
TICKET FILTERS
==================================================

Implement:

Search

Status Filter

Priority Filter

Category Filter

Assignee Filter

Date Filter

Sort

Pagination

==================================================
REVIEW CONSOLE
==================================================

Pages:

/prs

/prs/new

/prs/[id]

Features:

Pull Request List

PR Details

Files Changed

Review Timeline

Comments

Approvals

Requested Changes

Version History

==================================================
PR ACTIONS
==================================================

Create PR

Edit PR

Delete PR

Assign Reviewer

Approve

Reject

Request Changes

Merge

Close

==================================================
SEARCH
==================================================

Global search for:

Tickets

Pull Requests

Users

Organizations

==================================================
TABLES
==================================================

Create reusable data tables.

Support:

Sorting

Filtering

Pagination

Column Visibility

Loading Skeletons

Empty States

==================================================
COMPONENTS
==================================================

Create reusable components.

DashboardCard

StatCard

MetricCard

ChartCard

ActivityCard

TicketCard

TicketTable

TicketDetails

CommentList

AttachmentList

PRCard

PRTable

ReviewTimeline

ReviewerBadge

StatusBadge

PriorityBadge

SearchBar

FilterPanel

Pagination

EmptyState

LoadingSkeleton

==================================================
API
==================================================

Use backend APIs.

Create reusable hooks.

Examples:

useDashboard()

useTickets()

useTicket()

useCreateTicket()

useUpdateTicket()

useDeleteTicket()

usePRs()

usePR()

useMergePR()

==================================================
STATE
==================================================

Use:

TanStack Query

Context

Optimistic Updates

==================================================
ERROR HANDLING
==================================================

Handle:

401

403

404

500

Display user-friendly toast notifications.

==================================================
LOADING
==================================================

Implement:

Skeletons

Loading Cards

Loading Tables

Loading Buttons

==================================================
RESPONSIVE
==================================================

Support:

Desktop

Tablet

Mobile

==================================================
THEME
==================================================

Support:

Light

Dark

System

==================================================
ACCESSIBILITY
==================================================

Implement:

Keyboard Navigation

ARIA Labels

Focus Management

==================================================
PERFORMANCE
==================================================

Implement:

Lazy Loading

Memoization

Efficient Re-rendering

Pagination

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

The application must successfully execute:

npm install

npm run build

==================================================
IMPORTANT
==================================================

Generate production-ready code.

Reuse the existing architecture.

Do NOT rewrite existing authentication.

Do NOT modify backend code.

Keep components modular and reusable.

Follow Next.js 15 App Router best practices.

Only add new files and update existing frontend files where necessary.