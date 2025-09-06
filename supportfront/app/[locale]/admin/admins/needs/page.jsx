"use client";

import { useEffect, useState } from "react";
import adminApi from "@/app/utils/adminApi";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

/* ---------- Constants ---------- */
const PAGE_SIZE_DEFAULT = 10;
const CATEGORIES = [
  "clothing",
  "food",
  "shelter",
  "health",
  "education",
  "other",
];
const PRIORITIES = ["low", "medium", "high", "urgent"];
const STATUSES = ["open", "pending", "fulfilled"];

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
    title: "Ehtiyaclar (Admin)",
    newNeed: "+ Yeni ehtiyac",
    searchPH: "Axtar (başlıq, təsvir, teqlər)",
    statusAll: "Status (hamısı)",
    categoryAll: "Kateqoriya (hamısı)",
    priorityAll: "Prioritet (hamısı)",

    thTitle: "Başlıq",
    thCategory: "Kateqoriya",
    thPriority: "Prioritet",
    thQuantity: "Miqdar",
    thStatus: "Status",
    thDeadline: "Son tarix",
    thActions: "Əməliyyatlar",

    loading: "Yüklənir…",
    noRecords: "Qeyd yoxdur",

    total: "Cəm",
    page: "Səhifə",
    perPage: "s/s",
    first: "« İlk",
    prev: "‹ Əvvəl",
    next: "Sonrakı ›",
    last: "Son »",

    btnFulfilled: "Tamamlandı",
    btnEdit: "Dəyiş",
    btnDelete: "Sil",

    toastFetchFail: "Məlumatlar gətirəli bilmədi",
    toastNeedUpdated: "Ehtiyac yeniləndi",
    toastNeedCreated: "Ehtiyac yaradıldı",
    toastSaveFail: "Yadda saxlanmadı",
    toastDeleteQ: "Bu ehtiyacı silmək istəyisiniz?",
    toastDeleted: "Silindi",
    toastDeleteFail: "Silmə uğursuz oldu",
    toastMarkFail: "Tamamlandı kimi işarələnmədi",
    toastMarked: "Tamamlandı",

    modalEdit: "Ehtiyaci dəyiş",
    modalCreate: "Ehtiyac yarat",

    secBasics: "Əsaslar",
    labelTitle: "Başlıq",
    labelCategory: "Kateqoriya",
    labelDescription: "Təsvir",
    titlePH: "mes., Uşaqlar üçün qış paltarları",
    descPH: "Bu ehtiyac haqqında qısa məlumat...",

    secQuantity: "Miqdar",
    labelAmount: "Say",
    labelUnit: "Vahid",
    unitPH: "ed, kg, qutu…",
    labelPriority: "Prioritet",

    secMeta: "Meta",
    labelStatus: "Status",
    labelDeadline: "Son tarix",
    labelTags: "Teqlər",
    tagsPH: "vergül, ilə, ayrılan, teqlər",

    secContact: "Əlaqə",
    labelLocation: "Yer",
    locationPH: "Şəhər / Rayon",
    labelContact: "Əlaqə",
    contactPH: "Ad, telefon ve ya email",

    btnCancel: "Ləğv et",
    btnSave: "Yadda saxla",
    btnCreate: "Yarat",

    sortNewest: "Ən yeni → Ən köhnə",
    sortOldest: "Ən köhnə → Ən yeni",
    sortPrioHL: "Prioritet (yüksək → aşağı)",
    sortPrioLH: "Prioritet (aşağı → yüksək)",
    sortDeadlineEL: "Son tarix (təzədən → gec)",
    sortDeadlineLE: "Son tarix (gec → təzədən)",
  },
};

/* ---------- Helpers ---------- */
function cls(...a) {
  return a.filter(Boolean).join(" ");
}
const L = {
  cat: (k) => AZ.categories[k] ?? k,
  pr: (k) => AZ.priorities[k] ?? k,
  st: (k) => AZ.statuses[k] ?? k,
};

export default function AdminNeedsPage() {
  /* ---------- List state ---------- */
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  /* ---------- Query state ---------- */
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [sort, setSort] = useState("-createdAt");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_SIZE_DEFAULT);

  /* ---------- Modal/Form state ---------- */
  const emptyForm = {
    _id: null,
    title: "",
    category: "other",
    description: "",
    quantity: 1,
    unit: "pcs", // backend-ə toxunmuruq
    priority: "medium",
    status: "open",
    deadline: "",
    location: "",
    contact: "",
    tags: "", // comma separated in UI
  };
  const [form, setForm] = useState(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const editing = Boolean(form._id);

  /* ---------- Fetch list ---------- */
  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get("/needs", {
        params: { search, status, category, priority, page, limit, sort },
      });
      setItems(res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch (e) {
      toast.error(AZ.ui.toastFetchFail);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, category, priority, page, limit, sort]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  /* ---------- CRUD Actions ---------- */
  const openCreate = () => {
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (it) => {
    setForm({
      _id: it._id,
      title: it.title || "",
      category: it.category || "other",
      description: it.description || "",
      quantity: it.quantity ?? 1,
      unit: it.unit || "pcs",
      priority: it.priority || "medium",
      status: it.status || "open",
      deadline: it.deadline ? String(it.deadline).slice(0, 10) : "",
      location: it.location || "",
      contact: it.contact || "",
      tags: (it.tags || []).join(", "),
    });
    setModalOpen(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      quantity: Number(form.quantity) || 0,
      tags: form.tags,
    };
    try {
      if (editing) {
        await adminApi.put(`/needs/${form._id}`, payload);
        toast.success(AZ.ui.toastNeedUpdated);
      } else {
        await adminApi.post("/needs", payload);
        toast.success(AZ.ui.toastNeedCreated);
      }
      setModalOpen(false);
      fetchList();
    } catch (err) {
      toast.error(err?.response?.data?.message || AZ.ui.toastSaveFail);
    }
  };

  const remove = async (id) => {
    if (!confirm(AZ.ui.toastDeleteQ)) return;
    try {
      await adminApi.delete(`/needs/${id}`);
      toast.success(AZ.ui.toastDeleted);
      if (items.length === 1 && page > 1) setPage((p) => p - 1);
      else fetchList();
    } catch {
      toast.error(AZ.ui.toastDeleteFail);
    }
  };

  const markFulfilled = async (id) => {
    try {
      await adminApi.post(`/needs/${id}/fulfill`);
    } catch {
      toast.error(AZ.ui.toastMarkFail);
      return;
    }
    toast.success(AZ.ui.toastMarked);
    fetchList();
  };

  /* ---------- Render ---------- */
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{AZ.ui.title}</h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 shadow"
        >
          {AZ.ui.newNeed}
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-6 gap-3">
        <input
          placeholder={AZ.ui.searchPH}
          className="border rounded px-3 py-2 md:col-span-2"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <select
          className="border rounded px-3 py-2"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">{AZ.ui.statusAll}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {L.st(s)}
            </option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-2"
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value);
          }}
        >
          <option value="">{AZ.ui.categoryAll}</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {L.cat(c)}
            </option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-2"
          value={priority}
          onChange={(e) => {
            setPage(1);
            setPriority(e.target.value);
          }}
        >
          <option value="">{AZ.ui.priorityAll}</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {L.pr(p)}
            </option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-2"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="-createdAt">{AZ.ui.sortNewest}</option>
          <option value="createdAt">{AZ.ui.sortOldest}</option>
          <option value="-priority">{AZ.ui.sortPrioHL}</option>
          <option value="priority">{AZ.ui.sortPrioLH}</option>
          <option value="deadline">{AZ.ui.sortDeadlineEL}</option>
          <option value="-deadline">{AZ.ui.sortDeadlineLE}</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">{AZ.ui.thTitle}</th>
              <th className="p-3 text-left">{AZ.ui.thCategory}</th>
              <th className="p-3 text-left">{AZ.ui.thPriority}</th>
              <th className="p-3 text-left">{AZ.ui.thQuantity}</th>
              <th className="p-3 text-left">{AZ.ui.thStatus}</th>
              <th className="p-3 text-left">{AZ.ui.thDeadline}</th>
              <th className="p-3 text-right">{AZ.ui.thActions}</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  {AZ.ui.loading}
                </td>
              </tr>
            )}

            {!loading &&
              items.map((it) => (
                <tr key={it._id} className="border-t">
                  <td className="p-3 align-top">
                    <div className="font-medium text-gray-900">{it.title}</div>
                    {it.description && (
                      <div className="text-xs text-gray-500 line-clamp-2">
                        {it.description}
                      </div>
                    )}
                    {it.tags?.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {it.tags.map((tg, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100"
                          >
                            {tg}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-3 align-top">{L.cat(it.category)}</td>
                  <td className="p-3 align-top">{L.pr(it.priority)}</td>
                  <td className="p-3 align-top">
                    {it.quantity} {it.unit}
                  </td>
                  <td className="p-3 align-top">
                    <span
                      className={cls(
                        "px-2 py-1 rounded text-xs",
                        it.status === "fulfilled"
                          ? "bg-emerald-100 text-emerald-800"
                          : it.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-sky-100 text-sky-800"
                      )}
                    >
                      {L.st(it.status)}
                    </span>
                  </td>
                  <td className="p-3 align-top">
                    {it.deadline
                      ? new Date(it.deadline).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-3 text-right space-x-2 align-top">
                    {it.status !== "fulfilled" && (
                      <button
                        onClick={() => markFulfilled(it._id)}
                        className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {AZ.ui.btnFulfilled}
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(it)}
                      className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {AZ.ui.btnEdit}
                    </button>
                    <button
                      onClick={() => remove(it._id)}
                      className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white"
                    >
                      {AZ.ui.btnDelete}
                    </button>
                  </td>
                </tr>
              ))}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  {AZ.ui.noRecords}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {AZ.ui.total} {total} • {AZ.ui.page} {page} / {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="border rounded px-2 py-1"
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(Number(e.target.value));
            }}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}/{AZ.ui.perPage}
              </option>
            ))}
          </select>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            {AZ.ui.first}
          </button>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            {AZ.ui.prev}
          </button>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            {AZ.ui.next}
          </button>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >
            {AZ.ui.last}
          </button>
        </div>
      </div>

      {/* Create/Edit Modal — tidy layout */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ type: "spring", stiffness: 160, damping: 16 }}
              className="relative z-10 w-full max-w-3xl rounded-2xl bg-white shadow-xl border border-gray-200"
            >
              {/* Sticky header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-white/95 backdrop-blur">
                <h3 className="text-lg font-semibold">
                  {editing ? AZ.ui.modalEdit : AZ.ui.modalCreate}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable body */}
              <form
                onSubmit={submitForm}
                className="max-h-[85vh] overflow-y-auto px-6 py-5"
              >
                {/* Basics */}
                <Section title={AZ.ui.secBasics}>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <Field label={AZ.ui.labelTitle} className="md:col-span-8">
                      <input
                        className="w-full border rounded px-3 py-2"
                        placeholder={AZ.ui.titlePH}
                        value={form.title}
                        onChange={(e) =>
                          setForm({ ...form, title: e.target.value })
                        }
                        required
                      />
                    </Field>

                    <Field
                      label={AZ.ui.labelCategory}
                      className="md:col-span-4"
                    >
                      <select
                        className="w-full border rounded px-3 py-2"
                        value={form.category}
                        onChange={(e) =>
                          setForm({ ...form, category: e.target.value })
                        }
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {L.cat(c)}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      label={AZ.ui.labelDescription}
                      className="md:col-span-12"
                    >
                      <textarea
                        className="w-full border rounded px-3 py-2"
                        rows={4}
                        placeholder={AZ.ui.descPH}
                        value={form.description}
                        onChange={(e) =>
                          setForm({ ...form, description: e.target.value })
                        }
                      />
                    </Field>
                  </div>
                </Section>

                {/* Quantity */}
                <Section title={AZ.ui.secQuantity}>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <Field label={AZ.ui.labelAmount} className="md:col-span-4">
                      <input
                        type="number"
                        min={0}
                        className="w-full border rounded px-3 py-2"
                        value={form.quantity}
                        onChange={(e) =>
                          setForm({ ...form, quantity: e.target.value })
                        }
                      />
                    </Field>
                    <Field label={AZ.ui.labelUnit} className="md:col-span-4">
                      <input
                        className="w-full border rounded px-3 py-2"
                        placeholder={AZ.ui.unitPH}
                        value={form.unit}
                        onChange={(e) =>
                          setForm({ ...form, unit: e.target.value })
                        }
                      />
                    </Field>
                    <Field
                      label={AZ.ui.labelPriority}
                      className="md:col-span-4"
                    >
                      <select
                        className="w-full border rounded px-3 py-2"
                        value={form.priority}
                        onChange={(e) =>
                          setForm({ ...form, priority: e.target.value })
                        }
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {L.pr(p)}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </Section>

                {/* Meta */}
                <Section title={AZ.ui.secMeta}>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <Field label={AZ.ui.labelStatus} className="md:col-span-4">
                      <select
                        className="w-full border rounded px-3 py-2"
                        value={form.status}
                        onChange={(e) =>
                          setForm({ ...form, status: e.target.value })
                        }
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {L.st(s)}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field
                      label={AZ.ui.labelDeadline}
                      className="md:col-span-4"
                    >
                      <input
                        type="date"
                        className="w-full border rounded px-3 py-2"
                        value={form.deadline}
                        onChange={(e) =>
                          setForm({ ...form, deadline: e.target.value })
                        }
                      />
                    </Field>
                    <Field label={AZ.ui.labelTags} className="md:col-span-4">
                      <input
                        className="w-full border rounded px-3 py-2"
                        placeholder={AZ.ui.tagsPH}
                        value={form.tags}
                        onChange={(e) =>
                          setForm({ ...form, tags: e.target.value })
                        }
                      />
                    </Field>
                  </div>
                </Section>

                {/* Contact */}
                <Section title={AZ.ui.secContact}>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <Field
                      label={AZ.ui.labelLocation}
                      className="md:col-span-6"
                    >
                      <input
                        className="w-full border rounded px-3 py-2"
                        placeholder={AZ.ui.locationPH}
                        value={form.location}
                        onChange={(e) =>
                          setForm({ ...form, location: e.target.value })
                        }
                      />
                    </Field>
                    <Field label={AZ.ui.labelContact} className="md:col-span-6">
                      <input
                        className="w-full border rounded px-3 py-2"
                        placeholder={AZ.ui.contactPH}
                        value={form.contact}
                        onChange={(e) =>
                          setForm({ ...form, contact: e.target.value })
                        }
                      />
                    </Field>
                  </div>
                </Section>

                {/* Footer buttons */}
                <div className="mt-6 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded border"
                  >
                    {AZ.ui.btnCancel}
                  </button>
                  <button className="px-4 py-2 rounded bg-blue-600 text-white">
                    {editing ? AZ.ui.btnSave : AZ.ui.btnCreate}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Small UI helpers ---------- */

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <h4 className="mb-3 text-sm font-semibold text-gray-700">{title}</h4>
      {children}
    </div>
  );
}

function Field({ label, className, children }) {
  return (
    <div className={cls("flex flex-col", className)}>
      <label className="mb-1.5 text-xs font-medium text-gray-600">
        {label}
      </label>
      {children}
    </div>
  );
}
