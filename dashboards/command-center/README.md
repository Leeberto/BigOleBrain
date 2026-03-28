# Command Center

Action-driving dashboard for Open Brain. Answers two questions: **"What needs my attention?"** and **"What do I do next?"**

## Views

- **Today** (default) — Overdue/due-today actions, this-week preview, unprocessed thoughts queue, stale loops
- **Upcoming** — Monthly/weekly calendar showing actions, activities, important dates, and maintenance tasks
- **Thoughts** — Filterable reverse-chronological thought feed with "Convert to Action" workflow

## Setup

```bash
cd dashboards/command-center
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with your Supabase email/password.

## Required Tables

- `thoughts` (core)
- `actions` + recurring actions migration (`schemas/actions/`)
- `activities` (Extension 3)
- `important_dates` (Extension 3)
- `maintenance_tasks` (Extension 2)

## Deploy to Vercel

1. Import your repo at [vercel.com/new](https://vercel.com/new)
2. Set **Root Directory** to `dashboards/command-center`
3. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy
