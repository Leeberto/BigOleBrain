# Build Log

## 3.0-s3b — Thoughts Screen

**Date:** 2026-04-06
**Branch:** `contrib/tinkl/thoughts-screen`

---

### What Was Built

Replaced the `/thoughts` stub page with a full feature screen for browsing Lee's AI-captured thought stream.

**New files:**

| File | Purpose |
|------|---------|
| `apps/brain/src/lib/queries/thoughts.ts` | Supabase query functions: `getThoughts`, `searchThoughts`, `semanticSearchThoughts`, `deleteThought`, `getThoughtFilterOptions` |
| `apps/brain/src/components/thoughts/ThoughtCard.tsx` | List card using the app's `Card` + `Badge` design system; shows type badge, topic pills, content preview, and date |
| `apps/brain/src/components/thoughts/ThoughtDetail.tsx` | Full-content detail view rendered inside `DetailPanel`; shows all metadata fields (type, topics, people, sentiment, action items, source, captured-at) |
| `apps/brain/src/components/thoughts/ThoughtSearch.tsx` | Debounced (400ms) search input matching the `ActionSearch` UX pattern |
| `apps/brain/src/app/thoughts/page.tsx` | Full screen: stats row, search, type/topic/person filter pills, paginated thought list, detail panel, owner-only delete |

**No files modified** — Nav.tsx and AuthGuard.tsx already have `/thoughts` correctly wired as owner-only.

**No schema changes** — thoughts table untouched.

---

### Deviations from Spec

The spec file `docs/specs/3.0-s3b-thoughts-screen.md` did not exist at build time. The screen was built by deriving requirements from:
- The instruction prompt
- `docs/specs/3.0-s1-app-shell-auth.md`, `3.0-s2-shared-components.md`, `3.0-s3-actions-screen.md`
- `dashboards/thought-explorer/` (ThoughtCard logic, filter patterns, API query patterns)

**Semantic search not wired in v1 UI:** `semanticSearchThoughts` (calls `match_thoughts` RPC) is implemented in `thoughts.ts` but the page uses text search only (ilike). This matches the existing `ActionSearch` pattern and keeps the search UX simple. Semantic search is ready to wire in — e.g., as a fallback when ilike returns 0 results.

**This-week stat is approximate:** The stat row counts "this week" from the current loaded page of thoughts (up to 25), not the full database. A dedicated stats query could be added if accuracy matters.

**No FAB / create flow:** Thoughts are agent-generated; no UI for manual creation.

**No heatmap / calendar views:** The thought-explorer has these visualizations. They are out of scope for this sprint.

---

### Needs Manual Verification

1. **`match_thoughts` RPC signature** — The query call uses `{ query_text, match_threshold, match_count }`. Confirm this matches the live Supabase function signature. If the param names differ (e.g., `query_embedding` instead of `query_text`), update `semanticSearchThoughts` in `thoughts.ts`.

2. **RLS policy on thoughts table** — The browser client is used (anon key + RLS). Confirm that Lee's user has a policy allowing `SELECT` on the thoughts table scoped to `user_id = auth.uid()`. If thoughts lack `user_id` values, a service-role call may be needed.

3. **`metadata->topics` / `metadata->people` containment filter** — The `getThoughts` filter uses `.contains("metadata->topics", JSON.stringify([topic]))`. Verify this returns correct results against real data; JSONB containment syntax can vary.

4. **Owner-only redirect** — Navigate to `/thoughts` while signed in as a member-role user and confirm redirect to `/`.

5. **Delete permission** — Confirm an RLS `DELETE` policy exists for the thoughts table scoped to `user_id = auth.uid()`.
