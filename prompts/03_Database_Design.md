Act as a Principal Database Architect and Senior Backend Engineer.

The system architecture has been finalized and approved.

Your task is to design a production-grade PostgreSQL database for the Unified Organization Workspace.

This database must satisfy every requirement from the assignment.

Do NOT generate Express code.

Do NOT generate React or Next.js code.

Do NOT generate controllers, routes or services.

Generate ONLY the database design.

The design must include:

## 1. Entity Relationship Diagram

Generate a complete ER diagram showing all entities and relationships.

## 2. Complete Table List

For every table explain:

- Purpose
- Why it exists
- Which assignment requirement it satisfies

## 3. Columns

For every table include:

- Column name
- Data type
- Nullable or not
- Default value
- Constraints

## 4. Primary Keys

## 5. Foreign Keys

## 6. Junction Tables

## 7. Cardinality

Explain:

- One-to-One
- One-to-Many
- Many-to-Many

relationships.

## 8. Database Normalization

Explain why the schema is normalized.

## 9. Indexing Strategy

Recommend indexes for:

- Authentication
- Tickets
- PRs
- Audit logs
- Notifications
- Search
- Cross-org sharing

## 10. Cascade Rules

Explain every cascade.

## 11. Soft Delete Strategy

## 12. Audit Log Design

Explain how append-only behavior is enforced.

## 13. Versioning Design

Explain how PR version history is stored.

## 14. Cross-Org Sharing Design

Explain how shared resources are represented.

## 15. RBAC Database Design

Explain role mapping.

## 16. Feature Flag Design

## 17. Notification Design

## 18. AI Digest Storage

## 19. Prisma Model Design

Generate the complete Prisma schema with:

- Models
- Enums
- Relationships
- Indexes
- Constraints

No Express code.

No TypeScript.

Only Prisma schema.

## 20. Security Review

Explain:

- Tenant isolation
- BOLA prevention
- Referential integrity
- Data leakage prevention

## 21. Performance Review

Explain:

- Expected bottlenecks
- Recommended optimizations
- Query performance considerations

Finally review the entire schema and verify that every assignment requirement is supported before finishing.

Do not generate backend code.

Wait for approval before implementation.