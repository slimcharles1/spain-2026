"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { eventsToCSV, type AnalyticsEvent } from "@/lib/analytics";

interface UserSummary {
  user_name: string | null;
  user_id: string;
  ip_address: string | null;
  device_info: string | null;
  event_count: number;
  last_seen: string;
  pages_visited: string[];
}

function shortDevice(ua: string | null): string {
  if (!ua) return "—";
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/iPad/i.test(ua)) return "iPad";
  if (/Android/i.test(ua)) return "Android";
  if (/Mac/i.test(ua)) return "Mac";
  if (/Windows/i.test(ua)) return "Windows";
  return "Other";
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AnalyticsDashboard() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"users" | "events" | "stream">("users");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const sb = getSupabase();
    if (!sb) { setLoading(false); return; }

    const { data } = await sb
      .from("analytics_events")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(1000);

    if (data) {
      setEvents(data as AnalyticsEvent[]);
      buildUserSummaries(data as AnalyticsEvent[]);
    }
    setLoading(false);
  }

  function buildUserSummaries(evts: AnalyticsEvent[]) {
    const map = new Map<string, UserSummary>();
    for (const e of evts) {
      const existing = map.get(e.user_id);
      if (existing) {
        existing.event_count++;
        if (!existing.user_name && e.user_name) existing.user_name = e.user_name;
        if (!existing.ip_address && e.ip_address) existing.ip_address = e.ip_address;
        if (!existing.device_info && e.device_info) existing.device_info = e.device_info;
        const page = e.page;
        if (!existing.pages_visited.includes(page)) existing.pages_visited.push(page);
      } else {
        map.set(e.user_id, {
          user_name: e.user_name,
          user_id: e.user_id,
          ip_address: e.ip_address,
          device_info: e.device_info,
          event_count: 1,
          last_seen: e.timestamp,
          pages_visited: [e.page],
        });
      }
    }
    setUsers(Array.from(map.values()).sort((a, b) => b.event_count - a.event_count));
  }

  const filteredEvents = selectedUser
    ? events.filter((e) => e.user_id === selectedUser)
    : events;

  const exportCSV = () => {
    const csv = eventsToCSV(filteredEvents);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atlantis-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stats
  const totalEvents = events.length;
  const uniqueUsers = new Set(events.map((e) => e.user_id)).size;
  const uniqueSessions = new Set(events.map((e) => e.session_id)).size;
  const topPages = events.reduce((acc, e) => {
    if (e.event_type === "page_view") {
      const p = e.page;
      acc[p] = (acc[p] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen font-body">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-ocean-950 to-ocean-900 pb-4 shadow-lg shadow-ocean-950/50">
        <div className="px-5 pt-10 pb-2 text-center">
          <h1 className="font-display text-2xl bg-gradient-to-r from-gold via-coral to-pink bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="text-white/50 text-xs mt-1 tracking-wide">
            Usage metrics &amp; clickstream
          </p>
        </div>

        {/* Stats row */}
        <div className="flex gap-2 px-4 mt-3">
          <div className="flex-1 bg-white/5 rounded-xl p-2.5 text-center">
            <div className="text-mint font-bold text-lg">{totalEvents}</div>
            <div className="text-white/40 text-[10px]">Events</div>
          </div>
          <div className="flex-1 bg-white/5 rounded-xl p-2.5 text-center">
            <div className="text-coral font-bold text-lg">{uniqueUsers}</div>
            <div className="text-white/40 text-[10px]">Users</div>
          </div>
          <div className="flex-1 bg-white/5 rounded-xl p-2.5 text-center">
            <div className="text-gold font-bold text-lg">{uniqueSessions}</div>
            <div className="text-white/40 text-[10px]">Sessions</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 mt-3">
          {(["users", "events", "stream"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                tab === t ? "bg-white/15 text-white" : "bg-white/5 text-white/40"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-white/30 text-sm">Loading...</div>
      ) : (
        <div className="px-4 py-4 space-y-2">

          {/* Users tab */}
          {tab === "users" && (
            <>
              {users.map((u) => (
                <button key={u.user_id} onClick={() => { setSelectedUser(u.user_id); setTab("events"); }}
                  className="w-full bg-ocean-800/60 rounded-2xl p-3.5 border border-white/5 text-left hover:bg-ocean-800/80 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white text-sm font-medium">
                        {u.user_name || "Anonymous"}
                        <span className="text-white/20 text-xs ml-2">{shortDevice(u.device_info)}</span>
                      </div>
                      <div className="text-white/40 text-xs mt-0.5">
                        ID: {u.user_id.slice(0, 8)}
                        {u.ip_address && <span> · IP: {u.ip_address}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-mint text-sm font-bold">{u.event_count}</div>
                      <div className="text-white/30 text-[10px]">{timeAgo(u.last_seen)}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {u.pages_visited.map((p) => (
                      <span key={p} className="text-[10px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded-full">
                        {p === "/" ? "home" : p.replace("/", "")}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
              {users.length === 0 && (
                <div className="text-center py-16 text-white/30 text-sm">No users tracked yet</div>
              )}
            </>
          )}

          {/* Events tab */}
          {tab === "events" && (
            <>
              {selectedUser && (
                <button onClick={() => setSelectedUser(null)}
                  className="text-mint text-xs mb-2 flex items-center gap-1">
                  ← Show all users
                </button>
              )}
              {filteredEvents.slice(0, 100).map((e) => (
                <div key={e.id} className="bg-ocean-800/60 rounded-xl p-3 border border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        e.event_type === "page_view" ? "bg-mint" :
                        e.event_type === "click" ? "bg-coral" :
                        e.event_type === "expense_added" ? "bg-gold" : "bg-pink"
                      }`} />
                      <span className="text-white text-xs font-medium">{e.event_type}</span>
                      {e.target && <span className="text-white/30 text-xs">→ {e.target}</span>}
                    </div>
                    <span className="text-white/20 text-[10px]">{timeAgo(e.timestamp)}</span>
                  </div>
                  <div className="text-white/40 text-[10px] mt-1 flex gap-3">
                    <span>{e.user_name || e.user_id.slice(0, 8)}</span>
                    <span>{e.page}</span>
                    {e.ip_address && <span>IP: {e.ip_address}</span>}
                  </div>
                  {e.metadata && (
                    <div className="text-white/20 text-[10px] mt-1 font-mono truncate">
                      {JSON.stringify(e.metadata)}
                    </div>
                  )}
                </div>
              ))}
              {filteredEvents.length > 100 && (
                <p className="text-white/20 text-xs text-center">Showing first 100 of {filteredEvents.length}</p>
              )}
            </>
          )}

          {/* Live stream tab — top pages + recent activity */}
          {tab === "stream" && (
            <>
              <div className="bg-ocean-800/60 rounded-2xl p-4 border border-white/5 mb-3">
                <h3 className="text-white text-xs font-semibold mb-2">Top Pages</h3>
                {Object.entries(topPages)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 8)
                  .map(([page, count]) => (
                    <div key={page} className="flex items-center justify-between py-1">
                      <span className="text-white/60 text-xs">{page === "/" ? "home" : page}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 bg-mint/30 rounded-full" style={{ width: `${Math.min(count * 8, 120)}px` }} />
                        <span className="text-white/40 text-xs w-6 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="bg-ocean-800/60 rounded-2xl p-4 border border-white/5">
                <h3 className="text-white text-xs font-semibold mb-2">Event Breakdown</h3>
                {Object.entries(
                  events.reduce((acc, e) => {
                    acc[e.event_type] = (acc[e.event_type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                )
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between py-1">
                      <span className="text-white/60 text-xs">{type}</span>
                      <span className="text-white/40 text-xs">{count}</span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Export FAB */}
      <button onClick={exportCSV}
        className="fixed bottom-24 right-5 z-40 w-14 h-14 bg-gradient-to-br from-mint to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-mint/30 hover:scale-105 active:scale-95 transition-transform"
        title="Export CSV">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>

      {/* Refresh button */}
      <button onClick={loadData}
        className="fixed bottom-24 left-5 z-40 w-14 h-14 bg-ocean-800 border border-white/10 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        title="Refresh data">
        <svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );
}
