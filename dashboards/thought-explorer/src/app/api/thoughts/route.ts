import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PAGE_SIZE = 25;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "0", 10);
  const type = searchParams.get("type");
  const topic = searchParams.get("topic");
  const person = searchParams.get("person");
  const search = searchParams.get("search");
  const days = searchParams.get("days");
  const mode = searchParams.get("mode"); // "all" for heatmap/stats

  // For heatmap: return all thoughts with just id, created_at, metadata
  if (mode === "dates") {
    const { data, error } = await supabase
      .from("thoughts")
      .select("id, created_at, metadata")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  }

  // For stats
  if (mode === "stats") {
    const { data, error } = await supabase
      .from("thoughts")
      .select("metadata, created_at");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = data.filter(
      (t) => new Date(t.created_at) >= weekAgo
    ).length;

    const topicCounts: Record<string, number> = {};
    const personCounts: Record<string, number> = {};
    for (const t of data) {
      const m = t.metadata as Record<string, unknown> | null;
      if (m?.topics && Array.isArray(m.topics)) {
        for (const topic of m.topics) {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        }
      }
      if (m?.people && Array.isArray(m.people)) {
        for (const person of m.people) {
          personCounts[person] = (personCounts[person] || 0) + 1;
        }
      }
    }

    const topTopic = Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const topPerson = Object.entries(personCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return NextResponse.json({
      stats: { total: data.length, thisWeek, topTopic, topPerson },
    });
  }

  // Build filtered query
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
  if (days) {
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
    query = query.gte("created_at", since.toISOString());
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
