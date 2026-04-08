# CLAUDE.md - Agent Instructions for Open Brain

This file is the repo-wide routing guide for AI coding tools working in BigOleBrain.

## What This Repo Is

Open Brain is a persistent AI memory system: one database, one MCP protocol, any AI client. This repo mixes product code, reusable templates, contribution surfaces, and implementation planning docs.

License: FSL-1.1-MIT. Do not introduce assumptions or dependencies that conflict with that license.

## Start Here

Before making changes, read the smallest set of files that answer these questions:

1. What kind of thing am I changing?
2. Which folder owns it?
3. Is this product code, a reusable template, or planning context?

Useful entrypoints:

- `README.md` - repo front door and repo map
- `docs/AI-START-HERE.md` - quick onboarding for AI tools
- `docs/project-index.md` - runnable apps and dashboards
- `docs/ROADMAP.md` - future priorities
- `docs/specs/` - numbered implementation specs
- `docs/decisions/` - decision records
- `docs/builds/` - implementation logs

## Repo Map

Use this routing table before generating code:

| Path | Owner / purpose | Default action |
| --- | --- | --- |
| `apps/brain/` | Canonical maintained product app | Put unified product features here |
| `dashboards/` | Standalone frontend templates and community dashboard surface | Put reusable or standalone frontend work here |
| `extensions/` | Curated learning-path builds | Do not add or reshape casually |
| `recipes/` | Standalone capability builds | Good for self-contained add-ons |
| `schemas/` | Database extensions | Use for table or module add-ons |
| `integrations/` | Capture and connection surfaces | Use for webhook, MCP, and connector work |
| `primitives/` | Shared reusable concepts | Extract only when reused |
| `supabase/` | Edge Functions, migrations, and backend runtime | Use for remote MCP and backend behavior |
| `docs/` | Guides and planning artifacts | Use the taxonomy below |

Important distinction:

- `apps/brain` is product code.
- `dashboards/` is the template, example, and contribution surface.
- Moving code from `dashboards/` into `apps/brain` is a product promotion.

## Docs Taxonomy

Do not drop planning notes into random markdown files.

- `docs/ROADMAP.md` = future priorities and status
- `docs/specs/` = implementation specs and scoped build plans
- `docs/decisions/` = durable decision records with rationale
- `docs/builds/` = what was implemented, deviations, and verification notes
- `docs/drafts/` = uncommitted or exploratory notes

If you implement a feature from a spec, update or create a build log in `docs/builds/`, not the roadmap.

## Guard Rails

- Never modify the core `thoughts` table structure. Adding columns is fine; altering or dropping existing columns is not.
- No credentials, API keys, or secrets in committed files.
- No binary blobs over 1MB and no packaged installers or archives.
- No `DROP TABLE`, `DROP DATABASE`, `TRUNCATE`, or unqualified `DELETE FROM` in SQL files.
- MCP servers must be remote Supabase Edge Functions, not local stdio servers.
- Do not invent backend patterns when the repo already has one in `supabase/functions/`.

## Verification Expectations

Before stopping, verify the smallest meaningful slice:

- Docs-only changes: confirm links, paths, and taxonomy references are consistent.
- `apps/brain` changes: run the app-specific lint or smoke check if feasible.
- `dashboards/` changes: verify the specific dashboard README, env example, and run command remain accurate.
- `supabase/` changes: verify function and migration placement and pattern consistency.

Prefer root scripts when available:

- `npm run list:projects`
- `npm run check`
- `npm run lint`

## PR Standards

- Title format: `[category] Short description`
- Branch convention: `contrib/<github-username>/<short-description>`
- Commit prefixes: `[category]`
- Every contribution PR must pass `.github/workflows/ob1-review.yml`
- Follow `CONTRIBUTING.md` for metadata and README requirements

## Local Guidance

Read these when your work touches those areas:

- `apps/brain/CLAUDE.md`
- `dashboards/CLAUDE.md`
- `supabase/CLAUDE.md`
