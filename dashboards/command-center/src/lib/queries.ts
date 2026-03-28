import { SupabaseClient } from "@supabase/supabase-js";
import { Action, Thought, CommandCenterStats } from "./types";
import { STALE_THRESHOLD_DAYS } from "./constants";
import { todayDateString, calculateNextDue } from "./utils";

export async function getOverdueActions(
  client: SupabaseClient
): Promise<Action[]> {
  const today = todayDateString();
  const { data, error } = await client
    .from("actions")
    .select("*")
    .in("status", ["open", "in_progress"])
    .not("due_date", "is", null)
    .lt("due_date", today)
    .order("due_date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getActionsDueToday(
  client: SupabaseClient
): Promise<Action[]> {
  const today = todayDateString();
  const { data, error } = await client
    .from("actions")
    .select("*")
    .in("status", ["open", "in_progress"])
    .eq("due_date", today)
    .order("status", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getActionsThisWeek(
  client: SupabaseClient
): Promise<Action[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const { data, error } = await client
    .from("actions")
    .select("*")
    .in("status", ["open", "in_progress"])
    .gte("due_date", tomorrow.toISOString().split("T")[0])
    .lte("due_date", weekEnd.toISOString().split("T")[0])
    .order("due_date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getStaleActions(
  client: SupabaseClient
): Promise<Action[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - STALE_THRESHOLD_DAYS);

  const { data, error } = await client
    .from("actions")
    .select("*")
    .eq("status", "open")
    .lt("created_at", cutoff.toISOString())
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getUnprocessedThoughts(
  client: SupabaseClient
): Promise<Thought[]> {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 48);

  // Get recent action_item/question thoughts
  const { data: thoughts, error: tErr } = await client
    .from("thoughts")
    .select("*")
    .gte("created_at", cutoff.toISOString())
    .order("created_at", { ascending: false });

  if (tErr) throw tErr;
  if (!thoughts || thoughts.length === 0) return [];

  // Filter to action_item or question types
  const actionable = thoughts.filter((t: Thought) => {
    const type = t.metadata?.type?.toLowerCase();
    return type === "action_item" || type === "question";
  });

  if (actionable.length === 0) return [];

  // Get actions linked to these thoughts
  const thoughtIds = actionable.map((t: Thought) => t.id);
  const { data: linkedActions, error: aErr } = await client
    .from("actions")
    .select("thought_id")
    .in("thought_id", thoughtIds);

  if (aErr) throw aErr;

  const linkedIds = new Set((linkedActions ?? []).map((a: { thought_id: string }) => a.thought_id));
  return actionable.filter((t: Thought) => !linkedIds.has(t.id));
}

export async function getStats(
  client: SupabaseClient
): Promise<CommandCenterStats> {
  const today = todayDateString();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const staleCutoff = new Date();
  staleCutoff.setDate(staleCutoff.getDate() - STALE_THRESHOLD_DAYS);

  const [openRes, overdueRes, thoughtsRes, staleRes] = await Promise.all([
    client
      .from("actions")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "in_progress"]),
    client
      .from("actions")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "in_progress"])
      .not("due_date", "is", null)
      .lt("due_date", today),
    client
      .from("thoughts")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString()),
    client
      .from("actions")
      .select("id", { count: "exact", head: true })
      .eq("status", "open")
      .lt("created_at", staleCutoff.toISOString()),
  ]);

  return {
    openActions: openRes.count ?? 0,
    overdueActions: overdueRes.count ?? 0,
    thoughtsThisWeek: thoughtsRes.count ?? 0,
    staleLoops: staleRes.count ?? 0,
  };
}

export async function updateActionStatus(
  client: SupabaseClient,
  id: string,
  status: string,
  completionNote?: string
): Promise<Action> {
  const updates: Record<string, unknown> = { status };
  if (status === "done") {
    updates.completed_at = new Date().toISOString();
    if (completionNote) updates.completion_note = completionNote;
  }

  const { data, error } = await client
    .from("actions")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function spawnNextRecurring(
  client: SupabaseClient,
  action: Action
): Promise<Action | null> {
  if (!action.recurrence) return null;

  const nextDue = calculateNextDue(action.due_date, action.recurrence);
  const { data, error } = await client
    .from("actions")
    .insert({
      content: action.content,
      status: "open",
      due_date: nextDue,
      recurrence: action.recurrence,
      recurrence_source_id: action.id,
      tags: action.tags,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function createActionFromThought(
  client: SupabaseClient,
  thoughtId: string,
  content: string,
  dueDate?: string
): Promise<Action> {
  const { data, error } = await client
    .from("actions")
    .insert({
      content,
      thought_id: thoughtId,
      due_date: dueDate || null,
      status: "open",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function snoozeAction(
  client: SupabaseClient,
  id: string,
  days: number
): Promise<Action> {
  const newDue = new Date();
  newDue.setDate(newDue.getDate() + days);

  const { data, error } = await client
    .from("actions")
    .update({ due_date: newDue.toISOString().split("T")[0] })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function captureQuickThought(
  client: SupabaseClient,
  content: string
): Promise<Thought> {
  const { data, error } = await client
    .from("thoughts")
    .insert({
      content,
      metadata: { type: "note", source: "command-center" },
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function createQuickAction(
  client: SupabaseClient,
  content: string,
  dueDate?: string
): Promise<Action> {
  const { data, error } = await client
    .from("actions")
    .insert({
      content,
      status: "open",
      due_date: dueDate || null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
