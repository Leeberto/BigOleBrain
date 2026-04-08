# apps/brain Guidance

This folder is the canonical maintained product app.

Use `apps/brain` when:

- the feature belongs in the unified product experience
- the work spans multiple legacy dashboard concepts
- the feature is no longer meant to remain a standalone template

Do not default to this folder just because it already has similar code. If the goal is still a reusable or standalone dashboard, prefer `dashboards/`.

Before stopping:

- run the app-specific lint if feasible
- update the relevant spec or build log when product behavior changes materially
