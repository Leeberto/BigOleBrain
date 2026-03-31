# Multi-user Auth (Feature 2.1)

Adds household-scoped multi-user support with Row Level Security.

## What it does

- Creates `households` and `household_members` tables
- Adds `user_id` to personal tables (`thoughts`, `actions`)
- Adds `household_id` to all shared tables
- Backfills existing data to Lee (owner) and the shared household
- Applies RLS policies: personal = own rows only, shared = household members

## Migration files

Run in order in the Supabase SQL Editor:

| File | Purpose |
|------|---------|
| `001-schema.sql` | New tables, column additions, indexes |
| `002-backfill.sql` | Backfill data + NOT NULL constraints (edit UUIDs first) |
| `003-rls.sql` | Drop old policies, create household-based policies |

## Before running 002-backfill.sql

1. Create Auth users for Lee and Liv in the Supabase dashboard
2. Replace the placeholder UUIDs in `002-backfill.sql` with real values

## RLS model

- **Personal tables** (`thoughts`, `actions`): `auth.uid() = user_id`
- **Shared tables**: household membership check via `household_members` table
- **Delete on shared tables**: owner role only
- **Service role** (used by all current MCP tools): bypasses RLS entirely — no breaking changes
