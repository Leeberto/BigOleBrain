# Project Index

This is the runnable-project inventory for BigOleBrain. Use it to decide which app or dashboard to run before editing.

## Canonical Product App

| Project | Path | Purpose | Env example | Run | Lint |
| --- | --- | --- | --- | --- | --- |
| Brain | `apps/brain` | Unified maintained product app for the Open Brain experience | `apps/brain/.env.local.example` | `npm run dev:brain` | `npm run lint:brain` |

## Standalone Dashboards

| Project | Path | Purpose | Env example | Run | Lint |
| --- | --- | --- | --- | --- | --- |
| Command Center | `dashboards/command-center` | Standalone action and planning dashboard | `dashboards/command-center/.env.example` | `npm run dev:command-center` | `npm run check:command-center` |
| Data Browser | `dashboards/data-browser` | Read-only browser for Open Brain tables | `dashboards/data-browser/.env.example` | `npm run dev:data-browser` | `npm run check:data-browser` |
| Home Maintenance | `dashboards/home-maintenance` | Standalone dashboard for maintenance tasks and logs | `dashboards/home-maintenance/.env.example` | `npm run dev:home-maintenance` | `npm run check:home-maintenance` |
| Thought Explorer | `dashboards/thought-explorer` | Exploratory visualization dashboard for thoughts | `dashboards/thought-explorer/.env.example` | `npm run dev:thought-explorer` | `npm run check:thought-explorer` |

## Choosing the Right Surface

- Use `apps/brain` when the feature belongs in the maintained product app.
- Use `dashboards/` when the feature should remain standalone, reusable, or community-contribution friendly.
- If you promote a dashboard capability into the product app, document that promotion in the relevant spec or build log.
