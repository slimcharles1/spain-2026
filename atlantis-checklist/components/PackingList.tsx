"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { seedCategories } from "@/lib/seed-data";
import { getSupabase, PackingItem } from "@/lib/supabase";

type Filter = "all" | "remaining" | "packed";

interface LocalItem {
  id: string;
  category_id: string;
  text: string;
  checked: boolean;
  sort_order: number;
  is_seed: boolean;
}

function generateId() {
  return crypto.randomUUID();
}

function buildSeedItems(): LocalItem[] {
  const items: LocalItem[] = [];
  for (const cat of seedCategories) {
    cat.items.forEach((item, i) => {
      items.push({
        id: generateId(),
        category_id: cat.id,
        text: item.text,
        checked: item.prechecked,
        sort_order: i,
        is_seed: true,
      });
    });
  }
  return items;
}

const STORAGE_KEY = "atlantis-packing-items";

function loadFromStorage(): LocalItem[] | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveToStorage(items: LocalItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function PackingList() {
  const [items, setItems] = useState<LocalItem[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState("");
  const [poppedIds, setPoppedIds] = useState<Set<string>>(new Set());
  const [showReset, setShowReset] = useState(false);
  const [useSupabase, setUseSupabase] = useState(false);
  const addInputRef = useRef<HTMLInputElement>(null);

  // Initialize
  useEffect(() => {
    const sb = getSupabase();
    if (sb) {
      setUseSupabase(true);
      // Load from Supabase
      sb.from("packing_items")
        .select("*")
        .order("sort_order")
        .then(({ data, error }) => {
          if (error || !data || data.length === 0) {
            // Seed Supabase
            const seed = buildSeedItems();
            sb.from("packing_items")
              .insert(
                seed.map((s) => ({
                  id: s.id,
                  category_id: s.category_id,
                  text: s.text,
                  checked: s.checked,
                  sort_order: s.sort_order,
                  is_seed: s.is_seed,
                }))
              )
              .select()
              .then(({ data: inserted }) => {
                if (inserted) setItems(inserted as LocalItem[]);
                else setItems(seed);
              });
          } else {
            setItems(data as LocalItem[]);
          }
        });

      // Subscribe to realtime
      const channel = sb
        .channel("packing-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "packing_items" },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const newItem = payload.new as PackingItem;
              setItems((prev) => {
                if (prev.some((i) => i.id === newItem.id)) return prev;
                return [...prev, newItem];
              });
            } else if (payload.eventType === "UPDATE") {
              const updated = payload.new as PackingItem;
              setItems((prev) =>
                prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i))
              );
            } else if (payload.eventType === "DELETE") {
              const deleted = payload.old as { id: string };
              setItems((prev) => prev.filter((i) => i.id !== deleted.id));
            }
          }
        )
        .subscribe();

      return () => {
        sb.removeChannel(channel);
      };
    } else {
      // localStorage mode
      const stored = loadFromStorage();
      if (stored && stored.length > 0) {
        setItems(stored);
      } else {
        const seed = buildSeedItems();
        setItems(seed);
        saveToStorage(seed);
      }
    }
  }, []);

  // Persist to localStorage when not using Supabase
  useEffect(() => {
    if (!useSupabase && items.length > 0) {
      saveToStorage(items);
    }
  }, [items, useSupabase]);

  // Focus add input when opening
  useEffect(() => {
    if (addingTo && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [addingTo]);

  const toggleItem = useCallback(
    (id: string) => {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
      );

      // Pop animation
      setPoppedIds((prev) => new Set(prev).add(id));
      setTimeout(() => {
        setPoppedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 300);

      // Sync to Supabase
      const sb = getSupabase();
      if (sb) {
        const item = items.find((i) => i.id === id);
        if (item) {
          sb.from("packing_items")
            .update({ checked: !item.checked })
            .eq("id", id)
            .then(() => {});
        }
      }
    },
    [items]
  );

  const addItem = useCallback(
    (categoryId: string) => {
      const text = newItemText.trim();
      if (!text) return;

      const categoryItems = items.filter((i) => i.category_id === categoryId);
      const maxSort = categoryItems.reduce((max, i) => Math.max(max, i.sort_order), -1);

      const newItem: LocalItem = {
        id: generateId(),
        category_id: categoryId,
        text,
        checked: false,
        sort_order: maxSort + 1,
        is_seed: false,
      };

      setItems((prev) => [...prev, newItem]);
      setNewItemText("");

      const sb = getSupabase();
      if (sb) {
        sb.from("packing_items")
          .insert({
            id: newItem.id,
            category_id: newItem.category_id,
            text: newItem.text,
            checked: false,
            sort_order: newItem.sort_order,
            is_seed: false,
          })
          .then(() => {});
      }
    },
    [newItemText, items]
  );

  const deleteItem = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((i) => i.id !== id));
      const sb = getSupabase();
      if (sb) {
        sb.from("packing_items").delete().eq("id", id).then(() => {});
      }
    },
    []
  );

  const resetToSeed = useCallback(() => {
    const seed = buildSeedItems();
    setItems(seed);
    setShowReset(false);

    const sb = getSupabase();
    if (sb) {
      sb.from("packing_items")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000")
        .then(() => {
          sb.from("packing_items")
            .insert(
              seed.map((s) => ({
                id: s.id,
                category_id: s.category_id,
                text: s.text,
                checked: s.checked,
                sort_order: s.sort_order,
                is_seed: s.is_seed,
              }))
            )
            .then(() => {});
        });
    } else {
      saveToStorage(seed);
    }
  }, []);

  // Computed
  const totalItems = items.length;
  const checkedItems = items.filter((i) => i.checked).length;
  const pct = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  const filteredItems = items.filter((i) => {
    if (filter === "remaining") return !i.checked;
    if (filter === "packed") return i.checked;
    return true;
  });

  const categories = seedCategories.map((cat) => ({
    ...cat,
    items: filteredItems
      .filter((i) => i.category_id === cat.id)
      .sort((a, b) => a.sort_order - b.sort_order),
    totalCount: items.filter((i) => i.category_id === cat.id).length,
    checkedCount: items.filter((i) => i.category_id === cat.id && i.checked).length,
  }));

  // Also include any categories from items not in seed (shouldn't happen but safety)
  const visibleCategories = categories.filter(
    (c) => c.items.length > 0 || (filter === "all" && c.totalCount > 0)
  );

  return (
    <div className="min-h-screen font-body">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-b from-ocean-950 to-ocean-900 pb-4 shadow-lg shadow-ocean-950/50">
        <div className="relative h-28 overflow-hidden">
          <img src="/headers/checklist.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-ocean-950/30 to-ocean-950/90" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h1 className="font-display text-2xl bg-gradient-to-r from-gold via-coral to-pink bg-clip-text text-transparent">
              Packing List
            </h1>
            <p className="text-white/60 text-xs mt-0.5 tracking-wide">
              Charles, Carly &amp; Maeve
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="px-5 mt-3">
          <div className="flex justify-between text-xs text-white/60 mb-1.5">
            <span>
              {checkedItems} of {totalItems} packed
            </span>
            <span>{pct}%</span>
          </div>
          <div className="h-2.5 bg-ocean-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-mint to-emerald-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 px-5 mt-3">
          {(["all", "remaining", "packed"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === f
                  ? "bg-white/15 text-white"
                  : "bg-white/5 text-white/40 hover:text-white/60"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-4 space-y-3">
        {visibleCategories.map((cat) => {
          const isCollapsed = collapsed[cat.id] ?? false;
          return (
            <div
              key={cat.id}
              className="bg-ocean-800/60 backdrop-blur rounded-2xl overflow-hidden border border-white/5"
            >
              {/* Category header */}
              <button
                onClick={() =>
                  setCollapsed((prev) => ({ ...prev, [cat.id]: !isCollapsed }))
                }
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="text-white font-semibold text-sm">
                    {cat.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      cat.checkedCount === cat.totalCount && cat.totalCount > 0
                        ? "bg-mint/20 text-mint"
                        : "bg-white/10 text-white/50"
                    }`}
                  >
                    {cat.checkedCount}/{cat.totalCount}
                  </span>
                  <svg
                    className={`w-4 h-4 text-white/40 transition-transform ${
                      isCollapsed ? "" : "rotate-180"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Items */}
              {!isCollapsed && (
                <div className="px-3 pb-3">
                  <div className="space-y-0.5">
                    {cat.items.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                          item.checked
                            ? "bg-mint/5"
                            : "bg-white/[0.03] hover:bg-white/[0.06]"
                        } ${poppedIds.has(item.id) ? "animate-pop" : ""}`}
                      >
                        <button
                          onClick={() => toggleItem(item.id)}
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            item.checked
                              ? "bg-mint border-mint"
                              : "border-white/20 hover:border-white/40"
                          }`}
                        >
                          {item.checked && (
                            <svg
                              className="w-3.5 h-3.5 text-ocean-950"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                        <span
                          className={`flex-1 text-sm transition-all ${
                            item.checked
                              ? "text-white/30 line-through"
                              : "text-white/90"
                          }`}
                        >
                          {item.text}
                        </span>
                        {!item.is_seed && (
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="text-white/20 hover:text-coral transition-colors p-1"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add item */}
                  {addingTo === cat.id ? (
                    <div className="flex gap-2 mt-2 px-1">
                      <input
                        ref={addInputRef}
                        type="text"
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addItem(cat.id);
                          if (e.key === "Escape") {
                            setAddingTo(null);
                            setNewItemText("");
                          }
                        }}
                        placeholder="Add item…"
                        className="flex-1 bg-white/10 text-white text-sm rounded-lg px-3 py-2 placeholder-white/30 outline-none focus:ring-1 focus:ring-mint/50"
                      />
                      <button
                        onClick={() => addItem(cat.id)}
                        className="bg-mint/20 text-mint text-sm font-semibold px-3 rounded-lg hover:bg-mint/30 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setAddingTo(null);
                          setNewItemText("");
                        }}
                        className="text-white/30 text-sm px-2 hover:text-white/50"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAddingTo(cat.id);
                        setNewItemText("");
                      }}
                      className="flex items-center gap-1.5 text-white/25 hover:text-white/50 text-xs mt-2 ml-3 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add item
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 pb-10 pt-4">
        <div className="flex items-center justify-between">
          <p className="text-white/20 text-xs">
            {useSupabase ? "✓ Real-time sync active" : "Local storage mode"}
          </p>
          <button
            onClick={() => setShowReset(true)}
            className="text-white/20 hover:text-coral text-xs transition-colors"
          >
            Reset list
          </button>
        </div>
      </div>

      {/* Reset confirmation modal */}
      {showReset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-6">
          <div className="bg-ocean-800 rounded-2xl p-6 max-w-sm w-full border border-white/10">
            <h3 className="text-white font-display text-lg mb-2">
              Reset packing list?
            </h3>
            <p className="text-white/50 text-sm mb-5">
              This will restore the original items and uncheck everything. Custom
              items will be removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReset(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-white/70 text-sm font-medium hover:bg-white/15 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={resetToSeed}
                className="flex-1 py-2.5 rounded-xl bg-coral text-white text-sm font-semibold hover:bg-coral/80 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
