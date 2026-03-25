import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { TABLE_GROUPS, PAGE_SIZE, HIDDEN_COLUMNS } from "@/lib/tables";

const VALID_TABLES = new Set(
  TABLE_GROUPS.flatMap((g) => g.tables.map((t) => t.key))
);

export async function GET(req: NextRequest) {
  const table = req.nextUrl.searchParams.get("table");
  const page = parseInt(req.nextUrl.searchParams.get("page") || "0", 10);

  if (!table || !VALID_TABLES.has(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  // Verify the caller has a valid session (anon key auth check)
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user } } = await anonClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use service role to bypass RLS and query for this user's data
  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Tables without a user_id column (core tables)
  const NO_USER_ID = new Set(["thoughts"]);

  let data: Record<string, unknown>[] | null = null;
  let count: number | null = null;

  // Build base query
  let query = serviceClient
    .from(table)
    .select("*", { count: "exact" });

  if (!NO_USER_ID.has(table)) {
    query = query.eq("user_id", user.id);
  }

  // Try with created_at ordering
  const result = await query
    .range(from, to)
    .order("created_at", { ascending: false });

  if (result.error) {
    // Retry without ordering (table may lack created_at)
    let retryQuery = serviceClient
      .from(table)
      .select("*", { count: "exact" });

    if (!NO_USER_ID.has(table)) {
      retryQuery = retryQuery.eq("user_id", user.id);
    }

    const retry = await retryQuery.range(from, to);

    if (retry.error) {
      return NextResponse.json({ error: retry.error.message }, { status: 500 });
    }
    data = retry.data;
    count = retry.count;
  } else {
    data = result.data;
    count = result.count;
  }

  // Strip hidden columns server-side
  const cleaned = (data || []).map((row: Record<string, unknown>) => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) {
      if (!HIDDEN_COLUMNS.includes(k)) out[k] = v;
    }
    return out;
  });

  return NextResponse.json({ data: cleaned, count: count || 0 });
}
