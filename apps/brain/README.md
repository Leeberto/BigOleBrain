# Brain App

## Purpose

`apps/brain` is the canonical maintained product app for BigOleBrain. Use this app when a feature belongs in the unified product experience rather than a standalone dashboard template.

## Environment

Copy `.env.local.example` to `.env.local` and fill in your Supabase values:

```text
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Run Locally

From the repo root:

```bash
npm run dev:brain
```

Or from this folder:

```bash
npm install
npm run dev
```

## Lint

From the repo root:

```bash
npm run lint:brain
```

Or from this folder:

```bash
npm run lint
```

## Verify

- Confirm the app boots with valid Supabase credentials.
- Confirm auth-protected routes still respect role-aware behavior.
- If a dashboard feature was promoted into this app, document that promotion in the relevant spec or build log.
