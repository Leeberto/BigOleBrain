"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Action, Thought, CalendarItem, CommandCenterStats } from "@/lib/types";
import { SOURCE_COLORS, SOURCE_LABELS } from "@/lib/constants";

import { LoginForm } from "./LoginForm";
import { Header } from "./Header";
import { NavTabs, type View } from "./NavTabs";
import { StatsHeader } from "./StatsHeader";
import { QuickActionBar } from "./QuickActionBar";
import { TodayView } from "./TodayView";
import { CalendarGrid } from "./CalendarGrid";
import { WeekView } from "./WeekView";
import { DayDetail } from "./DayDetail";
import { ThoughtCard } from "./ThoughtCard";
import { FilterBar } from "./FilterBar";
import { SearchBar } from "./SearchBar";
import { ChevronLeft, ChevronRight } from "lucide-react";

async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json;
}

export default function CommandCenter() {
  const clientRef = useRef(createClient());
  const client = clientRef.current;
  const [session, setSession] = useState<boolean | null>(null);
  const [view, setView] = useState<View>("today");

  // Today view state
  const [overdue, setOverdue] = useState<Action[]>([]);
  const [dueToday, setDueToday] = useState<Action[]>([]);
  const [thisWeek, setThisWeek] = useState<Action[]>([]);
  const [unprocessed, setUnprocessed] = useState<Thought[]>([]);
  const [stale, setStale] = useState<Action[]>([]);
  const [stats, setStats] = useState<CommandCenterStats>({
    openActions: 0,
    overdueActions: 0,
    thoughtsThisWeek: 0,
    staleLoops: 0,
  });

  // Calendar state
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1);
  const [calMode, setCalMode] = useState<"month" | "week">("month");
  const [calItems, setCalItems] = useState<CalendarItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().slice(0, 10);
  });

  // Thoughts view state
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [thoughtsCount, setThoughtsCount] = useState(0);
  const [thoughtsPage, setThoughtsPage] = useState(0);
  const [filterType, setFilterType] = useState("");
  const [filterTopic, setFilterTopic] = useState("");
  const [filterPerson, setFilterPerson] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOptions, setFilterOptions] = useState<{
    types: string[];
    topics: string[];
    people: string[];
  }>({ types: [], topics: [], people: [] });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth
  useEffect(() => {
    client.auth.getSession().then(({ data }) => {
      setSession(!!data.session);
    });
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, s) => {
      setSession(!!s);
    });
    return () => subscription.unsubscribe();
  }, [client]);

  // Fetch today data — all via server API routes (service role key bypasses RLS)
  const fetchTodayData = useCallback(async () => {
    try {
      const [odRes, dtRes, twRes, upRes, stRes, ssRes] = await Promise.all([
        apiFetch<{ data: Action[] }>("/api/actions?mode=overdue"),
        apiFetch<{ data: Action[] }>("/api/actions?mode=today"),
        apiFetch<{ data: Action[] }>("/api/actions?mode=week"),
        apiFetch<{ data: Thought[] }>("/api/thoughts?mode=unprocessed"),
        apiFetch<{ data: Action[] }>("/api/actions?mode=stale"),
        apiFetch<{ stats: CommandCenterStats }>("/api/actions?mode=stats"),
      ]);
      setOverdue(odRes.data || []);
      setDueToday(dtRes.data || []);
      setThisWeek(twRes.data || []);
      setUnprocessed(upRes.data || []);
      setStale(stRes.data || []);
      setStats(ssRes.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, []);

  // Fetch calendar data
  const fetchCalendar = useCallback(async () => {
    try {
      const json = await apiFetch<{ items: CalendarItem[] }>(
        `/api/calendar?year=${calYear}&month=${calMonth}`
      );
      setCalItems(json.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load calendar");
    }
  }, [calYear, calMonth]);

  // Fetch thoughts
  const fetchThoughts = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        mode: "feed",
        page: String(thoughtsPage),
      });
      if (filterType) params.set("type", filterType);
      if (filterTopic) params.set("topic", filterTopic);
      if (filterPerson) params.set("person", filterPerson);
      if (searchQuery) params.set("search", searchQuery);

      const json = await apiFetch<{ data: Thought[]; count: number }>(
        `/api/thoughts?${params}`
      );
      setThoughts(json.data || []);
      setThoughtsCount(json.count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load thoughts");
    }
  }, [thoughtsPage, filterType, filterTopic, filterPerson, searchQuery]);

  // Fetch filter options from all thoughts metadata
  const fetchFilterOptions = useCallback(async () => {
    try {
      const json = await apiFetch<{ data: Thought[] }>(
        "/api/thoughts?mode=feed&page=0"
      );
      const data = json.data || [];

      const types = new Set<string>();
      const topics = new Set<string>();
      const people = new Set<string>();

      for (const t of data) {
        const m = t.metadata as Record<string, unknown> | null;
        if (m?.type) types.add(m.type as string);
        if (Array.isArray(m?.topics))
          (m.topics as string[]).forEach((x) => topics.add(x));
        if (Array.isArray(m?.people))
          (m.people as string[]).forEach((x) => people.add(x));
      }

      setFilterOptions({
        types: Array.from(types).sort(),
        topics: Array.from(topics).sort(),
        people: Array.from(people).sort(),
      });
    } catch {
      // non-critical
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (!session) return;
    setLoading(true);
    Promise.all([fetchTodayData(), fetchFilterOptions()]).finally(() =>
      setLoading(false)
    );
  }, [session, fetchTodayData, fetchFilterOptions]);

  // Fetch on view change
  useEffect(() => {
    if (!session) return;
    if (view === "upcoming") fetchCalendar();
    if (view === "thoughts") fetchThoughts();
  }, [session, view, fetchCalendar, fetchThoughts]);

  // Reset page on filter change
  useEffect(() => {
    setThoughtsPage(0);
  }, [filterType, filterTopic, filterPerson, searchQuery]);

  // Action handlers — via API routes
  async function handleStatusChange(
    id: string,
    status: string,
    note?: string
  ) {
    const res = await fetch("/api/actions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, completion_note: note }),
    });
    const json = await res.json();
    if (json.error) {
      setError(json.error);
      return;
    }
    await fetchTodayData();
  }

  async function handleSnooze(id: string, days: number) {
    const newDue = new Date();
    newDue.setDate(newDue.getDate() + days);
    const res = await fetch("/api/actions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        due_date: newDue.toISOString().split("T")[0],
      }),
    });
    const json = await res.json();
    if (json.error) setError(json.error);
    await fetchTodayData();
  }

  async function handleConvert(
    thoughtId: string,
    content: string,
    dueDate?: string
  ) {
    const res = await fetch("/api/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        thought_id: thoughtId,
        due_date: dueDate,
      }),
    });
    const json = await res.json();
    if (json.error) setError(json.error);
    await fetchTodayData();
  }

  function handleRefresh() {
    fetchTodayData();
    if (view === "upcoming") fetchCalendar();
    if (view === "thoughts") fetchThoughts();
  }

  // Calendar navigation
  function prevMonth() {
    if (calMonth === 1) {
      setCalMonth(12);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
    setSelectedDate(null);
  }

  function nextMonth() {
    if (calMonth === 12) {
      setCalMonth(1);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
    setSelectedDate(null);
  }

  function prevWeek() {
    const d = new Date(weekStart + "T12:00:00");
    d.setDate(d.getDate() - 7);
    setWeekStart(d.toISOString().slice(0, 10));
    setSelectedDate(null);
  }

  function nextWeek() {
    const d = new Date(weekStart + "T12:00:00");
    d.setDate(d.getDate() + 7);
    setWeekStart(d.toISOString().slice(0, 10));
    setSelectedDate(null);
  }

  // Auth gate
  if (session === null) {
    return (
      <div className="flex min-h-screen items-center justify-center text-text-muted">
        Loading...
      </div>
    );
  }
  if (!session) {
    return <LoginForm client={client} onSuccess={() => setSession(true)} />;
  }

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const selectedItems = selectedDate
    ? calItems.filter((i) => i.date === selectedDate)
    : [];

  const PAGE_SIZE = 25;
  const totalPages = Math.ceil(thoughtsCount / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
        {error && (
          <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-xs underline"
            >
              dismiss
            </button>
          </div>
        )}

        <StatsHeader stats={stats} />
        <QuickActionBar onCapture={handleRefresh} />
        <NavTabs view={view} onViewChange={setView} />

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-lg bg-bg-card"
              />
            ))}
          </div>
        ) : (
          <>
            {/* Today View */}
            {view === "today" && (
              <TodayView
                overdue={overdue}
                dueToday={dueToday}
                thisWeek={thisWeek}
                unprocessed={unprocessed}
                stale={stale}
                onStatusChange={handleStatusChange}
                onSnooze={handleSnooze}
                onConvert={handleConvert}
              />
            )}

            {/* Upcoming View */}
            {view === "upcoming" && (
              <div className="space-y-4">
                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={calMode === "month" ? prevMonth : prevWeek}
                      className="rounded p-1 text-text-muted hover:text-text-primary hover:bg-bg-card"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium text-text-primary min-w-[140px] text-center">
                      {calMode === "month"
                        ? `${MONTH_NAMES[calMonth - 1]} ${calYear}`
                        : (() => {
                            const ws = new Date(weekStart + "T12:00:00");
                            const we = new Date(ws);
                            we.setDate(we.getDate() + 6);
                            return `${ws.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${we.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
                          })()}
                    </span>
                    <button
                      onClick={calMode === "month" ? nextMonth : nextWeek}
                      className="rounded p-1 text-text-muted hover:text-text-primary hover:bg-bg-card"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCalMode("month")}
                      className={`rounded px-2 py-1 text-xs ${
                        calMode === "month"
                          ? "bg-accent text-white"
                          : "text-text-muted hover:text-text-secondary"
                      }`}
                    >
                      Month
                    </button>
                    <button
                      onClick={() => setCalMode("week")}
                      className={`rounded px-2 py-1 text-xs ${
                        calMode === "week"
                          ? "bg-accent text-white"
                          : "text-text-muted hover:text-text-secondary"
                      }`}
                    >
                      Week
                    </button>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                  {Object.entries(SOURCE_COLORS).map(([key, color]) => (
                    <div key={key} className="flex items-center gap-1">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span>{SOURCE_LABELS[key] || key}</span>
                    </div>
                  ))}
                </div>

                {/* Calendar */}
                {calMode === "month" ? (
                  <CalendarGrid
                    year={calYear}
                    month={calMonth}
                    items={calItems}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                  />
                ) : (
                  <WeekView
                    startDate={weekStart}
                    items={calItems}
                    onSelectDate={setSelectedDate}
                  />
                )}

                {/* Day detail */}
                {selectedDate && (
                  <DayDetail
                    date={selectedDate}
                    items={selectedItems}
                    onClose={() => setSelectedDate(null)}
                  />
                )}
              </div>
            )}

            {/* Thoughts View */}
            {view === "thoughts" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <SearchBar value={searchQuery} onChange={setSearchQuery} />
                  <FilterBar
                    type={filterType}
                    topic={filterTopic}
                    person={filterPerson}
                    onTypeChange={setFilterType}
                    onTopicChange={setFilterTopic}
                    onPersonChange={setFilterPerson}
                    types={filterOptions.types}
                    topics={filterOptions.topics}
                    people={filterOptions.people}
                  />
                </div>

                {thoughts.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-bg-card px-4 py-8 text-center text-sm text-text-muted">
                    No thoughts found
                  </div>
                ) : (
                  <div className="space-y-2">
                    {thoughts.map((thought) => (
                      <ThoughtCard
                        key={thought.id}
                        thought={thought}
                        onConvert={handleConvert}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() =>
                        setThoughtsPage(Math.max(0, thoughtsPage - 1))
                      }
                      disabled={thoughtsPage === 0}
                      className="rounded px-3 py-1 text-xs text-text-muted hover:text-text-primary disabled:opacity-30"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-text-muted">
                      Page {thoughtsPage + 1} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setThoughtsPage(
                          Math.min(totalPages - 1, thoughtsPage + 1)
                        )
                      }
                      disabled={thoughtsPage >= totalPages - 1}
                      className="rounded px-3 py-1 text-xs text-text-muted hover:text-text-primary disabled:opacity-30"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
