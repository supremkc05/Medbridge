<p align="left"><img src="src/assets/brand/medbridge-logo.png" alt="MedBridge" width="260"></p>

# MedBridge

Clinic management web app: overview dashboard, appointments, patient records, billing and administration.

> **About this repository.** I wrote this from scratch after my industrial training (IND60308) to show
> the kind of screens I built as a frontend intern. The production system belongs to a client and is
> covered by a non-disclosure agreement, so none of its source code, designs or data are included.
> All data here is generated sample data; no real patient information is used.

## Features

| Module | Screens |
| --- | --- |
| Overview | KPIs, monthly revenue, today's upcoming appointments, overdue invoices, doctor workload, recently seen patients |
| Appointments | Week strip, day schedule with doctor and status filters, check-in / complete / no-show actions |
| Patients | List with search, filters, sorting and pagination · patient detail with appointment history · create/edit form with validation |
| Administration | Staff accounts with role-aware controls and a permissions matrix · clinic settings |
| Billing | Invoice dashboard with period totals, collection status, monthly chart and filters |

The **Viewing as** selector in the top bar switches between roles (clinic manager, doctor, front desk,
billing officer). The UI hides controls a role cannot use, and the API enforces the same rules.

## Tech stack

- Next.js (App Router), React and TypeScript
- Redux Toolkit and RTK Query (cache tags and invalidation)
- SCSS modules with shared design tokens
- An in-browser REST-style router (`src/backend`) behind a custom RTK Query base query, so the app runs as a static site
- Jest and React Testing Library
- GitHub Actions: lint, type check, unit tests and build on every pull request; deploys to GitHub Pages from `main`

## Live site

https://supremkc05.github.io/Medbridge/

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
  app/            routes (pages)
  components/     shared UI components and the app shell
  features/       patients, admin and billing modules (UI + RTK Query endpoints)
  lib/            formatting, permissions and validation shared by UI and API
  backend/        seeded data, query logic and the in-browser API router
  store/          Redux store, session slice and base API
```
