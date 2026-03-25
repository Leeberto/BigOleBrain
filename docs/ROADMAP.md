# BigOleBrain Feature Roadmap

> Drop this file in your repo root or `docs/`. When working with Claude Code, reference a specific feature by name: `"Build Feature 1.1: Actions table — see docs/ROADMAP.md for the spec."`

---

## Guard rails (applies to every feature)

- Never modify the core `thoughts` table structure. Adding columns is fine; altering or dropping existing ones is not.
- MCP servers must be remote Supabase Edge Functions — no local Node.js servers, no `StdioServerTransport`.
- No credentials or secrets in code. Use Supabase environment variables (`Deno.env.get()`).
- Follow the existing Edge Function pattern in `supabase/functions/open-brain-mcp/index.ts`: Hono app, `StreamableHTTPTransport`, `x-brain-key` or `?key=` auth.
- Every new table needs a `README.md` + `metadata.json` in its subfolder per `CONTRIBUTING.md`.
- Dashboards use Next.js + Tailwind, deployed to Vercel. See `dashboards/data-browser/` for the template.
- SQL files must never contain `DROP TABLE`, `DROP DATABASE`, `TRUNCATE`, or unqualified `DELETE FROM`.

---

## Phase 1: Close the loops

### Feature 1.1: Actions table

**Category:** `schemas/actions` + MCP tool additions to `supabase/functions/open-brain-mcp/index.ts`

**What to build:**

A separate `actions` table for trackable work items extracted from thoughts. The current system stores action items as metadata inside the `thoughts` table JSONB — they can't be updated, completed, or queried independently.

**Schema (`schemas/actions/schema.sql`):**

```sql
create table actions (
  id uuid primary key default gen_random_uuid(),
  thought_id uuid references thoughts(id) on delete set null,
  content text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'done', 'cancelled')),
  due_date date,
  completed_at timestamptz,
  completion_note text,
  blocked_by text,
  unblocks text,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_actions_status on actions(status);
create index idx_actions_due_date on actions(due_date);
create index idx_actions_thought_id on actions(thought_id);

-- Auto-update updated_at
create or replace function update_actions_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger actions_updated_at
  before update on actions
  for each row execute function update_actions_timestamp();
```

**MCP tools to add to `open-brain-mcp/index.ts`:**

| Tool | Params | Description |
|------|--------|-------------|
| `create_action` | `content`, `due_date?`, `tags?`, `thought_id?`, `blocked_by?`, `unblocks?` | Create a new action. If `thought_id` provided, links to source thought. |
| `update_action` | `id`, `status?`, `due_date?`, `blocked_by?`, `unblocks?`, `tags?` | Update any mutable field. |
| `complete_action` | `id`, `completion_note` | Sets status=done, completed_at=now(). `completion_note` is required — must include what was done, who was unblocked, and what deadline was met. |
| `list_actions` | `status?`, `days?`, `tag?`, `limit?` | List actions filtered by status, recency, or tag. Default: open actions sorted by due_date nulls last. |
| `search_actions` | `query`, `limit?` | Full-text search across action content and completion notes. |

**Key decisions:**
- `thought_id` is nullable — actions can exist independently (captured directly) or linked to a source thought.
- `completion_note` is required on `complete_action` — this is deliberate. Logging completions with date, context, who was unblocked, and what deadline was met keeps the brain clean.
- No embedding column on actions — they're short, structured, and queried by status/date, not semantically.

**Test prompts after deploy:**
```
Create an action: Schedule call with Integrity Air for HVAC ductwork repair. Tag: home, mold-remediation. Due: next Friday.

List my open actions.

Complete action [id]: Called Integrity Air, scheduled inspection for April 2. Unblocks Breathe Easy starting crawl space work.
```

---

### Feature 1.2: Thought visualization dashboard

**Category:** `dashboards/thought-explorer`

**What to build:**

Next.js dashboard showing all thoughts with multiple view modes. Clone `dashboards/data-browser/` as the starting skeleton.

**Views:**

1. **Timeline view** (default): Reverse-chronological list of thoughts. Each card shows content, type badge, topic tags, people mentioned, and timestamp. Click to expand full content + metadata.

2. **Activity heatmap**: GitHub-style contribution grid. X-axis = weeks, Y-axis = days. Cell color intensity = number of thoughts captured that day. Hovering a cell shows the count and date.

3. **Topic clusters**: Group thoughts by their primary topic tag. Show each cluster as a card with count badge. Click a cluster to filter the timeline to that topic.

**Shared components:**
- Filter bar: type dropdown, topic autocomplete, person autocomplete, date range picker.
- Search bar: hits the `match_thoughts` RPC for semantic search. Debounced 300ms.
- Stats header: total thoughts, thoughts this week, most active topic, most mentioned person.

**Data access:**
- Use Supabase JS client with the anon key.
- Direct table queries for listing/filtering.
- `match_thoughts` RPC for semantic search.
- No RLS needed yet (single user) — add in Phase 2.

**Stack:**
- Next.js 14 App Router
- Tailwind CSS
- `@supabase/supabase-js`
- `recharts` for the heatmap (or a simple CSS grid — your call)
- Deploy to Vercel

**File structure:**
```
dashboards/thought-explorer/
├── README.md
├── metadata.json
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Timeline view (default)
│   │   ├── heatmap/page.tsx
│   │   └── topics/page.tsx
│   ├── components/
│   │   ├── ThoughtCard.tsx
│   │   ├── FilterBar.tsx
│   │   ├── SearchBar.tsx
│   │   ├── StatsHeader.tsx
│   │   ├── Heatmap.tsx
│   │   └── TopicClusters.tsx
│   └── lib/
│       └── supabase.ts
```

---

### Feature 1.3: Calendar view

**Category:** Extends `dashboards/thought-explorer` — add as a route.

**What to build:**

A unified date-based view that pulls from multiple tables onto one calendar.

**Data sources:**

| Source | Table | Date field | Display |
|--------|-------|------------|---------|
| Thoughts | `thoughts` | `created_at` | Gray dot |
| Actions | `actions` | `due_date` | Colored by status: blue=open, amber=in_progress, green=done |
| Family activities | `activities` | `date` or `day_of_week` for recurring | Purple dot |
| Important dates | `important_dates` | `date` | Red dot |
| Maintenance tasks | `maintenance_tasks` | `next_due` | Coral dot |

**Layout:**
- Monthly grid (default) with dot indicators per day.
- Click a day to expand into a detail panel showing all items for that date.
- Week view toggle showing hour-by-hour layout.
- Legend bar at top mapping colors to sources.

**Route:** `dashboards/thought-explorer/src/app/calendar/page.tsx`

**New components:**
- `CalendarGrid.tsx` — monthly view with dots
- `DayDetail.tsx` — expanded single-day panel
- `WeekView.tsx` — horizontal weekly layout

---

## Phase 2: Liv's access

### Feature 2.1: Multi-user auth + household_id

**Category:** `primitives/` update + schema migration

**What to build:**

Migrate from single-user to two-user system. One shared household, separate accounts.

**Migration steps:**

1. Add `user_id uuid references auth.users(id)` and `household_id uuid` columns to:
   - `thoughts` (user_id only — thoughts are personal)
   - `actions` (user_id only — actions are personal)
   - `recipes`, `meal_plans`, `shopping_lists` (both — shared by household)
   - `family_members`, `activities`, `important_dates` (household_id only — shared)
   - `maintenance_tasks`, `maintenance_log` (household_id only — shared)
   - `household_items`, `vendors` (household_id only — shared)

2. Create a `households` table:
```sql
create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Home',
  created_at timestamptz default now()
);

create table household_members (
  household_id uuid references households(id),
  user_id uuid references auth.users(id),
  role text not null default 'member' check (role in ('owner', 'member')),
  primary key (household_id, user_id)
);
```

3. Create Supabase Auth users for Lee (owner) and Liv (member).

4. Backfill: Set `user_id` and `household_id` on all existing rows.

5. Enable RLS on all tables. Policies:
   - Personal tables (thoughts, actions): `auth.uid() = user_id`
   - Shared tables: `household_id in (select household_id from household_members where user_id = auth.uid())`

**Key decision:** Start with shared household data. The clean migration path (add column, backfill, enable RLS) means no data loss and no breaking change to existing MCP tools — they just need to start passing user context.

**MCP server changes:**
- Edge Functions need to accept a JWT or user token instead of (or in addition to) the static `MCP_ACCESS_KEY`.
- The anon key + RLS approach means queries automatically scope to the right user.
- Existing `service_role` calls bypass RLS — gradually migrate these to user-scoped queries.

---

### Feature 2.2: Liv's dashboard

**Category:** `dashboards/household-hub`

**What to build:**

A separate Next.js app (or auth-gated routes in the existing dashboard) scoped to Liv's access level.

**Views Liv gets:**
- Family calendar (read/write activities and important dates)
- Meal plans (read/write recipes and meal plans)
- Shopping list (view + mark items purchased)
- Home maintenance schedule (read upcoming tasks, log completions)
- Household knowledge (read/search items and vendors)

**Views Liv does NOT get:**
- Thoughts (Lee's personal captures)
- Actions (Lee's personal task tracking)
- Thought visualization, heatmap, topic clusters

**Auth flow:**
- Supabase Auth email/password login
- Auth state managed via `@supabase/auth-helpers-nextjs`
- Middleware checks auth and redirects to login if needed
- RLS handles data scoping — no additional filtering in app code

**Stack:** Same as Feature 1.2. Can be a separate Vercel project or routes within the same app gated by user role.

---

### Feature 2.3: Shopping list → Instacart export

**Category:** `recipes/instacart-export`

**What to build:**

Export the `shopping_lists` table into a format that works with Instacart. Two options — build option A first.

**Option A: Clipboard export (build this first)**

MCP tool `export_shopping_list` that:
1. Queries `shopping_lists` for a given week, joins to `recipes` for ingredient details.
2. Aggregates duplicate ingredients (2 recipes both need chicken → one line item with combined quantity).
3. Groups by category (produce, protein, dairy, pantry, etc.) — derive from ingredient names or add a `category` field to the recipe ingredients JSONB.
4. Returns a formatted text block that can be pasted into Instacart's search or any grocery app.

**Option B: Instacart deep links (future)**

Instacart supports URLs like `https://www.instacart.com/store/search_v3/[item]`. Generate a list of links, one per ingredient. This is fragile (URL scheme may change) but convenient.

**Output format for Option A:**
```
🛒 Shopping List — Week of March 24

PRODUCE
- Broccoli, 4 cups
- Bell peppers, 2 cups
- Onion, 1 large

PROTEIN
- Chicken breast, 2 lbs

PANTRY
- Soy sauce, 6 tbsp
- Olive oil, 4 tbsp
```

---

## Phase 3: Proactive brain

### Feature 3.1: Alerting / reminders

**Category:** `integrations/alerting`

**What to build:**

A Supabase Edge Function triggered by `pg_cron` that scans for upcoming items and sends notifications.

**Scan targets:**
- `actions` where `status = 'open'` and `due_date` is within N days
- `important_dates` where `date` is within N days
- `maintenance_tasks` where `next_due` is within N days
- `thoughts` where `metadata->>'dates_mentioned'` contains dates within N days

**Notification channels (pick one to start, add others later):**
- Email via Resend (simplest — free tier, no phone number needed)
- Alternatively: Telegram message via existing bot integration in `ingest-thought`

**Configuration:**
```sql
create table alert_preferences (
  user_id uuid primary key references auth.users(id),
  channels text[] default '{"email"}',
  thresholds_days int[] default '{1, 3, 7}',
  digest_time time default '07:00',
  enabled boolean default true
);
```

**Edge Function: `integrations/alerting/index.ts`**
- Runs daily at `digest_time` via `pg_cron`.
- Queries all scan targets for items due within the max threshold.
- Groups by urgency tier (due today, due in 3 days, due this week).
- Formats and sends via configured channel.

**Cron setup (SQL):**
```sql
select cron.schedule(
  'daily-alerts',
  '0 7 * * *',  -- 7 AM daily
  $$select net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/alerting',
    headers := '{"x-brain-key": "YOUR_KEY"}'::jsonb
  )$$
);
```

---

### Feature 3.2: Stale loop detector

**Category:** MCP tool addition to `open-brain-mcp/index.ts`

**What to build:**

A new MCP tool `detect_stale_loops` that surfaces action items and questions going cold.

**Logic:**
1. Query `actions` where `status = 'open'` and `created_at < now() - interval 'N days'` (default N=14).
2. For each stale action, search `thoughts` for any captures mentioning the same topics/people since the action was created. If none found → truly stale. If found → the user is thinking about it but hasn't closed the loop.
3. Query `thoughts` where `metadata->>'type' = 'question'` and `created_at < now() - interval 'N days'` with no subsequent thought on the same topic.

**MCP tool:**

| Tool | Params | Description |
|------|--------|-------------|
| `detect_stale_loops` | `days?` (default 14), `limit?` (default 20) | Returns stale actions and unanswered questions with context on last related activity. |

**Output format:**
```
3 stale loops detected (>14 days):

1. [Action, 18 days old] "Schedule call with Integrity Air for HVAC ductwork"
   Last related capture: 12 days ago (mold remediation update)
   → Still active in your thinking but no action taken

2. [Question, 21 days old] "What's the Litmus digital twin answer for Matt?"
   No related captures since original
   → Completely cold — needs attention or cancellation

3. [Action, 16 days old] "Get Fabriq demo scheduled with Ingrid"
   Last related capture: 3 days ago (Fabriq NA planning note)
   → Active topic, but this specific action hasn't moved
```

---

### Feature 3.3: Morning briefing agent

**Category:** `integrations/morning-briefing`

**What to build:**

Automated version of the daily prioritization prompt. **Build this AFTER you've validated the manual daily review process.** The value of this feature comes from encoding what you've learned works — not from automating the first draft.

**Architecture:**
- Supabase Edge Function triggered by `pg_cron` at your preferred morning time.
- Calls the same MCP tools the daily review uses: `list_thoughts` (type=action_item, days=1), `search_thoughts` (deadlines, blockers), `list_actions` (status=open).
- Also fetches today's Google Calendar events (requires OAuth token storage or a calendar sync integration).
- Sends the raw data to an LLM (via OpenRouter) with the daily prioritization prompt from `docs/Daily_Prioritization_Prompt.md`.
- Delivers the formatted output via email or Telegram.

**Why this is Phase 3, not Phase 1:**
You explicitly chose to keep running the manual daily review first to validate what's worth automating. This feature should encode the patterns you discover, not replace the discovery process.

**Prerequisite features:** 1.1 (actions table), 3.1 (alerting infra for delivery), and several weeks of manual daily reviews to calibrate the prompt.

---

## Phase 4: Brain intelligence

### Feature 4.1: Thought graph / connection map

**Category:** `dashboards/thought-explorer` — add as a route

**What to build:**

Force-directed graph visualization where each node is a thought and edges connect semantically similar thoughts.

**Data pipeline:**
1. Fetch all thoughts with their embeddings.
2. Compute pairwise cosine similarity (can do this in Postgres with pgvector or client-side for <1000 thoughts).
3. Create edges only where similarity > 0.75 (configurable threshold).
4. Color nodes by type. Size nodes by connection count.

**Library:** D3 force layout (`d3-force`).

**Interactions:**
- Hover a node: highlight its connections, dim everything else.
- Click a node: show thought content in a side panel + list connected thoughts.
- Drag to rearrange. Zoom/pan.
- Filter by type/topic/date range — same filter bar as Feature 1.2.

**Route:** `dashboards/thought-explorer/src/app/graph/page.tsx`

**Performance note:** For >500 thoughts, compute similarity server-side and cache the edge list. Add an RPC function:

```sql
create or replace function thought_graph(similarity_threshold float default 0.75)
returns table(source_id uuid, target_id uuid, similarity float) as $$
  select a.id, b.id, 1 - (a.embedding <=> b.embedding) as sim
  from thoughts a, thoughts b
  where a.id < b.id
    and 1 - (a.embedding <=> b.embedding) > similarity_threshold
  order by sim desc
  limit 500;
$$ language sql;
```

---

### Feature 4.2: Weekly trend analysis

**Category:** MCP tool addition to `open-brain-mcp/index.ts`

**What to build:**

Replace LLM guesswork in the weekly review's "pattern detection" section with computed metrics.

**MCP tool:**

| Tool | Params | Description |
|------|--------|-------------|
| `weekly_trends` | `weeks_back?` (default 4) | Compares this week's thought distribution against previous weeks. |

**Metrics computed:**
- **Topic velocity:** Topics that appeared this week but not last week (new), topics with increasing capture frequency (growing), topics present last week but absent this week (dropped).
- **Type distribution shift:** % of thoughts by type this week vs 4-week average. Flags if action_items spiked or questions dropped.
- **People frequency:** Who appeared more/less this week vs trailing average.
- **Sentiment trend:** Average sentiment score this week vs previous weeks.
- **Capture cadence:** Thoughts per day this week vs average. Flags days with zero captures.

**Output format:**
```
Weekly Trends (March 17-23 vs 4-week average)

GROWING: mold-remediation (5 captures, +3 vs avg), Fabriq (3, +2)
NEW THIS WEEK: Cody, consulting-transition
DROPPED: PDCS-2.0 (0 captures, avg was 2), MDM (0, avg 1.5)

TYPE SHIFT: action_items up 40% vs avg, questions down 25%
CAPTURE CADENCE: 4.1/day (avg 3.2) — no zero days this week
PEOPLE: Alexis (6 mentions, +3), Matt V (4, +2), Ingrid (0, was 2)
```

---

### Feature 4.3: Capture source expansion

**Category:** `integrations/`

**What to build (in priority order):**

1. **Quick capture PWA** (`integrations/quick-capture/`)
   - Single-page web app: one text field, one submit button.
   - Hits the `ingest-thought` Edge Function directly (same endpoint Telegram uses, minus the Telegram-specific parts — add an HTTP POST handler).
   - Install as PWA on phone for home-screen access.
   - Useful when away from Claude.

2. **Voice memo capture** (`integrations/voice-capture/`)
   - Audio file → Whisper transcription → `capture_thought`.
   - Could be a Telegram voice message handler (extend `ingest-thought`) or a standalone endpoint.

3. **Browser extension** (`integrations/browser-capture/`)
   - Highlight text on any page → right-click → "Capture to Open Brain".
   - Sends highlighted text + page URL + title as thought content.
   - Chrome extension with a simple popup for adding context before capture.

**Note:** Slack and Discord capture integrations already exist in the repo under `integrations/`.

---

## Build order recommendation

If working through these with Claude Code, this sequence maximizes compounding:

```
1.1  Actions table          ← everything else builds on this
1.2  Thought explorer        ← you'll want to see your data
1.3  Calendar view           ← extends 1.2
2.1  Multi-user auth         ← required before Liv gets access
2.2  Liv's dashboard         ← requires 2.1
2.3  Instacart export        ← standalone, can do anytime after meal-planning exists
3.2  Stale loop detector     ← quick win, just a query tool
3.1  Alerting                ← infra for 3.3
3.3  Morning briefing        ← only after manual process is validated
4.2  Weekly trends           ← improves weekly review immediately
4.1  Thought graph           ← coolest but least urgent
4.3  Capture sources         ← modular, do whenever
```

---

## How to use this with Claude Code

Reference a specific feature when starting a session:

```bash
claude "Build Feature 1.1: Actions table. Read docs/ROADMAP.md for the full spec. Follow the guard rails in CLAUDE.md."
```

Or for a multi-step session:

```bash
claude "I'm working through the BigOleBrain roadmap. Next up is Feature 1.2: Thought visualization dashboard. Read docs/ROADMAP.md for the spec, clone dashboards/data-browser as the starting skeleton, and build it out."
```

Each feature spec includes enough detail for Claude Code to produce a working implementation without ambiguity. If a spec says "your call" on a decision, it means both options work — pick one and move.
