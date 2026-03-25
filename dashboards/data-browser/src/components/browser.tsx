"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { TABLE_GROUPS } from "@/lib/tables";
import { LoginForm } from "@/components/login-form";
import { TableNav } from "@/components/table-nav";
import { DataTable } from "@/components/data-table";

const defaultTable = TABLE_GROUPS[0].tables[0].key;

export default function Browser() {
  const clientRef = useRef(createClient());
  const client = clientRef.current;
  const [session, setSession] = useState<boolean | null>(null);
  const [activeTable, setActiveTable] = useState(defaultTable);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check session on mount
  useEffect(() => {
    client.auth.getSession().then(({ data: { session } }) => {
      setSession(!!session);
    });
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setSession(!!session);
    });
    return () => subscription.unsubscribe();
  }, [client]);

  // Fetch table data via server-side API route (bypasses RLS, scoped to auth user)
  const fetchData = useCallback(
    async (table: string, p: number) => {
      setLoading(true);
      setError(null);

      try {
        const { data: { session } } = await client.auth.getSession();
        const token = session?.access_token;
        if (!token) {
          setError("No active session");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/table?table=${table}&page=${p}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();

        if (!res.ok) {
          setError(json.error || "Failed to fetch");
          setData([]);
          setTotalCount(0);
        } else {
          setData(json.data || []);
          setTotalCount(json.count || 0);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch");
        setData([]);
        setTotalCount(0);
      }

      setLoading(false);
    },
    [client]
  );

  // Refetch when table or page changes
  useEffect(() => {
    if (session) {
      fetchData(activeTable, page);
    }
  }, [session, activeTable, page, fetchData]);

  function handleSelectTable(tableKey: string) {
    setActiveTable(tableKey);
    setPage(0);
  }

  async function handleSignOut() {
    await client.auth.signOut();
    setSession(false);
  }

  // Still checking session
  if (session === null) {
    return (
      <div className="flex min-h-screen items-center justify-center text-text-muted">
        Loading...
      </div>
    );
  }

  // Not signed in
  if (!session) {
    return <LoginForm client={client} onSuccess={() => setSession(true)} />;
  }

  // Find display name for active table
  const activeLabel =
    TABLE_GROUPS.flatMap((g) => g.tables).find((t) => t.key === activeTable)
      ?.label || activeTable;

  return (
    <div className="flex min-h-screen">
      <TableNav activeTable={activeTable} onSelect={handleSelectTable} />

      <main className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">
              {activeLabel}
            </h1>
            <p className="text-xs text-text-muted">{activeTable}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-bg-card"
          >
            Sign out
          </button>
        </div>

        {error && (
          <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <DataTable
          tableName={activeTable}
          data={data}
          totalCount={totalCount}
          page={page}
          onPageChange={setPage}
          loading={loading}
        />
      </main>
    </div>
  );
}
