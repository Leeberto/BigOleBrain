/**
 * Shared stale-loop detection logic.
 * Used by both the `detect_stale_loops` MCP tool and the `stale_loop_scan` task runner handler.
 */

import type { SupabaseClient } from "npm:@supabase/supabase-js";

// ── Constants ─────────────────────────────────

const MS_PER_DAY = 86_400_000;
const MATCH_THRESHOLD = 0.5;
const MATCH_COUNT = 5;
const SNIPPET_MAX_LENGTH = 60;
const CONTENT_PREVIEW_MAX_LENGTH = 80;

// ── Types ──────────────────────────────────────

export interface StaleItem {
  kind: "Action" | "Question";
  content: string;
  created_at: string;
  ageDays: number;
  lastRelated: { daysAgo: number; snippet: string } | null;
}

export interface StaleLoopOptions {
  days: number;
  limit: number;
}

// ── Internal helpers ──────────────────────────

/**
 * For a single stale item, find the most recent semantically related thought
 * created after the item itself. Returns null if no related activity found.
 */
async function findLastRelatedActivity(
  supabase: SupabaseClient,
  getEmbedding: (text: string) => Promise<number[]>,
  item: { id?: string; content: string; created_at: string },
  now: Date
): Promise<StaleItem["lastRelated"]> {
  const embedding = await getEmbedding(item.content);
  const { data: matches } = await supabase.rpc("match_thoughts", {
    query_embedding: embedding,
    match_threshold: MATCH_THRESHOLD,
    match_count: MATCH_COUNT,
    filter: {},
  });

  if (!matches?.length) return null;

  const related = matches
    .filter(
      (t: { id: string; created_at: string }) =>
        (!item.id || t.id !== item.id) &&
        new Date(t.created_at) > new Date(item.created_at)
    )
    .sort(
      (a: { created_at: string }, b: { created_at: string }) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  if (related.length === 0) return null;

  const newest = related[0];
  const daysAgo = Math.floor(
    (now.getTime() - new Date(newest.created_at).getTime()) / MS_PER_DAY
  );
  const snippet =
    newest.content.length > SNIPPET_MAX_LENGTH
      ? newest.content.slice(0, SNIPPET_MAX_LENGTH).trim() + "..."
      : newest.content;

  return { daysAgo, snippet };
}

/**
 * Check a single stale row and return a StaleItem with related-activity context.
 */
async function checkStaleItem(
  supabase: SupabaseClient,
  getEmbedding: (text: string) => Promise<number[]>,
  row: { id: string; content: string; created_at: string },
  kind: "Action" | "Question",
  now: Date
): Promise<StaleItem> {
  const ageDays = Math.floor(
    (now.getTime() - new Date(row.created_at).getTime()) / MS_PER_DAY
  );

  let lastRelated: StaleItem["lastRelated"] = null;
  try {
    lastRelated = await findLastRelatedActivity(
      supabase,
      getEmbedding,
      kind === "Question" ? row : { content: row.content, created_at: row.created_at },
      now
    );
  } catch (err) {
    console.warn(`Embedding/RPC failed for ${kind} "${row.content.slice(0, 40)}...":`, err);
  }

  return {
    kind,
    content: row.content,
    created_at: row.created_at,
    ageDays,
    lastRelated,
  };
}

// ── Detection ──────────────────────────────────

export async function detectStaleLoops(
  supabase: SupabaseClient,
  getEmbedding: (text: string) => Promise<number[]>,
  options: StaleLoopOptions
): Promise<StaleItem[]> {
  const { days, limit } = options;
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);

  // Phase A: Stale open actions
  const { data: staleActions, error: actionsErr } = await supabase
    .from("actions")
    .select("id, content, created_at")
    .eq("status", "open")
    .lte("created_at", cutoff.toISOString())
    .order("created_at", { ascending: true })
    .limit(limit);

  if (actionsErr) {
    throw new Error(`Error querying actions: ${actionsErr.message}`);
  }

  // Phase B: Stale questions
  const { data: staleQuestions, error: questionsErr } = await supabase
    .from("thoughts")
    .select("id, content, created_at, metadata")
    .contains("metadata", { type: "question" })
    .lte("created_at", cutoff.toISOString())
    .order("created_at", { ascending: true })
    .limit(limit);

  if (questionsErr) {
    throw new Error(`Error querying questions: ${questionsErr.message}`);
  }

  if (!staleActions?.length && !staleQuestions?.length) {
    return [];
  }

  // Phase C: Check each item for related thought activity concurrently
  const actionItems = (staleActions ?? []).map((row) =>
    checkStaleItem(supabase, getEmbedding, row, "Action", now)
  );
  const questionItems = (staleQuestions ?? []).map((row) =>
    checkStaleItem(supabase, getEmbedding, row, "Question", now)
  );

  const items = await Promise.all([...actionItems, ...questionItems]);

  // Sort by age descending so oldest items surface first
  items.sort((a, b) => b.ageDays - a.ageDays);

  return items;
}

// ── Formatting ─────────────────────────────────

export function formatStaleLoopsOutput(items: StaleItem[], days: number): string {
  if (items.length === 0) {
    return `No stale loops detected (>${days} days). Everything looks current!`;
  }

  const lines: string[] = [`${items.length} stale loop(s) detected (>${days} days):\n`];

  items.forEach((item, i) => {
    const contentPreview =
      item.content.length > CONTENT_PREVIEW_MAX_LENGTH
        ? item.content.slice(0, CONTENT_PREVIEW_MAX_LENGTH).trim() + "..."
        : item.content;

    lines.push(`${i + 1}. [${item.kind}, ${item.ageDays} days old] "${contentPreview}"`);

    if (item.lastRelated) {
      lines.push(
        `   Last related capture: ${item.lastRelated.daysAgo} days ago (${item.lastRelated.snippet})`
      );
      if (item.lastRelated.daysAgo <= days / 2) {
        lines.push(
          `   \u2192 Still active in your thinking but no action taken`
        );
      } else {
        lines.push(
          `   \u2192 Active topic, but this specific ${item.kind.toLowerCase()} hasn't moved`
        );
      }
    } else {
      lines.push(`   No related captures since original`);
      lines.push(
        `   \u2192 Completely cold \u2014 needs attention or cancellation`
      );
    }

    lines.push("");
  });

  return lines.join("\n");
}
