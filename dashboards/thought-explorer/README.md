# Thought Explorer Dashboard

## Purpose

Standalone visualization dashboard for exploring your thought stream. This remains a reusable dashboard, not the canonical product app.

## Views

- **Timeline** - reverse-chronological cards with type badges, topic tags, and people mentions
- **Heatmap** - GitHub-style activity grid showing thought capture frequency
- **Topics** - cluster cards grouped by topic with count badges

## Environment

Use `dashboards/thought-explorer/.env.example` as the source of truth for required variables.

## Run Locally

From the repo root:

```bash
npm run dev:thought-explorer
```

Or from this folder:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in.

## Check

- Root command: `npm run check:thought-explorer`
- Repo-wide docs check: `npm run check`

## Deploy to Vercel

1. Import the repo in Vercel
2. Set root directory to `dashboards/thought-explorer`
3. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

## Verify

- Confirm Timeline, Heatmap, and Topics views render.
- Confirm filters and search behave against live thought data.
