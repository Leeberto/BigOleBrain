# Data Browser Dashboard

## Purpose

Read-only table browser for Open Brain extension tables. This dashboard stays standalone and reusable.

## Prerequisites

- A Supabase project with Open Brain extensions installed
- A Supabase user account for authentication
- Node.js 18+

## Environment

Use `dashboards/data-browser/.env.example` as the source of truth for required variables.

## Run Locally

From the repo root:

```bash
npm run dev:data-browser
```

Or from this folder:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with your Supabase email/password.

## Check

- Root command: `npm run check:data-browser`
- Repo-wide docs check: `npm run check`

## Deploy to Vercel

1. Import your repo at [vercel.com/new](https://vercel.com/new)
2. Set **Root Directory** to `dashboards/data-browser`
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Verify

- Confirm sign-in works with your Supabase user account.
- Confirm table groups render without treating missing schemas as frontend bugs.

## Included Table Groups

| Table Group | Tables |
| --- | --- |
| Core | thoughts |
| Household | household_items, household_vendors |
| Maintenance | maintenance_tasks, maintenance_logs |
| Calendar | family_members, activities, important_dates |
| Meals | recipes, meal_plans, shopping_lists |
| CRM | professional_contacts, contact_interactions, opportunities |
| Job Hunt | companies, job_postings, applications, interviews, job_contacts |
