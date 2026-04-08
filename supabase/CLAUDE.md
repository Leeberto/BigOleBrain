# supabase Guidance

This folder holds backend runtime code for Open Brain:

- Edge Functions
- migrations
- shared backend helpers

Rules:

- MCP servers must be remote Supabase Edge Functions.
- Follow existing patterns in `supabase/functions/` before inventing new structure.
- Do not introduce local stdio MCP server patterns.
- Be conservative with schema changes, especially around the core `thoughts` table.
