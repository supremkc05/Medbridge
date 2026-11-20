# MedBridge — Recreated Demo

> **Recreated demonstration of the interface, built after the placement. This is not client code.**
> All data is generated test data. No real patient information is used anywhere in this repository.

This project recreates, from scratch, the kind of screens I worked on during my industrial training
(IND60308) as a frontend development intern: a clinic management web app with patients,
administration and billing modules. The original product belongs to a client and is covered by a
non-disclosure agreement, so none of its source code, designs or data are included here.

## Features

| Module | Screens |
| --- | --- |
| Patients | List with search, filters, sorting and pagination · patient detail with appointment history · create/edit form with validation |
| Administration | Staff accounts with role-aware controls and a permissions matrix · clinic settings |
| Billing | Invoice dashboard with period totals, collection status, monthly chart and filters |

The **Viewing as** selector in the top bar switches between roles (clinic manager, doctor, front desk,
billing officer). The UI hides controls a role cannot use, and the API enforces the same rules.

## Tech stack

- Next.js (App Router), React and TypeScript
- Redux Toolkit and RTK Query (cache tags and invalidation)
- SCSS modules with shared design tokens
- Next.js route handlers as a REST API over seeded, in-memory sample data
- Jest and React Testing Library
- GitHub Actions: lint, type check, unit tests and build on every pull request

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit and component tests
npm run lint
npm run typecheck
```

## Project structure

```
src/
  app/            routes (pages) and API route handlers
  components/     shared UI components and the app shell
  features/       patients, admin and billing modules (UI + RTK Query endpoints)
  lib/            formatting, permissions and validation shared by UI and API
  server/         seeded data and query logic used by the API
  store/          Redux store, session slice and base API
```
