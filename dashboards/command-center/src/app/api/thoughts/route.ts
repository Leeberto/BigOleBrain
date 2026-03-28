import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PAGE_SIZE = 25;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");
  const page = parseInt(searchParams.get("page") || "0", 10);
  const type = searchParams.get("type");
  const topic = searchParams.get("topic");
  const person = searchParams.get("person");
  const search = searchParams.get("search");

  // Unprocessed thoughts: action_item/question type, last 48h, no linked action
  if (mode === "unprocessed") {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 48);

    const { data: thoughts, error: tErr } = await supabase
      .from("thoughts")
      .select("id, content, metadata, created_at, updated_at")
      .gte("created_at", cutoff.toISOString())
      .order("created_at", { ascending: false });

    if (tErr) {
      return NextResponse.json({ error: tErr.message }, { status: 500 });
    }

    if (!thoughts || thoughts.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Filter to action_item or question types
    const actionable = thoughts.filter((t) => {
      const meta = t.metadata as Record<string, unknown> | null;
      const tp = (meta?.type as string)?.toLowerCase();
      return tp === "action_item" || tp === "question";
    });

    if (actionable.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Exclude thoughts that already have a linked action
    const thoughtIds = actionable.map((t) => t.id);
    const { data: linkedActions } = await supabase
      .from("actions")
      .select("thought_id")
      .in("thought_id", thoughtIds);

    const linkedIds = new Set(
      (linkedActions ?? []).map((a: { thought_id: string }) => a.thought_id)
    );
    const unprocessed = actionable.filter((t) => !linkedIds.has(t.id));

    return NextResponse.json({ data: unprocessed });
  }

  // Feed mode: paginated reverse-chronological with filters
  let query = supabase
    .from("thoughts")
    .select("id, content, metadata, created_at, updated_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (type) {
    query = query.eq("metadata->>type", type);
  }
  if (topic) {
    query = query.contains("metadata->topics", JSON.stringify([topic]));
  }
  if (person) {
    query = query.contains("metadata->people", JSON.stringify([person]));
  }
  if (search) {
    query = query.ilike("content", `%${search}%`);
  }

  const offset = page * PAGE_SIZE;
  query = query.range(offset, offset + PAGE_SIZE - 1);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, count });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { content } = body;

  if (!content) {
    return NextResponse.json({ error: "content required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("thoughts")
    .insert({
      content,
      metadata: { type: "note", source: "command-center" },
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
