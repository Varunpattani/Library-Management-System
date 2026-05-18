# Library Management System

A full-stack Library Management System built with Next.js, React, Prisma, and MySQL. The application is designed for college/library workflows with separate portals for administrators, librarians, and patrons.

## Overview

The system helps manage library cataloging, circulation, patron accounts, borrowing requests, reservations, fines, reports, and system settings. It replaces manual record keeping with a role-based web application.

Core roles:
- Admin: manages users, reports, system settings, and administrative workflows.
- Librarian: manages catalog items, members, circulation, borrow requests, returns, renewals, and reports.
- Patron: searches catalog items, views account activity, manages profile details, and places borrow/reserve requests.

## Tech Stack

- Framework: Next.js 15 App Router
- UI: React 19, Tailwind CSS 4, Radix UI primitives, Lucide icons
- Database ORM: Prisma 6
- Database: MySQL
- Language: TypeScript
- Package manager: npm

## Main Features

### Admin

- Admin dashboard
- User management for admins, librarians, and patrons
- System configuration for borrowing limits, loan periods, and fine rates
- Reports and analytics
- Backup and restore area planned

### Librarian

- Catalog management for books, journals, magazines, DVDs, CDs, ebooks, audiobooks, and multimedia
- Add, edit, view, and delete catalog items
- Member management for students and faculty
- Issue, return, and renew borrowed items
- Fine calculation and fine collection workflow
- Borrow/reserve request approval and rejection
- Reports for circulation and inventory

### Patron

- Browse/search visible catalog items
- View item details and availability
- Request to borrow available items
- Reserve unavailable items
- View current borrowings, history, reservations, requests, and fines
- Update profile information

## Project Structure

```text
.
|-- prisma/
|   |-- schema.prisma
|   |-- seed.ts
|   `-- migrations/
|-- public/
|-- scripts/
|-- src/
|   |-- app/
|   |   |-- actions/
|   |   |-- admin/
|   |   |-- librarian/
|   |   |-- patron/
|   |   |-- login/
|   |   `-- signup/
|   |-- components/
|   |-- config/
|   |-- hooks/
|   |-- lib/
|   `-- middleware.ts
|-- BUG_AND_FEATURE_ROADMAP.md
|-- SYSTEM_CONFIG_README.md
|-- package.json
`-- README.md
```

## Database Models

The Prisma schema includes:
- `Admin`
- `Librarian`
- `Patron`
- `Student`
- `Faculty`
- `Item`
- `Transaction`
- `Reservation`
- `BorrowRequest`
- `LibrarySettings`

The current database design supports multiple item types, item availability, student/faculty profiles, borrowing history, reservations, request processing, and configurable fine/loan settings.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
```

Only `DATABASE_URL` is required by the current codebase.

### 3. Generate Prisma client

```bash
npx prisma generate
```

The generated Prisma client is output to:

```text
src/generated/prisma
```

This folder is ignored by Git because it is generated.

### 4. Run database migrations

```bash
npx prisma migrate dev
```

### 5. Seed development data

```bash
npm run seed
```

Seeded development accounts include:

```text
Admin:
email: admin@library.edu
password: admin123

Librarian:
email: librarian@library.edu
password: librarian123

Patron examples:
email: john.doe@university.edu
password: password123
```

These are development credentials only and must not be used in production.

### 6. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The root route redirects users to login or to the correct dashboard based on their session role.

## Available Scripts

```bash
npm run dev
```

Starts the Next.js development server with Turbopack.

```bash
npm run build
```

Creates a production build.

```bash
npm run start
```

Starts the production server after a successful build.

```bash
npm run lint
```

Runs the current lint script. Note: the lint script still uses `next lint` and should be updated to `eslint .` as part of the cleanup roadmap.

```bash
npm run seed
```

Seeds the database with development users, catalog items, transactions, reservations, and library settings.

## Important Development Notes

- `.env`, `.env.local`, `node_modules`, `.next`, TypeScript build info, and the generated Prisma client are ignored by Git.
- The project currently uses a custom cookie-based session helper.
- Password hashing with `bcrypt` is planned in the roadmap and should be completed before a serious demo.
- Action-level authorization should be added to all sensitive server actions.
- Some production-level features are planned but not fully complete yet, including real backup/restore, audit logs, physical copy management, and QR/barcode issue-return.

See the full improvement plan:

```text
BUG_AND_FEATURE_ROADMAP.md
```

## Current Roadmap Priorities

1. Fix TypeScript, lint, and build errors.
2. Add `bcrypt` password hashing.
3. Replace plain JSON session cookies with signed or encrypted sessions.
4. Add authorization checks inside every server action.
5. Replace fake dashboard values and placeholder pages.
6. Add audit logging.
7. Add server-side search and pagination.
8. Add QR/barcode-based issue and return.
9. Add physical copy management.
10. Add automated tests.

## Placement/Interview Pitch

This project can be presented as:

> A role-based Library Management System with catalog management, circulation workflows, patron accounts, borrow/reserve requests, configurable loan policies, reports, and a roadmap toward audit logging, QR-based issue-return, and scalable search.

The strongest interview points are the multi-role architecture, relational database design, circulation workflow, configurable library settings, and planned production hardening.

## License

This project is currently private and intended for academic/portfolio use.
