# Thought Explorer Dashboard

Visualize and explore your Open Brain thoughts with three views:

- **Timeline** — Reverse-chronological cards with type badges, topic tags, and people mentions. Filter by type, topic, person, or search.
- **Heatmap** — GitHub-style activity grid showing thought capture frequency over the last 6 months.
- **Topics** — Cluster cards grouped by topic with count badges. Click a cluster to filter the timeline.

## Setup

1. Clone this repo and `cd dashboards/thought-explorer`
2. Copy `.env.example` to `.env.local` and fill in your Supabase credentials
3. `npm install && npm run dev`
4. Open `http://localhost:3000` and sign in

## Deploy to Vercel

1. Import repo in Vercel
2. Set root directory to `dashboards/thought-explorer`
3. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

## Stack

- Next.js 14 (App Router)
- Tailwind CSS (dark theme)
- @supabase/ssr + @supabase/supabase-js
