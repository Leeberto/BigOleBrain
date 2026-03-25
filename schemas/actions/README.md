# Actions Schema

Trackable work items that can be extracted from thoughts or captured directly. Part of Phase 1 (Close the loops) in the BigOleBrain roadmap.

## Why

The core `thoughts` table stores action items as metadata inside JSONB — they can't be updated, completed, or queried independently. This schema creates a separate `actions` table for proper lifecycle tracking.

## Schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `thought_id` | uuid (nullable) | Links to source thought, if extracted from one |
| `content` | text | What needs to be done |
| `status` | text | `open`, `in_progress`, `done`, or `cancelled` |
| `due_date` | date | Optional deadline |
| `completed_at` | timestamptz | Set automatically when completed |
| `completion_note` | text | Required context on what was done |
| `blocked_by` | text | What's blocking this action |
| `unblocks` | text | What this action unblocks |
| `tags` | text[] | Categorization tags |
| `created_at` | timestamptz | Auto-set on insert |
| `updated_at` | timestamptz | Auto-updated via trigger |

## Setup

Run `schema.sql` in your Supabase SQL Editor.

## MCP Tools

Five tools are added to `open-brain-mcp`: `create_action`, `update_action`, `complete_action`, `list_actions`, `search_actions`.
