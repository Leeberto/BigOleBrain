# Data Browser Dashboard

Read-only table browser for all Open Brain extension tables. Dark-mode UI with pagination and smart value formatting (dates, JSON, long text truncation).

## Prerequisites

- A Supabase project with Open Brain extensions installed
- A Supabase user account (email/password) for authentication
- Node.js 18+

## Setup

### 1. Clone and install

```bash
cd dashboards/data-browser
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in your Supabase dashboard under **Settings > API**.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with your Supabase email/password.

### 4. Deploy to Vercel

1. Import your repo at [vercel.com/new](https://vercel.com/new)
2. Set **Root Directory** to `dashboards/data-browser`
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## What's included

| Table Group | Tables |
|---|---|
| Core | thoughts |
| Household | household_items, household_vendors |
| Maintenance | maintenance_tasks, maintenance_logs |
| Calendar | family_members, activities, important_dates |
| Meals | recipes, meal_plans, shopping_lists |
| CRM | professional_contacts, contact_interactions, opportunities |
| Job Hunt | companies, job_postings, applications, interviews, job_contacts |

## Troubleshooting

**Tables show "No rows"** — Make sure you're signed in with the same account that owns the data. RLS policies only return rows matching your user ID.

**"Invalid API key"** — Double-check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your `.env.local` or Vercel environment variables.

**A table errors out** — If you haven't installed that extension's schema yet, the table won't exist. Run the extension's `schema.sql` in your Supabase SQL editor first.
