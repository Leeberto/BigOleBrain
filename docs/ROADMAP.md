# BigOleBrain Feature Roadmap

> This file tracks future priorities and feature status only. Detailed build specs live in `docs/specs/`. Decision records live in `docs/decisions/`. Implementation logs live in `docs/builds/`. See `docs/AI-START-HERE.md` and `docs/SESSION_GUIDE.md` for contributor workflow guidance.

## Guard Rails

See `CLAUDE.md` for the full list. Key rules:

- Never modify the core `thoughts` table structure.
- MCP servers must be remote Supabase Edge Functions.
- No credentials in code.
- Follow the Edge Function pattern in `supabase/functions/open-brain-mcp/index.ts`.
- Every new contribution folder needs `README.md` and `metadata.json` per `CONTRIBUTING.md`.
- `apps/brain` is the canonical maintained product app.
- `dashboards/` are standalone templates and contribution surfaces.
- SQL must avoid destructive operations.

## Status Overview

| Feature | Status | Spec file |
| --- | --- | --- |
| 1.1 Actions table | Complete | - |
| 1.2L Thought explorer | Complete | - |
| 1.3L Calendar view | Complete | - |
| 1.1a UUID exposure | Complete | `docs/specs/1.1a-uuid-exposure.md` |
| 1.1b Recurring actions | Complete | `docs/specs/1.1b-recurring-actions.md` |
| 1.2a Command center scaffold | Complete | `docs/specs/1.2a-command-center-scaffold.md` |
| 1.2b Today view | Complete | `docs/specs/1.2b-today-view.md` |
| 1.2c Upcoming view | Complete | `docs/specs/1.2c-upcoming-view.md` |
| 1.2d Thoughts view | Complete | `docs/specs/1.2d-thoughts-view.md` |
| 3.2 Stale loop detector (MCP) | Complete | `docs/specs/3.2-stale-loop-mcp.md` |
| 4.2 Weekly trends (MCP) | Quick win | `docs/specs/4.2-weekly-trends-mcp.md` |
| 1.1d-s1 Task engine schema | Complete | `docs/specs/1.1d-s1-task-engine-schema.md` |
| 1.1d-s2 Cron triggers | Complete | `docs/specs/1.1d-s2-cron-triggers.md` |
| 1.1d-s3 LLM prompt task type | Complete | `docs/specs/1.1d-s3-llm-prompt.md` |
| 1.1d-s4 Alert digest task type | Complete | `docs/specs/1.1d-s4-alert-digest.md` |
| 1.1d-s5 Stale loop scan task type | Complete | `docs/specs/1.1d-s5-stale-loop-scan.md` |
| 1.1d-s6 Deck builder task type | Blocked on template | `docs/specs/1.1d-s6-deck-builder.md` |
| 1.1d-s7 Event trigger | Ready | `docs/specs/1.1d-s7-event-trigger.md` |
| 1.1d-s8 Trend analysis task type | Blocked on 1.1d-s2, 4.2 | `docs/specs/1.1d-s8-trend-analysis.md` |
| 2.1 Multi-user auth | Complete | `docs/specs/2.1-multi-user-auth.md` |
| 2.2 Liv's dashboard | Superseded by Phase 3 | `docs/specs/2.2-livs-dashboard.md` |
| 2.3 Instacart export | Standalone | `docs/specs/2.3-instacart-export.md` |
| 3.0-s1 App shell + auth | Complete | `docs/specs/3.0-s1-app-shell-auth.md` |
| 3.0-s2 Shared components | Complete | `docs/specs/3.0-s2-shared-components.md` |
| 3.0-s3 Actions screen | Complete | `docs/specs/3.0-s3-actions-screen.md` |
| 3.0-s3 Thoughts screen | Complete | `docs/specs/3.0-s3b-thoughts-screen.md` |
| 3.0-s4 Household screen | Complete | `docs/specs/3.0-s4-household-screen.md` |
| 3.0-s5 Meals screen | Complete | `docs/specs/3.0-s5-meals-screen.md` |
| 3.0-s6 Morning briefing | Complete | `docs/specs/3.0-s6-morning-briefing.md` |
| 3.0-s7 Agent feed | Complete | `docs/specs/3.0-s7-agent-feed.md` |
| 3.0-s8 Polish + Vercel deploy | Blocked on 3.0-s7 | `docs/specs/3.0-s8-polish-deploy.md` |
| 4.1 Thought graph | Phase 4 | `docs/specs/4.1-thought-graph.md` |
| 4.3 Capture sources | Modular | `docs/specs/4.3-capture-sources.md` |
| 5.1 Triage agent | Blocked on 1.1a | `docs/specs/5.1-triage-agent.md` |
| 5.2 Routing agent | Blocked on 5.1 | `docs/specs/5.2-routing-agent.md` |
| 5.3 Verification loop | Blocked on 5.2 | `docs/specs/5.3-verification-loop.md` |
| 5.4 Research agent | Blocked on 5.2, 5.3 | `docs/specs/5.4-research-agent.md` |

## Build Order

Each item is intended to be a single implementation slice.

### Phase 1: Foundation and Dashboard

1. `1.1a` UUID exposure
2. `1.1b` Recurring actions
3. `1.2a` Command center scaffold
4. `1.2b` Today view
5. `1.2c` Upcoming view
6. `1.2d` Thoughts view
7. `3.2` Stale loop detector
8. `4.2` Weekly trends

### Task Engine

1. `1.1d-s1` Task engine schema
2. `1.1d-s2` Cron triggers
3. `1.1d-s3` LLM prompt task type
4. `1.1d-s4` Alert digest task type
5. `1.1d-s5` Stale loop scan
6. `1.1d-s6` Deck builder
7. `1.1d-s7` Event trigger
8. `1.1d-s8` Trend analysis

### Phase 3: Unified App

1. `3.0-s1` App shell and auth
2. `3.0-s2` Shared components
3. `3.0-s3` Actions screen
4. `3.0-s4` Household screen
5. `3.0-s5` Meals screen
6. `3.0-s6` Morning briefing
7. `3.0-s7` Agent feed
8. `3.0-s8` Polish and Vercel deploy

### Phase 4: Intelligence

1. `4.1` Thought graph
2. `4.3` Capture sources

### Phase 5: Agent Pipeline

1. `5.1` Triage agent
2. `5.2` Routing agent
3. `5.3` Verification loop
4. `5.4` Research agent
