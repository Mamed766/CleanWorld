"use client";

import React, { useEffect, useMemo, useState } from "react";
import adminApi from "@/app/utils/adminApi";
import PermissionWrapper from "@/app/_components/Permission/PermissionWrapper";

/* --- sabitler / UI etiketləri (value-lar backend üçün dəyişməzdir) --- */
const categories = [
  { value: "", label: "Bütün əsas kateqoriyalar" },
  { value: "none", label: "—" },
  { value: "clothing", label: "Geyim" },
  { value: "food", label: "Qida" },
  { value: "school", label: "Məktəb" },
  { value: "mixed", label: "Qarışıq" },
];

const typeOptions = [
  { value: "", label: "Bütün tiplər" },
  { value: "money", label: "Pul" },
  { value: "goods", label: "Əşya" },
];

// [bundle:xxxxxxxx-xxxx-...] şeklini yakalar
const BUNDLE_RE = /\[bundle:([a-z0-9-]+)\]/i;
const extractBundleId = (note) => {
  if (!note) return null;
  const m = String(note).match(BUNDLE_RE);
  return m ? m[1] : null;
};
const makeBundleId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

/* ============================================================
   Ana Sayfa (Sade & Hatasız) — UI Azərbaycan dilində
============================================================ */
export default function AdminDonationsPage() {
  /* ---- filtreler ---- */
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [start, setStart] = useState(""); // yyyy-mm-dd
  const [end, setEnd] = useState(""); // yyyy-mm-dd
  const [sort, setSort] = useState("-createdAt");

  /* ---- listeleme ---- */
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [summary, setSummary] = useState({ totalMoney: 0, count: 0 });

  /* ---- modal / form ---- */
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);

  /* ---- grouped görünüm ---- */
  const [groupBundles, setGroupBundles] = useState(true);
  const [expanded, setExpanded] = useState({}); // { "bundle:xxx": true }

  /* ---- arama debounce ---- */
  const [qDebounced, setQDebounced] = useState(q);
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  /* ---- paramlar ---- */
  const params = useMemo(() => {
    const p = { page, limit, sort };
    if (qDebounced) p.q = qDebounced;
    if (type) p.type = type;
    if (category) p.category = category;
    if (start) p.start = new Date(start).toISOString();
    if (end) p.end = new Date(end).toISOString();
    return p;
  }, [qDebounced, type, category, start, end, page, limit, sort]);

  /* ---- fetch ---- */
  async function fetchList() {
    setLoading(true);
    try {
      const res = await adminApi.get("/admin/donations", { params });
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 0);
      setSummary(res.data.summary || { totalMoney: 0, count: 0 });
    } catch (e) {
      console.error(e);
      alert("Siyahı gətirilə bilmədi");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  function resetFilters() {
    setQ("");
    setType("");
    setCategory("");
    setStart("");
    setEnd("");
    setSort("-createdAt");
    setPage(1);
    setLimit(20);
  }

  /* ---- bundle haritası (tek kaynak gerçek id’ler) ---- */
  const { viewRows, bundleMap } = useMemo(() => {
    // bundleKey: "bundle:<id>" -> {children: Donation[], summary: SummaryRow}
    const map = new Map();
    const singles = [];

    for (const r of items) {
      const bid = extractBundleId(r.note);
      if (!bid) {
        singles.push(r);
      } else {
        const key = `bundle:${bid}`;
        if (!map.has(key)) map.set(key, { children: [] });
        map.get(key).children.push(r);
      }
    }

    // summary satırlarını üret
    const summaries = [];
    for (const [key, { children }] of map.entries()) {
      // görünüm için basit özet alanları
      const donorName = children[0]?.donorName || "-";
      const createdAt = children
        .slice()
        .sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        )[0].createdAt;
      const note = children.find((c) => !!c.note)?.note || "";
      const money = children.find((c) => c.donationType === "money");
      const goods = children.find((c) => c.donationType === "goods");
      const currency = money?.currency || "AZN";
      const amount = money?.amount || 0;
      const majorCategory = goods?.majorCategory || "mixed";

      summaries.push({
        _id: key, // fake id SADECE render için
        donorName,
        donationType:
          money && goods ? "Money + Goods" : children[0]?.donationType || "-",
        amount,
        currency,
        majorCategory,
        createdAt,
        note,
        _isBundleSummary: true,
        _bundleCount: children.length,
      });
    }

    // görünüm listesi: singles + summaries
    let out = [...singles, ...summaries];

    // sıralama (createdAt/amount destekli)
    if (sort === "-createdAt")
      out.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "createdAt")
      out.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sort === "-amount")
      out.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    if (sort === "amount")
      out.sort((a, b) => (a.amount || 0) - (b.amount || 0));

    // grouped açık değilse yalnızca gerçek satırlar
    if (!groupBundles) {
      out = items;
    }

    // map’i objeye çevir (silmede kullanacağız)
    const obj = {};
    for (const [k, v] of map.entries()) obj[k] = v;
    return { viewRows: out, bundleMap: obj };
  }, [items, sort, groupBundles]);

  /* ---- tek kayıt sil ---- */
  async function removeRow(id) {
    if (!id) return;
    if (!confirm("Silinsin?")) return;
    try {
      await adminApi.delete(`/admin/donations/${id}`);
      fetchList();
    } catch (e) {
      console.error(e);
      alert("Silinmədi");
    }
  }

  /* ---- bundle sil (GERÇEK id’lerle) ---- */
  async function removeBundle(bundleKey) {
    const pack = bundleMap[bundleKey];
    const children = pack?.children || [];
    if (!children.length) return;
    if (!confirm(`Bu bundle içindəki ${children.length} qeyd silinsin?`))
      return;

    try {
      await Promise.all(
        children.map((c) => adminApi.delete(`/admin/donations/${c._id}`))
      );
      setExpanded((p) => ({ ...p, [bundleKey]: false }));
      fetchList();
    } catch (e) {
      console.error(e);
      alert("Bundle silinmədi");
    }
  }

  /* ---- modal aç/kapa ---- */
  function openCreate() {
    setEditing(null);
    setOpenModal(true);
  }
  function openEdit(row) {
    if (row?._isBundleSummary) return; // özet satırı düzenlenmez
    setEditing(row);
    setOpenModal(true);
  }

  return (
    <PermissionWrapper permission={"donation_editor"}>
      <div className="min-h-screen bg-white px-6 py-8 text-gray-900">
        <div className="mx-auto max-w-7xl">
          {/* Üst */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold">İanələr (Admin)</h1>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={groupBundles}
                  onChange={(e) => {
                    setGroupBundles(e.target.checked);
                    setExpanded({});
                  }}
                />
                Bundle-ları qrupla
              </label>
              <button
                onClick={openCreate}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                + Yeni
              </button>
              <button
                onClick={resetFilters}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              >
                Sıfırla
              </button>
            </div>
          </div>

          {/* Filtreler (sade) */}
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-6">
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Donora və ya qeydə görə axtar…"
              className="md:col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            >
              {typeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={start}
              onChange={(e) => {
                setStart(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="date"
              value={end}
              onChange={(e) => {
                setEnd(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="-createdAt">Ən yenilər</option>
              <option value="createdAt">Ən köhnələr</option>
              <option value="-amount">Məbləğ ↓</option>
              <option value="amount">Məbləğ ↑</option>
            </select>
          </div>

          {/* Özet */}
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
            <strong>Cəm:</strong> {summary.count} &nbsp;•&nbsp;{" "}
            <strong>Cəm məbləğ:</strong> {summary.totalMoney}
          </div>

          {/* Tablo */}
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <Th>Donor</Th>
                  <Th>Tip</Th>
                  <Th>Məbləğ</Th>
                  <Th>Əsas kateqoriya</Th>
                  <Th>Yaradılma</Th>
                  <Th>Əməliyyatlar</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">
                      Yüklənir...
                    </td>
                  </tr>
                ) : viewRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">
                      Məlumat yoxdur
                    </td>
                  </tr>
                ) : (
                  viewRows.map((row) => {
                    const isBundle = !!row._isBundleSummary;
                    const bundleKey = isBundle ? row._id : null;
                    const open = isBundle ? !!expanded[bundleKey] : false;

                    return (
                      <React.Fragment key={row._id}>
                        <tr className={isBundle ? "bg-gray-50" : ""}>
                          <Td>
                            <div className="font-medium">{row.donorName}</div>
                            {!!row.note && (
                              <div className="text-gray-500">{row.note}</div>
                            )}
                            {isBundle && (
                              <div className="mt-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                                Bundle ({row._bundleCount})
                              </div>
                            )}
                          </Td>
                          <Td className="capitalize">{row.donationType}</Td>
                          <Td>
                            {String(row.donationType)
                              .toLowerCase()
                              .includes("money") ? (
                              <>
                                {row.amount ?? 0} {row.currency || "AZN"}
                              </>
                            ) : (
                              <span className="text-gray-500">—</span>
                            )}
                          </Td>
                          <Td className="capitalize">
                            {row.majorCategory || "—"}
                          </Td>
                          <Td>{new Date(row.createdAt).toLocaleString()}</Td>
                          <Td>
                            <div className="flex flex-wrap gap-2">
                              {isBundle ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpanded((p) => ({
                                        ...p,
                                        [bundleKey]: !p[bundleKey],
                                      }))
                                    }
                                    className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-100"
                                  >
                                    {open
                                      ? "Bundle-ı gizlət"
                                      : "Bundle-ı göstər"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeBundle(bundleKey)}
                                    className="rounded-md border border-gray-300 px-3 py-1 text-red-600 hover:bg-red-50"
                                  >
                                    Bundle-ı sil
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openEdit(row)}
                                    className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-100"
                                  >
                                    Redaktə et
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeRow(row._id)}
                                    className="rounded-md border border-gray-300 px-3 py-1 text-red-600 hover:bg-red-50"
                                  >
                                    Sil
                                  </button>
                                </>
                              )}
                            </div>
                          </Td>
                        </tr>

                        {/* bundle açılımı */}
                        {isBundle && open && (
                          <tr className="bg-gray-50/60">
                            <td colSpan={6} className="p-0">
                              <div className="px-4 py-3">
                                <div className="mb-2 text-xs font-semibold text-gray-600">
                                  Bundle elementləri
                                </div>
                                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                                  <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <Th>Donor</Th>
                                        <Th>Tip</Th>
                                        <Th>Məbləğ</Th>
                                        <Th>Əsas kateqoriya</Th>
                                        <Th>Yaradılma</Th>
                                        <Th>Əməliyyatlar</Th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {(
                                        bundleMap[bundleKey]?.children || []
                                      ).map((c) => (
                                        <tr
                                          key={c._id}
                                          className="hover:bg-gray-50"
                                        >
                                          <Td>
                                            <div className="font-medium">
                                              {c.donorName}
                                            </div>
                                            {!!c.note && (
                                              <div className="text-gray-500">
                                                {c.note}
                                              </div>
                                            )}
                                          </Td>
                                          <Td className="capitalize">
                                            {c.donationType}
                                          </Td>
                                          <Td>
                                            {c.donationType === "money" ? (
                                              <>
                                                {c.amount} {c.currency || "AZN"}
                                              </>
                                            ) : (
                                              <span className="text-gray-500">
                                                —
                                              </span>
                                            )}
                                          </Td>
                                          <Td className="capitalize">
                                            {c.majorCategory || "—"}
                                          </Td>
                                          <Td>
                                            {new Date(
                                              c.createdAt
                                            ).toLocaleString()}
                                          </Td>
                                          <Td>
                                            <div className="flex gap-2">
                                              <button
                                                type="button"
                                                onClick={() => openEdit(c)}
                                                className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-100"
                                              >
                                                Redaktə et
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => removeRow(c._id)}
                                                className="rounded-md border border-gray-300 px-3 py-1 text-red-600 hover:bg-red-50"
                                              >
                                                Sil
                                              </button>
                                            </div>
                                          </Td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div>
              Səhifə {page} / {pages || 1} • Cəmi {total}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 px-2 py-1"
              >
                {[10, 20, 30, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n} / səhifə
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-gray-300 px-3 py-1 disabled:opacity-50"
              >
                Əvvəlki
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((p) => (pages ? Math.min(pages, p + 1) : p + 1))
                }
                disabled={pages ? page >= pages : false}
                className="rounded-lg border border-gray-300 px-3 py-1 disabled:opacity-50"
              >
                Sonrakı
              </button>
            </div>
          </div>
        </div>

        {/* Modal */}
        {openModal && (
          <Modal onClose={() => setOpenModal(false)}>
            <DonationForm
              initial={editing}
              onSaved={() => {
                setOpenModal(false);
                fetchList();
              }}
            />
          </Modal>
        )}
      </div>
    </PermissionWrapper>
  );
}

/* ------- ufak yardımcılar ------- */
function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}
function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">İanə</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm hover:bg-gray-50"
          >
            Bağla
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ============================================================
   Form (sade; çift kayıt -> bundle tag) — UI Azərbaycan dilində
============================================================ */
function DonationForm({ initial, onSaved }) {
  const isEdit = !!initial?._id;

  // aktiv tiplər
  const [sendMoney, setSendMoney] = useState(
    isEdit ? initial.donationType === "money" : true
  );
  const [sendGoods, setSendGoods] = useState(
    isEdit ? initial.donationType === "goods" : false
  );

  // ortaq sahələr
  const [donorName, setDonorName] = useState(initial?.donorName || "");
  const [note, setNote] = useState(initial?.note || "");

  // money
  const [amount, setAmount] = useState(
    initial?.donationType === "money" ? Number(initial?.amount || 0) : 0
  );
  const [currency, setCurrency] = useState(
    (initial?.donationType === "money" && initial?.currency) || "AZN"
  );

  // goods
  const [majorCategory, setMajorCategory] = useState(
    initial?.donationType === "goods"
      ? initial?.majorCategory || "none"
      : "none"
  );
  const [items, setItems] = useState(
    initial?.donationType === "goods" ? initial?.items || [] : []
  );

  const [submitting, setSubmitting] = useState(false);

  const addItem = () =>
    setItems((arr) => [
      ...arr,
      { category: "clothing", name: "", quantity: 1, unit: "pcs" },
    ]);
  const upd = (i, k, v) =>
    setItems((arr) => {
      const cp = [...arr];
      cp[i] = { ...cp[i], [k]: v };
      return cp;
    });
  const delItem = (i) =>
    setItems((arr) => {
      const cp = [...arr];
      cp.splice(i, 1);
      return cp;
    });

  async function submit(e) {
    e.preventDefault();
    if (submitting) return;

    if (!donorName.trim()) return alert("Donorun adı vacibdir");
    if (!sendMoney && !sendGoods)
      return alert("Ən azı bir tip seçin (Pul və ya Əşya)");

    setSubmitting(true);
    try {
      const wantsMoney = sendMoney;
      const wantsGoods = sendGoods;
      const wantsBoth = wantsMoney && wantsGoods;

      // eyni bundle id-ni hər iki istəyə yaz
      let bundleId = extractBundleId(note);
      if (wantsBoth && !bundleId) bundleId = makeBundleId();
      const withBundleNote = wantsBoth
        ? `${note || ""} [bundle:${bundleId}]`.trim()
        : note || "";

      if (isEdit) {
        const t = initial.donationType; // mövcud tip
        const ops = [];

        // mövcud qeydi yenilə
        if (t === "money" && wantsMoney) {
          ops.push(
            adminApi.patch(`/admin/donations/${initial._id}`, {
              donorName,
              donationType: "money",
              amount: Number(amount || 0),
              currency: currency || "AZN",
              note: withBundleNote,
              items: [],
              majorCategory: "none",
            })
          );
        }
        if (t === "goods" && wantsGoods) {
          ops.push(
            adminApi.patch(`/admin/donations/${initial._id}`, {
              donorName,
              donationType: "goods",
              amount: 0,
              currency: currency || "AZN",
              note: withBundleNote,
              items,
              majorCategory,
            })
          );
        }

        // digər tip tələb olunursa yeni qeyd
        if (t === "money" && wantsGoods) {
          ops.push(
            adminApi.post(`/admin/donations`, {
              donorName,
              donationType: "goods",
              amount: 0,
              currency: currency || "AZN",
              note: withBundleNote,
              items,
              majorCategory,
            })
          );
        }
        if (t === "goods" && wantsMoney) {
          ops.push(
            adminApi.post(`/admin/donations`, {
              donorName,
              donationType: "money",
              amount: Number(amount || 0),
              currency: currency || "AZN",
              note: withBundleNote,
              items: [],
              majorCategory: "none",
            })
          );
        }

        await Promise.all(ops);
        onSaved?.();
        return;
      }

      // CREATE
      const ops = [];
      if (wantsMoney) {
        ops.push(
          adminApi.post(`/admin/donations`, {
            donorName,
            donationType: "money",
            amount: Number(amount || 0),
            currency: currency || "AZN",
            note: withBundleNote,
            items: [],
            majorCategory: "none",
          })
        );
      }
      if (wantsGoods) {
        ops.push(
          adminApi.post(`/admin/donations`, {
            donorName,
            donationType: "goods",
            amount: 0,
            currency: currency || "AZN",
            note: withBundleNote,
            items,
            majorCategory,
          })
        );
      }

      await Promise.all(ops);
      onSaved?.();
    } catch (err) {
      console.error(err);
      alert("Yadda saxlanmadı");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* tip seçimi */}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2 rounded-lg border border-gray-300 p-3 text-sm">
          <input
            type="checkbox"
            checked={sendMoney}
            onChange={(e) => setSendMoney(e.target.checked)}
          />
          <span className="font-medium">Pul göndər</span>
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-gray-300 p-3 text-sm">
          <input
            type="checkbox"
            checked={sendGoods}
            onChange={(e) => setSendGoods(e.target.checked)}
          />
          <span className="font-medium">Əşya göndər</span>
        </label>
      </div>

      {/* ortaq */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Donorun adı
          </label>
          <input
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            placeholder="Ad Soyad"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Qeyd
          </label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            placeholder="Açıqlama…"
          />
        </div>
      </div>

      {/* money */}
      {sendMoney && (
        <div className="rounded-xl border border-gray-200 p-3">
          <div className="mb-2 text-sm font-medium">Pul</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Məbləğ
              </label>
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value || 0))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Valyuta
              </label>
              <input
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="AZN"
              />
            </div>
          </div>
        </div>
      )}

      {/* goods */}
      {sendGoods && (
        <div className="rounded-xl border border-gray-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium">Əşyalar</div>
            <button
              type="button"
              onClick={addItem}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
            >
              + Element əlavə et
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Əsas kateqoriya
              </label>
              <select
                value={majorCategory}
                onChange={(e) => setMajorCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="mt-2 text-sm text-gray-500">Element yoxdur</div>
          ) : (
            <div className="mt-2 space-y-2">
              {items.map((it, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 items-center gap-2 rounded-lg bg-gray-50 p-2"
                >
                  <select
                    value={it.category}
                    onChange={(e) => upd(i, "category", e.target.value)}
                    className="col-span-3 rounded-md border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="clothing">Geyim</option>
                    <option value="food">Qida</option>
                    <option value="school">Məktəb</option>
                    <option value="other">Digər</option>
                  </select>
                  <input
                    value={it.name}
                    onChange={(e) => upd(i, "name", e.target.value)}
                    placeholder="Ad"
                    className="col-span-4 rounded-md border border-gray-300 px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    min={0}
                    value={it.quantity}
                    onChange={(e) =>
                      upd(i, "quantity", Number(e.target.value || 0))
                    }
                    placeholder="Say"
                    className="col-span-2 rounded-md border border-gray-300 px-2 py-1 text-sm"
                  />
                  <input
                    value={it.unit}
                    onChange={(e) => upd(i, "unit", e.target.value)}
                    placeholder="Vahid"
                    className="col-span-2 rounded-md border border-gray-300 px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => delItem(i)}
                    className="col-span-1 rounded-md border border-gray-300 px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                    aria-label="Sil"
                    title="Sil"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isEdit
            ? submitting
              ? "Yadda saxlanır..."
              : "Yadda saxla"
            : submitting
            ? "Yaradılır..."
            : "Yarat"}
        </button>
      </div>
    </form>
  );
}
