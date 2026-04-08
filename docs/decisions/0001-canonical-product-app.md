# 0001 - Canonical Product App Lives in `apps/brain`

- Date: 2026-04-08
- Status: Accepted

## Context

The repo contains both a unified app under `apps/brain` and multiple standalone frontends under `dashboards/`. Without an explicit rule, contributors and AI coding tools can route product work into the wrong surface or treat folder moves as arbitrary refactors.

## Decision

- `apps/brain` is the canonical maintained product app.
- `dashboards/` remains the standalone template and community contribution surface.
- Moving a feature from `dashboards/` into `apps/brain` is a deliberate product promotion and should be documented in the relevant spec or build log.

## Consequences

- Product features should default to `apps/brain`.
- Reusable or standalone frontend contributions should default to `dashboards/`.
- Repo docs and agent instructions must reinforce this split so contributors do not have to infer it.
