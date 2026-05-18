# Library Management System: Bug Fix and Feature Roadmap

This roadmap is written from the perspective of preparing the project for a real software engineering interview, placement round, or live demo.

## Current Status

The project idea is strong enough for placements, but the current implementation is not showcase-ready. The main risks are build errors, weak authentication, missing authorization inside server actions, placeholder UI, and incomplete production workflows.

Primary goal: move the project from an intermediate student LMS to a polished, secure, interview-ready full-stack system.

## Phase 1: Critical Demo-Saving Fixes

These must be completed before adding new features.

### 1. Make the Project Build Cleanly

Priority: Critical

Problems:
- `npx tsc --noEmit` currently fails.
- `npm run lint` uses `next lint`, which is not valid for this Next.js setup.
- Stale `.next/types` references missing routes.
- Prisma result types do not match UI component types.
- Some MySQL Prisma queries use unsupported `mode: 'insensitive'`.
- `groupBy({ by: [] })` is invalid.

Tasks:
- Delete stale `.next` cache.
- Fix all TypeScript errors.
- Replace invalid Prisma filters.
- Fix nullable type mismatches.
- Replace invalid `groupBy` logic with `count` or aggregate queries.
- Change lint script to use ESLint directly.

Success criteria:
- `npx tsc --noEmit` passes.
- `npm run lint` passes.
- `npm run build` completes successfully.

### 2. Fix Authentication Security

Priority: Critical

Problems:
- Passwords are stored in plaintext.
- Login compares raw passwords.
- Session cookie stores plain JSON.
- A user could forge an admin session by editing the cookie.

Tasks:
- Add password hashing using `bcrypt`.
- Store only password hashes in the database.
- Update login to verify hashes.
- Replace raw JSON session cookies with signed or encrypted sessions.
- Add proper session expiry.
- Ensure logout clears the session.

Success criteria:
- Passwords are not readable in the database.
- Session cookies cannot be forged.
- Login still works for admin, librarian, student, and faculty users.

### 3. Secure Every Server Action

Priority: Critical

Problems:
- Several server actions trust IDs sent from the client.
- Route middleware protects pages, but server actions still need their own authorization.
- Client-supplied `patronId`, `adminId`, or `librarianId` can be abused.

Tasks:
- Add `requireAdminAuth()` inside admin-only actions.
- Add `requireLibrarianAuth()` inside librarian-only actions.
- Add `requirePatronAuth()` inside patron-only actions.
- Derive user IDs from the session instead of trusting client input.
- Reject unauthorized role access inside each mutation.

Success criteria:
- Patrons cannot act as other patrons.
- Librarians cannot access admin-only mutations.
- Admin actions cannot be called by non-admin users.

### 4. Fix Circulation Race Conditions

Priority: Critical

Problems:
- Two librarians could approve or issue the last available copy at the same time.
- Availability is checked before decrementing copies.
- `Item.status` can drift from `availableCopies`.

Tasks:
- Make issue and approval workflows atomic.
- Use conditional decrement where `availableCopies > 0`.
- Fail safely if no copy is available.
- Prevent duplicate active borrow records.
- Keep item status synchronized with available copy count.

Success criteria:
- The system never allows negative available copies.
- Two concurrent requests cannot issue the same final copy.
- Borrowing state remains consistent after failure.

### 5. Remove Embarrassing Placeholders

Priority: Critical

Problems:
- Admin dashboard contains fake numbers.
- Backup page is a placeholder.
- Some pages contain text like "would be displayed here".
- Root metadata still says "Create Next App".
- Patron catalog has a broken route to `/patron/dashboard/book/...`.

Tasks:
- Replace hardcoded dashboard stats with live database stats.
- Implement Backup and Restore or temporarily remove it from navigation.
- Replace placeholder recent activity sections with real data.
- Update app metadata.
- Fix broken patron catalog links.

Success criteria:
- No page visibly looks unfinished during demo.
- Navigation links do not lead to missing routes.
- Dashboard numbers come from the database.

## Phase 2: Production-Level Core Features

These features make the project feel complete instead of just functional.

### 6. Audit Log System

Priority: High

Add:
- `AuditLog` table.
- Track login, logout, item creation, item update, issue, return, renew, fine collection, settings update, and user management.
- Admin audit log page.
- Filters by action, user, role, and date.

Why it matters:
- Shows production thinking.
- Supports accountability.
- Helps answer security and debugging interview questions.

### 7. Soft Delete Instead of Hard Delete

Priority: High

Add:
- `isActive` or `deletedAt` fields for users and items.
- Archive instead of permanently deleting records.
- Preserve transaction and fine history.
- Hide inactive records from normal views.

Why it matters:
- Prevents loss of historical reports.
- Avoids deleting borrowing history.
- Looks much more professional than hard delete.

### 8. Server-Side Search and Pagination

Priority: High

Add:
- Server-side catalog search.
- Pagination for catalog, members, reports, and transactions.
- Filters by item type, status, availability, subject, and publication year.
- Sorting by title, author, created date, and popularity.

Why it matters:
- Current client-side filtering does not scale.
- Interviewers often ask how the app handles thousands of records.

### 9. Real Reports Dashboard

Priority: High

Add:
- Popular books report.
- Overdue items report.
- Fine collection summary.
- Active members report.
- Monthly borrowing trend.
- Inventory health report.
- CSV export.

Why it matters:
- Moves the project beyond CRUD.
- Shows business value for administrators.

### 10. Notification System

Priority: Medium-High

Add:
- In-app notifications table.
- Overdue reminders.
- Reservation availability alerts.
- Borrow request approved or rejected notifications.
- Optional email integration later.

Why it matters:
- Completes the user workflow.
- Makes reservation and overdue flows more realistic.

## Phase 3: Features That Push the Project Beyond Intermediate

These are the features that can make the project stand out immediately in placements.

### 11. QR or Barcode-Based Issue and Return

Priority: Very High

Add:
- Generate QR or barcode for every item.
- Generate library card QR for every patron.
- Librarian scans patron and item to issue a book.
- Librarian scans item to return it.

Why it stands out:
- It is visual and easy to demo.
- It feels like a real library workflow.
- It gives you a memorable interview talking point.

### 12. Physical Copy Management

Priority: Very High

Current limitation:
- The project tracks only `totalCopies` and `availableCopies`.

Add:
- `ItemCopy` table.
- Each copy has copy ID, barcode, status, shelf location, and condition.
- Transactions reference a specific copy.
- Lost or damaged status applies to a specific copy.

Why it stands out:
- Real libraries manage physical copies, not just book titles.
- This significantly improves the database design.

### 13. Reservation Queue

Priority: High

Add:
- Queue reservations by timestamp.
- When a copy is returned, the first waiting patron gets priority.
- Hold expires after a configurable time.
- Librarian can override queue with reason.

Why it stands out:
- Shows algorithmic and product thinking.
- Makes reservation logic realistic.

### 14. Fine Invoice and Payment Tracking

Priority: High

Current limitation:
- Fine is stored as `finePaid` on transaction.

Add:
- Separate `Fine` or `Payment` model.
- Fine status: unpaid, partially paid, paid, waived.
- Payment receipt.
- Fine waiver with reason and admin/librarian attribution.

Why it stands out:
- Looks closer to a real financial workflow.
- Gives better reporting and auditability.

### 15. Role Permission Matrix

Priority: High

Add:
- Permission table.
- Admin can decide what librarians can do.
- Example permissions: issue books, delete catalog items, view reports, waive fines.
- UI hides actions based on permissions.

Why it stands out:
- Strong enterprise RBAC feature.
- Excellent for security and architecture interview questions.

### 16. Real Backup and Restore

Priority: Medium-High

Add:
- Export database snapshot as JSON or SQL.
- Restore from backup file.
- Backup history page.
- Admin-only access.
- Audit log entry for backup and restore.

Why it stands out:
- Directly satisfies the requirement document.
- Fixes the current placeholder page.

### 17. Analytics Dashboard

Priority: Medium

Add:
- Live stats cards.
- Borrowing trend charts.
- Overdue risk score.
- Most active patrons.
- Inventory health indicators.

Why it stands out:
- Makes the app look more modern and business-oriented.

### 18. Automated Test Suite

Priority: High

Add:
- Unit tests for fine calculation.
- Unit tests for borrowing limits.
- Integration tests for issue, return, and renew flows.
- Auth tests for role access.
- Playwright smoke test for the main demo flow.

Why it stands out:
- Most student projects have no tests.
- Tests make the project much safer to demo.

## Recommended Build Order

1. Fix TypeScript, lint, and build errors.
2. Fix password hashing and session security.
3. Add authorization inside server actions.
4. Fix circulation race conditions.
5. Replace fake and placeholder UI.
6. Add audit logs.
7. Add soft delete.
8. Add server-side search and pagination.
9. Add real reports.
10. Add QR or barcode issue/return.
11. Add physical copy management.
12. Add reservation queue.
13. Add fine/payment tracking.
14. Add automated tests.

## Minimum-Time High-Impact Upgrade Path

If time is limited, do these first:

1. Clean build with no TypeScript errors.
2. Password hashing and signed session.
3. Action-level authorization.
4. Real admin dashboard stats.
5. QR-based issue and return.
6. Audit logs.
7. Server-side search and pagination.
8. Reservation queue.

This combination gives the project security, scalability, workflow depth, and one memorable demo feature.

## Final Target

After completing the critical fixes and at least three standout features, the project can be presented as:

> A secure, role-based Library Management System with real circulation workflows, audit logging, analytics, QR-based issue/return, reservation queues, and scalable database-backed search.

That is a much stronger placement pitch than a basic CRUD library app.
