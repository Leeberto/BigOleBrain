# Home Maintenance Dashboard

## Purpose

A dark-mode personal dashboard for the Home Maintenance Tracker extension. This remains a standalone dashboard surface.

## Prerequisites

- Working Open Brain setup with Extension 2 deployed
- Supabase project with `maintenance_tasks` and `maintenance_logs`
- Node.js 18+

## Environment

Use `dashboards/home-maintenance/.env.example` as the source of truth for required variables.

## Run Locally

From the repo root:

```bash
npm run dev:home-maintenance
```

Or from this folder:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Check

- Root command: `npm run check:home-maintenance`
- Repo-wide docs check: `npm run check`

## Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your repository
3. Set the **Root Directory** to `dashboards/home-maintenance`
4. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

## Verify

- Confirm overdue, upcoming, and recent activity sections render with live data.
- Confirm missing data is due to auth or schema setup before changing code.
