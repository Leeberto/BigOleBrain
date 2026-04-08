# AI Start Here

Use this file when an AI coding tool opens the repo and needs to orient itself quickly.

## Fast Routing

1. Read [`../CLAUDE.md`](../CLAUDE.md) for repo-wide rules.
2. Use [`project-index.md`](project-index.md) to find runnable apps and dashboards.
3. Decide whether the work belongs in product code, a reusable template, or planning docs.

## Product vs Template

- [`../apps/brain`](../apps/brain/) is the canonical maintained product app.
- [`../dashboards`](../dashboards/) is the standalone dashboard template and community contribution surface.
- Moving code from `dashboards/` into `apps/brain/` is treated as a product promotion.

## Planning Docs

- [`ROADMAP.md`](ROADMAP.md) = future priorities
- [`specs/`](specs/) = implementation specs
- [`decisions/`](decisions/) = durable decisions and rationale
- [`builds/`](builds/) = implementation history, deviations, and verification notes
- [`drafts/`](drafts/) = rough notes

## Safe Defaults

- Do not improvise backend architecture when `supabase/functions/` already shows the pattern.
- Do not modify the core `thoughts` table shape except additive columns.
- Do not add local MCP server patterns; use remote Supabase Edge Functions.
- If the task is frontend and meant to be reusable, prefer `dashboards/`.
- If the task is part of the unified app experience, prefer `apps/brain/`.

## Useful Commands

Run these from the repo root:

```bash
npm run list:projects
npm run check
npm run lint
```
