# Command Center

## Purpose

Standalone action-driving dashboard for Open Brain. This is a reusable dashboard surface, not the canonical product app.

It answers two questions: **"What needs my attention?"** and **"What do I do next?"**

## Views

- **Today** - overdue and due-today actions, this-week preview, unprocessed thoughts queue, stale loops
- **Upcoming** - monthly and weekly calendar showing actions, activities, important dates, and maintenance tasks
- **Thoughts** - filterable reverse-chronological thought feed with "Convert to Action" workflow

## Environment

Use `dashboards/command-center/.env.example` as the source of truth, then create `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Run Locally

From the repo root:

```bash
npm run dev:command-center
```

Or from this folder:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with your Supabase email/password.

## Check

- Root command: `npm run check:command-center`
- Repo-wide docs check: `npm run check`

## Required Tables

- `thoughts`
- `actions`
- `activities`
- `important_dates`
- `maintenance_tasks`

## Deploy to Vercel

1. Import your repo at [vercel.com/new](https://vercel.com/new)
2. Set **Root Directory** to `dashboards/command-center`
3. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

## Verify

- Confirm Today, Upcoming, and Thoughts views load.
- Confirm auth works with your Supabase email and password flow.
- Confirm required tables exist before debugging frontend behavior.
