import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STALE_THRESHOLD_DAYS = 14;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");

  const today = new Date().toISOString().split("T")[0];

  if (mode === "overdue") {
    const { data, error } = await supabase
      .from("actions")
      .select("*")
      .in("status", ["open", "in_progress"])
      .not("due_date", "is", null)
      .lt("due_date", today)
      .order("due_date", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (mode === "today") {
    const { data, error } = await supabase
      .from("actions")
      .select("*")
      .in("status", ["open", "in_progress"])
      .eq("due_date", today)
      .order("status", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (mode === "week") {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);

    const { data, error } = await supabase
      .from("actions")
      .select("*")
      .in("status", ["open", "in_progress"])
      .gte("due_date", tomorrow.toISOString().split("T")[0])
      .lte("due_date", weekEnd.toISOString().split("T")[0])
      .order("due_date", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (mode === "stale") {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - STALE_THRESHOLD_DAYS);

    const { data, error } = await supabase
      .from("actions")
      .select("*")
      .eq("status", "open")
      .lt("created_at", cutoff.toISOString())
      .order("created_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (mode === "stats") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const staleCutoff = new Date();
    staleCutoff.setDate(staleCutoff.getDate() - STALE_THRESHOLD_DAYS);

    const [openRes, overdueRes, thoughtsRes, staleRes] = await Promise.all([
      supabase
        .from("actions")
        .select("id", { count: "exact", head: true })
        .in("status", ["open", "in_progress"]),
      supabase
        .from("actions")
        .select("id", { count: "exact", head: true })
        .in("status", ["open", "in_progress"])
        .not("due_date", "is", null)
        .lt("due_date", today),
      supabase
        .from("thoughts")
        .select("id", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString()),
      supabase
        .from("actions")
        .select("id", { count: "exact", head: true })
        .eq("status", "open")
        .lt("created_at", staleCutoff.toISOString()),
    ]);

    return NextResponse.json({
      stats: {
        openActions: openRes.count ?? 0,
        overdueActions: overdueRes.count ?? 0,
        thoughtsThisWeek: thoughtsRes.count ?? 0,
        staleLoops: staleRes.count ?? 0,
      },
    });
  }

  // Default: all actions
  const { data, error } = await supabase
    .from("actions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status, completion_note, due_date } = body;

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (due_date) updates.due_date = due_date;
  if (status === "done") {
    updates.completed_at = new Date().toISOString();
    if (completion_note) updates.completion_note = completion_note;
  }

  const { data, error } = await supabase
    .from("actions")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Auto-spawn next recurring instance
  let spawned = null;
  if (status === "done" && data.recurrence) {
    const nextDue = calculateNextDue(data.due_date, data.recurrence);
    const { data: newAction, error: spawnErr } = await supabase
      .from("actions")
      .insert({
        content: data.content,
        status: "open",
        due_date: nextDue,
        recurrence: data.recurrence,
        recurrence_source_id: data.id,
        tags: data.tags,
      })
      .select("*")
      .single();

    if (!spawnErr) spawned = newAction;
  }

  return NextResponse.json({ data, spawned });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { content, due_date, thought_id, tags } = body;

  if (!content) {
    return NextResponse.json({ error: "content required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("actions")
    .insert({
      content,
      status: "open",
      due_date: due_date || null,
      thought_id: thought_id || null,
      tags: tags || [],
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

function calculateNextDue(currentDue: string | null, recurrence: string): string {
  const base = currentDue ? new Date(currentDue) : new Date();
  switch (recurrence) {
    case "daily":
      base.setDate(base.getDate() + 1);
      break;
    case "weekly":
      base.setDate(base.getDate() + 7);
      break;
    case "monthly":
      base.setMonth(base.getMonth() + 1);
      break;
  }
  return base.toISOString().split("T")[0];
}
