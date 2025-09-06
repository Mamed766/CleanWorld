"use client";
import adminApi from "../../utils/adminApi";
import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

export default function AdminDashboard() {
  // ---- Volunteers (mövcud) ----
  const [statusData, setStatusData] = useState([]); // Pie: ümumi status payı
  const [genderPieData, setGenderPieData] = useState([]); // Pie: ümumi cinsiyyət payı
  const [totalsBarData, setTotalsBarData] = useState([]); // Bar: Ümumi Qəbul/İmtina

  // ---- Needs (yeni 4 chart üçün) ----
  const [needs, setNeeds] = useState([]);
  const [needsLoading, setNeedsLoading] = useState(true);
  const [needsError, setNeedsError] = useState("");

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        // ---- Ümumi status sayları ----
        const [approvedRes, rejectedRes, pendingRes] = await Promise.all([
          adminApi.get("/volunteer?status=approved"),
          adminApi.get("/volunteer?status=rejected"),
          adminApi.get("/volunteer?status=pending"),
        ]);

        const approved = approvedRes?.data?.meta?.total ?? 0;
        const rejected = rejectedRes?.data?.meta?.total ?? 0;
        const pending = pendingRes?.data?.meta?.total ?? 0;

        setStatusData([
          { name: "Qəbul olunub", value: approved },
          { name: "İmtina edilib", value: rejected },
          { name: "Gözləmədə", value: pending },
        ]);

        setTotalsBarData([
          { status: "Qəbul olunub", value: approved },
          { status: "İmtina edilib", value: rejected },
          // { status: "Gözləmədə", value: pending }, // istəsən aç
        ]);

        // ---- Ümumi cinsiyyət payı ----
        const [maleRes, femaleRes] = await Promise.all([
          adminApi.get("/volunteer?gender=Male"),
          adminApi.get("/volunteer?gender=Female"),
        ]);
        setGenderPieData([
          { name: "Kişi", value: maleRes?.data?.meta?.total ?? 0 },
          { name: "Qadın", value: femaleRes?.data?.meta?.total ?? 0 },
        ]);
      } catch (err) {
        console.error("volunteer charts load error:", err);
      }
    };

    const fetchNeeds = async () => {
      try {
        setNeedsLoading(true);
        setNeedsError("");
        const res = await adminApi.get("/needs", {
          params: { page: 1, limit: 2000, sort: "-createdAt" },
        });
        setNeeds(Array.isArray(res?.data?.data) ? res.data.data : []);
      } catch (e) {
        setNeedsError(
          e?.response?.data?.message || "Ehtiyac siyahısı yüklənmədi"
        );
      } finally {
        setNeedsLoading(false);
      }
    };

    fetchVolunteers();
    fetchNeeds();
  }, []);

  // ---------------- Colors ----------------
  const STATUS_COLORS = ["#4CAF50", "#F44336", "#FFC107"]; // status pie: qəbul / imtina / gözləmə
  const GENDER_COLORS = ["#2563eb", "#dc2626"]; // gender pie: kişi / qadın
  const CATEGORY_COLORS = {
    clothing: "#22c55e", // emerald
    food: "#06b6d4", // cyan
    shelter: "#a855f7", // violet
    health: "#0ea5e9", // sky
    education: "#f59e0b", // amber
    other: "#14b8a6", // teal
  };
  const CATEGORY_ORDER = [
    "clothing",
    "food",
    "shelter",
    "health",
    "education",
    "other",
  ];

  // ---------------- Helpers (Needs) ----------------
  const fmtDate = (d) => {
    const dd = new Date(d);
    const y = dd.getFullYear();
    const m = String(dd.getMonth() + 1).padStart(2, "0");
    const day = String(dd.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const normalizeCat = (c) => {
    const x = String(c || "other").toLowerCase();
    if (x.endsWith("s") && CATEGORY_ORDER.includes(x.slice(0, -1))) {
      return x.slice(0, -1);
    }
    return CATEGORY_ORDER.includes(x) ? x : "other";
  };
  const L = {
    cat: (k) =>
      ({
        clothing: "Geyim",
        food: "Qida",
        shelter: "Sığınacaq",
        health: "Sağlamlıq",
        education: "Təhsil",
        other: "Digər",
      }[k] || k),
    st: (k) =>
      ({
        open: "Açıq",
        pending: "Gözlənilir",
        fulfilled: "Tamamlandı",
      }[k] || k),
  };

  // ---------------- Datasets (Needs) ----------------
  const needsByCategoryCount = useMemo(() => {
    const counts = Object.create(null);
    for (const n of needs) {
      const c = normalizeCat(n.category);
      counts[c] = (counts[c] || 0) + 1;
    }
    return CATEGORY_ORDER.map((cat) => ({
      name: cat,
      value: counts[cat] || 0,
      label: L.cat(cat),
      fill: CATEGORY_COLORS[cat] || "#94a3b8",
    })).filter((d) => d.value > 0);
  }, [needs]);

  const needsByCategoryQuantity = useMemo(() => {
    const sums = Object.create(null);
    for (const n of needs) {
      const c = normalizeCat(n.category);
      sums[c] = (sums[c] || 0) + (Number(n.quantity) || 0);
    }
    return CATEGORY_ORDER.map((cat) => ({
      name: cat, // raw key
      quantity: sums[cat] || 0,
    }));
  }, [needs]);

  const needsStatusByCategory = useMemo(() => {
    const base = CATEGORY_ORDER.map((cat) => ({
      category: cat,
      open: 0,
      pending: 0,
      fulfilled: 0,
    }));
    const idx = Object.fromEntries(CATEGORY_ORDER.map((c, i) => [c, i]));
    for (const n of needs) {
      const c = normalizeCat(n.category);
      const s = (n.status || "open").toLowerCase();
      const row = base[idx[c]];
      if (row && typeof row[s] === "number") row[s] += 1;
    }
    return base;
  }, [needs]);

  const needsCreatedPerDay = useMemo(() => {
    const map = new Map();
    for (const n of needs) {
      const d = fmtDate(n.createdAt);
      map.set(d, (map.get(d) || 0) + 1);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, count]) => ({ date, count }));
  }, [needs]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* -------- Volunteers: Status Pie + Gender Pie -------- */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Pie */}
          <div>
            <h2 className="text-lg text-center font-semibold mb-4">
              Könüllü Müraciətləri — Status
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {statusData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={STATUS_COLORS[i % STATUS_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gender Pie */}
          <div>
            <h2 className="text-lg text-center font-semibold mb-4">
              Könüllü Müraciətləri — Cinsiyyət
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {genderPieData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={GENDER_COLORS[i % GENDER_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Volunteers: Ümumi Qəbul / İmtina */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-10">
        <h2 className="text-lg font-semibold mb-4">
          Könüllü Müraciətləri — Ümumi Qəbul / İmtina
        </h2>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart
            data={totalsBarData}
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="value"
              name="Say"
              fill="#10b981"
              radius={[8, 8, 0, 0]}
              label={{ position: "top" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ---------------- Needs: 4 CHART ---------------- */}
      <h2 className="text-xl font-semibold mb-4">Ehtiyac Analitikası</h2>
      {needsLoading ? (
        <div className="text-slate-600">Yüklənir…</div>
      ) : needsError ? (
        <div className="text-red-600">{needsError}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1) Kateqoriya üzrə ehtiyac sayı (Pie) */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-md font-semibold mb-3">
              Kateqoriya üzrə ehtiyac sayı
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={needsByCategoryCount}
                  dataKey="value"
                  nameKey="label"
                  outerRadius={110}
                  label
                >
                  {needsByCategoryCount.map((d) => (
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
                  payload={needsByCategoryCount.map((d) => ({
                    id: d.name,
                    value: d.label,
                    color: d.fill,
                    type: "circle",
                  }))}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 2) Kateqoriya üzrə ümumi miqdar (Bar) */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-md font-semibold mb-3">
              Kateqoriya üzrə ümumi miqdar
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={needsByCategoryQuantity}>
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
                  formatter={(value) => [value, "Miqdar"]}
                  labelFormatter={(lab) => L.cat(lab)}
                />
                <Legend formatter={(v) => (v === "quantity" ? "Miqdar" : v)} />
                <Bar dataKey="quantity">
                  {needsByCategoryQuantity.map((d) => (
                    <Cell
                      key={d.name}
                      fill={CATEGORY_COLORS[d.name] || "#94a3b8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 3) Kateqoriyaya görə status (stacked Bar) */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-md font-semibold mb-3">
              Kateqoriyaya görə status (stack)
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={needsStatusByCategory}>
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
          </div>

          {/* 4) Günə görə yeni ehtiyaclar (Line) */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-md font-semibold mb-3">
              Günə görə yeni ehtiyaclar
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={needsCreatedPerDay}>
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
          </div>
        </div>
      )}
    </div>
  );
}
