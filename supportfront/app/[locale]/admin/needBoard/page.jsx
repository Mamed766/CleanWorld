"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import adminApi from "@/app/utils/adminApi";
import { Loader2 } from "lucide-react";

// Recharts (dynamic import)
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), {
  ssr: false,
});
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), {
  ssr: false,
});
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), {
  ssr: false,
});
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), {
  ssr: false,
});
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), {
  ssr: false,
});
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), {
  ssr: false,
});
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), {
  ssr: false,
});
const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), {
  ssr: false,
});
const Line = dynamic(() => import("recharts").then((m) => m.Line), {
  ssr: false,
});
const AreaChart = dynamic(() => import("recharts").then((m) => m.AreaChart), {
  ssr: false,
});
const Area = dynamic(() => import("recharts").then((m) => m.Area), {
  ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), {
  ssr: false,
});
const CartesianGrid = dynamic(
  () => import("recharts").then((m) => m.CartesianGrid),
  { ssr: false }
);

// ---- Light palette (fresh/pastel) ----
const COLORS = [
  "#22c55e", // emerald-500
  "#06b6d4", // cyan-500
  "#a855f7", // violet-500
  "#0ea5e9", // sky-500
  "#f97316", // orange-500
  "#14b8a6", // teal-500
  "#f59e0b", // amber-500
  "#3b82f6", // blue-500
  "#ef4444", // red-500
];

// kategori -> sabit renk
const CATEGORY_COLORS = {
  clothing: "#22c55e",
  food: "#06b6d4",
  shelter: "#a855f7",
  health: "#0ea5e9",
  education: "#f59e0b",
  other: "#14b8a6",
};

const CATEGORY_ORDER = [
  "clothing",
  "food",
  "shelter",
  "health",
  "education",
  "other",
];
const PRIORITY_ORDER = ["low", "medium", "high", "urgent"];
const STATUS_ORDER = ["open", "pending", "fulfilled"];

/* ---------- AZ Labels (enum KEY-lər ingiliscə qalır) ---------- */
const AZ = {
  categories: {
    clothing: "Geyim",
    food: "Qida",
    shelter: "Sığınacaq",
    health: "Sağlamlıq",
    education: "Təhsil",
    other: "Digər",
  },
  priorities: {
    low: "Aşağı",
    medium: "Orta",
    high: "Yüksək",
    urgent: "Təcili",
  },
  statuses: {
    open: "Açıq",
    pending: "Gözlənilir",
    fulfilled: "Tamamlandı",
  },
  ui: {
    pageTitle: "Ehtiyac Analitikası",
    filters: {
      from: "Başlanğıc tarix",
      to: "Son tarix",
      status: "Status",
      category: "Kateqoriya",
      all: "Hamısı",
    },
    loading: "Analitika yüklənir…",
    // kart başlıqları
    byCatCount: "Kateqoriya üzrə ehtiyac sayı",
    byCatQty: "Kateqoriya üzrə ümumi miqdar",
    statusByCat: "Kateqoriyaya görə status (stack)",
    perDay: "Günə görə yeni ehtiyaclar",
    fulfilledCum: "Kumulativ tamamlanan miqdar",
    byPriority: "Prioritet üzrə ehtiyaclar",
    topTags: "Ən çox istifadə olunan teqlər",
  },
};

/* ---------- Helpers ---------- */
function fmtDate(d) {
  const dd = new Date(d);
  const y = dd.getFullYear();
  const m = String(dd.getMonth() + 1).padStart(2, "0");
  const day = String(dd.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function groupBy(arr, keyFn) {
  const map = new Map();
  for (const it of arr) {
    const k = keyFn(it);
    map.set(k, (map.get(k) || []).concat(it));
  }
  return map;
}

// "foods" -> "food" kimi normalize
const normalizeCat = (c) => {
  const x = String(c || "other").toLowerCase();
  if (x.endsWith("s") && CATEGORY_ORDER.includes(x.slice(0, -1))) {
    return x.slice(0, -1);
  }
  return CATEGORY_ORDER.includes(x) ? x : "other";
};

// label köməkçiləri
const L = {
  cat: (k) => AZ.categories[k] ?? k,
  pr: (k) => AZ.priorities[k] ?? k,
  st: (k) => AZ.statuses[k] ?? k,
};

export default function NeedsAnalyticsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await adminApi.get("/needs", {
          params: { page: 1, limit: 2000, sort: "-createdAt" },
        });
        if (!mounted) return;
        setData(res?.data?.data || []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || "Ehtiyacları yükləmək alınmadı");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let arr = data;
    if (from) arr = arr.filter((n) => new Date(n.createdAt) >= new Date(from));
    if (to) arr = arr.filter((n) => new Date(n.createdAt) <= new Date(to));
    if (status)
      arr = arr.filter((n) => (n.status || "").toLowerCase() === status);
    if (category)
      arr = arr.filter((n) => normalizeCat(n.category) === category);
    return arr;
  }, [data, from, to, status, category]);

  // datasets
  const byCategoryCount = useMemo(() => {
    const g = groupBy(filtered, (n) => normalizeCat(n.category));
    return CATEGORY_ORDER.map((cat) => ({
      name: cat,
      value: (g.get(cat) || []).length,
    }));
  }, [filtered]);

  const byCategoryQuantity = useMemo(() => {
    const sums = Object.create(null);
    for (const n of filtered) {
      const c = normalizeCat(n.category);
      sums[c] = (sums[c] || 0) + (Number(n.quantity) || 0);
    }
    return CATEGORY_ORDER.map((cat) => ({
      name: cat,
      quantity: sums[cat] || 0,
    }));
  }, [filtered]);

  const byPriorityCount = useMemo(() => {
    const g = groupBy(filtered, (n) => (n.priority || "medium").toLowerCase());
    return PRIORITY_ORDER.map((p) => ({
      name: p,
      value: (g.get(p) || []).length,
    }));
  }, [filtered]);

  const statusByCategory = useMemo(() => {
    const base = CATEGORY_ORDER.map((cat) => ({
      category: cat,
      open: 0,
      pending: 0,
      fulfilled: 0,
    }));
    const idx = Object.fromEntries(CATEGORY_ORDER.map((c, i) => [c, i]));
    for (const n of filtered) {
      const c = normalizeCat(n.category);
      const s = (n.status || "open").toLowerCase();
      const row = base[idx[c]];
      if (row && typeof row[s] === "number") row[s] += 1;
    }
    return base;
  }, [filtered]);

  const createdPerDay = useMemo(() => {
    const map = new Map();
    for (const n of filtered) {
      const d = fmtDate(n.createdAt);
      map.set(d, (map.get(d) || 0) + 1);
    }
    const dates = Array.from(map.keys()).sort();
    return dates.map((d) => ({ date: d, count: map.get(d) }));
  }, [filtered]);

  const fulfilledCumulativeQty = useMemo(() => {
    const arr = filtered
      .filter((n) => (n.status || "").toLowerCase() === "fulfilled")
      .sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
    let sum = 0;
    return arr.map((n) => {
      sum += Number(n.quantity) || 0;
      return { date: fmtDate(n.updatedAt || n.createdAt), total: sum };
    });
  }, [filtered]);

  const topTags = useMemo(() => {
    const counts = Object.create(null);
    for (const n of filtered) {
      for (const t of n.tags || []) counts[t] = (counts[t] || 0) + 1;
    }
    const rows = Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
    rows.sort((a, b) => b.value - a.value);
    return rows.slice(0, 12);
  }, [filtered]);

  // --- PIE DATA with colors so Legend shows colors properly ---
  const pieData = useMemo(() => {
    return byCategoryCount
      .map((d) => ({
        ...d,
        label: L.cat(d.name),
        fill: CATEGORY_COLORS[d.name] || "#94a3b8", // fallback slate-400
      }))
      .filter((d) => d.value > 0);
  }, [byCategoryCount]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{AZ.ui.pageTitle}</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <div>
            <label className="block text-sm text-slate-700 mb-1">
              {AZ.ui.filters.from}
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-md bg-white border border-slate-200 p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">
              {AZ.ui.filters.to}
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-md bg-white border border-slate-200 p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">
              {AZ.ui.filters.status}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-md bg-white border border-slate-200 p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="">{AZ.ui.filters.all}</option>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {L.st(s)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">
              {AZ.ui.filters.category}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md bg-white border border-slate-200 p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="">{AZ.ui.filters.all}</option>
              {CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {L.cat(c)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-600">
            <Loader2 className="animate-spin" /> {AZ.ui.loading}
          </div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category distribution (count) */}
            <Card title={AZ.ui.byCatCount}>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="label"
                    outerRadius={110}
                    label
                  >
                    {pieData.map((d) => (
                      <Cell key={d.name} fill={d.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      color: "#0f172a",
                    }}
                    labelStyle={{ color: "#0f172a" }}
                  />
                  <Legend
                    payload={pieData.map((d) => ({
                      id: d.name,
                      value: d.label,
                      color: d.fill,
                      type: "circle",
                    }))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Quantity by category */}
            <Card title={AZ.ui.byCatQty}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={byCategoryQuantity}>
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    stroke="#334155"
                    tickFormatter={(v) => L.cat(v)}
                  />
                  <YAxis stroke="#334155" />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      color: "#0f172a",
                    }}
                    formatter={(value, name, props) => [value, "Miqdar"]}
                    labelFormatter={(lab) => L.cat(lab)}
                  />
                  <Legend
                    formatter={(v) => (v === "quantity" ? "Miqdar" : v)}
                  />
                  <Bar dataKey="quantity">
                    {byCategoryQuantity.map((d, i) => {
                      const fill =
                        CATEGORY_COLORS[d.name] || COLORS[i % COLORS.length];
                      return <Cell key={d.name} fill={fill} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Status stacked per category */}
            <Card title={AZ.ui.statusByCat}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={statusByCategory}>
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    stroke="#334155"
                    tickFormatter={(v) => L.cat(v)}
                  />
                  <YAxis stroke="#334155" />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      color: "#0f172a",
                    }}
                    formatter={(value, name) => [value, L.st(name)]}
                    labelFormatter={(lab) => L.cat(lab)}
                  />
                  <Legend formatter={(v) => L.st(v)} />
                  <Bar dataKey="open" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="pending" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="fulfilled" stackId="a" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Created per day */}
            <Card title={AZ.ui.perDay}>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={createdPerDay}>
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#334155" />
                  <YAxis allowDecimals={false} stroke="#334155" />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      color: "#0f172a",
                    }}
                    formatter={(value) => [value, "Sayı"]}
                    labelFormatter={(lab) => `Tarix: ${lab}`}
                  />
                  <Legend formatter={(v) => (v === "count" ? "Sayı" : v)} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    dot={false}
                    stroke="#22c55e"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Fulfilled cumulative quantity */}
            <Card title={AZ.ui.fulfilledCum}>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={fulfilledCumulativeQty}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#334155" />
                  <YAxis stroke="#334155" />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      color: "#0f172a",
                    }}
                    formatter={(value) => [value, "Cəm miqdar"]}
                    labelFormatter={(lab) => `Tarix: ${lab}`}
                  />
                  <Legend
                    formatter={(v) => (v === "total" ? "Cəm miqdar" : v)}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#22c55e"
                    fillOpacity={1}
                    fill="url(#g1)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Priority distribution */}
            <Card title={AZ.ui.byPriority}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={byPriorityCount}>
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    stroke="#334155"
                    tickFormatter={(v) => L.pr(v)}
                  />
                  <YAxis stroke="#334155" />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      color: "#0f172a",
                    }}
                    formatter={(value) => [value, "Sayı"]}
                    labelFormatter={(lab) => L.pr(lab)}
                  />
                  <Legend formatter={(v) => (v === "value" ? "Sayı" : v)} />
                  <Bar dataKey="value" fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Top tags */}
            <Card title={AZ.ui.topTags}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={topTags}
                  layout="vertical"
                  margin={{ left: 24 }}
                >
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    stroke="#334155"
                    tickFormatter={(v) => `${v}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={140}
                    stroke="#334155"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      color: "#0f172a",
                    }}
                    formatter={(value) => [value, "Sayı"]}
                  />
                  <Legend formatter={(v) => (v === "value" ? "Sayı" : v)} />
                  <Bar dataKey="value" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}
