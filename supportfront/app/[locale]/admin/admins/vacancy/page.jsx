"use client";

import { useEffect, useMemo, useState } from "react";
import adminApi from "@/app/utils/adminApi";
import { toast } from "react-toastify";

export default function AdminVacanciesPage() {
  const [vacancies, setVacancies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showApps, setShowApps] = useState(false);

  // LANG + FORM
  const [langTab, setLangTab] = useState("AZ");
  const [form, setForm] = useState({
    title_az: "",
    title_en: "",
    department_az: "",
    department_en: "",
    location_az: "",
    location_en: "",
    type: "full-time",
    description_az: "",
    description_en: "",
    requirements_az: "",
    requirements_en: "",
    deadline: "",
  });

  // ---- Helpers ----
  const safe = (v, ...keys) => {
    for (const k of keys) {
      const val = v?.[k];
      if (val && String(val).trim() !== "") return val;
    }
    return "";
  };

  const API_BASE = (process.env.NEXT_PUBLIC_API || "").replace(/\/$/, "");
  const fileUrl = (p = "") => `${API_BASE}/${String(p).replace(/^\//, "")}`;

  // ---- Data ----
  // AZ + EN fetch edib _id üzrə birləşdiririk ki, title_az və title_en eyni obyektin içində olsun
  const fetchVacancies = async () => {
    try {
      const [azRes, enRes] = await Promise.all([
        adminApi.get("/vacancies", { params: { lang: "az" } }),
        adminApi.get("/vacancies", { params: { lang: "en" } }),
      ]);

      const az = azRes.data?.data || [];
      const en = enRes.data?.data || [];

      const norm = (v) => (typeof v === "string" ? v.trim() : v);

      const byId = new Map();

      // AZ-ləri yığ
      for (const v of az) {
        byId.set(v._id, {
          _id: v._id,
          type: v.type,
          deadline: v.deadline,
          // backend lokalizə olunmuş 'title' qaytarırsa onu *_az kimi yazırıq
          title_az: norm(v.title_az ?? v.title),
          department_az: norm(v.department_az ?? v.department),
          location_az: norm(v.location_az ?? v.location),
          description_az: norm(v.description_az ?? v.description),
          requirements_az: norm(v.requirements_az ?? v.requirements),
        });
      }

      // EN-ləri merge et
      for (const v of en) {
        const cur = byId.get(v._id) || { _id: v._id };
        cur.type = cur.type || v.type;
        cur.deadline = cur.deadline || v.deadline;

        cur.title_en = norm(v.title_en ?? v.title);
        cur.department_en = norm(v.department_en ?? v.department);
        cur.location_en = norm(v.location_en ?? v.location);
        cur.description_en = norm(v.description_en ?? v.description);
        cur.requirements_en = norm(v.requirements_en ?? v.requirements);

        byId.set(v._id, cur);
      }

      setVacancies(Array.from(byId.values()));
    } catch {
      toast.error("Vakansiyalar yüklenemedi");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminApi.post("/vacancies", form);
      toast.success("Vakansiya oluşturuldu");
      setForm({
        title_az: "",
        title_en: "",
        department_az: "",
        department_en: "",
        location_az: "",
        location_en: "",
        type: "full-time",
        description_az: "",
        description_en: "",
        requirements_az: "",
        requirements_en: "",
        deadline: "",
      });
      fetchVacancies();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Hata oluştu");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;
    try {
      await adminApi.delete(`/vacancies/${id}`);
      toast.success("Silindi");
      fetchVacancies();
    } catch {
      toast.error("Silme sırasında hata");
    }
  };

  const handleViewApplications = async (vacancyId) => {
    try {
      const res = await adminApi.get(`/vacancies/${vacancyId}/applications`);
      setApplications(res.data?.data || []);
      setShowApps(true);
    } catch {
      toast.error("Başvurular yüklenemedi");
    }
  };

  useEffect(() => {
    fetchVacancies();
  }, []);

  // =========================
  // Başvurular Modal: Search + Pagination (4'lük)
  // =========================
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 4;

  // modal açıldığında / data değiştiğinde resetle
  useEffect(() => {
    if (showApps) {
      setSearch("");
      setPage(1);
    }
  }, [showApps, applications.length]);

  const filteredApps = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter((a) => {
      const fullName = (a.fullName || "").toLowerCase();
      const email = (a.email || "").toLowerCase();
      const phone = (a.phone || "").toLowerCase();
      return fullName.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [applications, search]);

  const totalPages = Math.max(1, Math.ceil(filteredApps.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const currentSlice = filteredApps.slice(pageStart, pageStart + pageSize);

  const goPage = (p) => {
    if (p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    setPage(p);
  };
  // =========================

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Vakansiyalar (Admin)</h1>

      {/* Form Card */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8 border border-gray-100">
        {/* Language Switch */}
        <div className="flex mb-4 gap-2">
          <button
            type="button"
            onClick={() => setLangTab("AZ")}
            className={`px-4 py-2 rounded-t-md font-semibold transition ${
              langTab === "AZ"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            AZ
          </button>
          <button
            type="button"
            onClick={() => setLangTab("EN")}
            className={`px-4 py-2 rounded-t-md font-semibold transition ${
              langTab === "EN"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            EN
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          {/* AZ fields */}
          {langTab === "AZ" && (
            <>
              <input
                className="border p-2 w-full rounded"
                placeholder="Başlıq (AZ)"
                value={form.title_az}
                onChange={(e) => setForm({ ...form, title_az: e.target.value })}
              />
              <input
                className="border p-2 w-full rounded"
                placeholder="Şöbə (AZ)"
                value={form.department_az}
                onChange={(e) =>
                  setForm({ ...form, department_az: e.target.value })
                }
              />
              <input
                className="border p-2 w-full rounded"
                placeholder="Lokasiya (AZ)"
                value={form.location_az}
                onChange={(e) =>
                  setForm({ ...form, location_az: e.target.value })
                }
              />
              <textarea
                className="border p-2 w-full rounded"
                placeholder="Açıqlama (AZ)"
                value={form.description_az}
                onChange={(e) =>
                  setForm({ ...form, description_az: e.target.value })
                }
              />
              <textarea
                className="border p-2 w-full rounded"
                placeholder="Tələblər (AZ)"
                value={form.requirements_az}
                onChange={(e) =>
                  setForm({ ...form, requirements_az: e.target.value })
                }
              />
            </>
          )}

          {/* EN fields */}
          {langTab === "EN" && (
            <>
              <input
                className="border p-2 w-full rounded"
                placeholder="Title (EN)"
                value={form.title_en}
                onChange={(e) => setForm({ ...form, title_en: e.target.value })}
              />
              <input
                className="border p-2 w-full rounded"
                placeholder="Department (EN)"
                value={form.department_en}
                onChange={(e) =>
                  setForm({ ...form, department_en: e.target.value })
                }
              />
              <input
                className="border p-2 w-full rounded"
                placeholder="Location (EN)"
                value={form.location_en}
                onChange={(e) =>
                  setForm({ ...form, location_en: e.target.value })
                }
              />
              <textarea
                className="border p-2 w-full rounded"
                placeholder="Description (EN)"
                value={form.description_en}
                onChange={(e) =>
                  setForm({ ...form, description_en: e.target.value })
                }
              />
              <textarea
                className="border p-2 w-full rounded"
                placeholder="Requirements (EN)"
                value={form.requirements_en}
                onChange={(e) =>
                  setForm({ ...form, requirements_en: e.target.value })
                }
              />
            </>
          )}

          <select
            className="border p-2 w-full rounded"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
          </select>

          <input
            type="date"
            className="border p-2 w-full rounded"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          />

          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded shadow">
            Vakansiya yarat
          </button>
        </form>
      </div>

      {/* Vacancy Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3">Başlıq (AZ)</th>
              <th className="p-3">Title (EN)</th>
              <th className="p-3">Location</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vacancies.map((v) => (
              <tr key={v._id} className="border-t">
                <td className="p-3">
                  {safe(v, "title_az", "title", "title_en")}
                </td>
                <td className="p-3">{safe(v, "title_en") || "-"}</td>
                <td className="p-3">
                  {safe(v, "location_az", "location_en", "location")}
                </td>
                <td className="p-3 text-right space-x-2">
                  <button
                    onClick={() => handleViewApplications(v._id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Müraciətlər
                  </button>
                  <button
                    onClick={() => handleDelete(v._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
            {vacancies.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-4 text-gray-500">
                  Vakansiya yoxdur
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Applications Modal */}
      {showApps && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button
              onClick={() => setShowApps(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              aria-label="Kapat"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold mb-4">Müraciətlər</h2>

            {/* Search */}
            <div className="mb-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ad, soyad vəya telefon ile axtar..."
                className="w-full border rounded px-3 py-2"
              />
              <div className="text-xs text-gray-500 mt-1">
                Ümumi {filteredApps.length} müraciət
              </div>
            </div>

            {/* List */}
            {filteredApps.length > 0 ? (
              <div>
                {currentSlice.map((app) => (
                  <div
                    key={app._id}
                    className="border p-3 mb-3 rounded bg-gray-50"
                  >
                    <p className="font-medium">
                      {app.fullName || "Anonim"}{" "}
                      <span className="text-gray-600">
                        ({app.email || "-"})
                      </span>
                    </p>
                    <p>Telefon: {app.phone || "-"}</p>
                    {app.cvPath ? (
                      <a
                        href={fileUrl(app.cvPath)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        CV’yə bax
                      </a>
                    ) : (
                      <span className="text-gray-400">CV yoxdur</span>
                    )}
                  </div>
                ))}

                {/* Pagination: sadece 4+ ise göster */}
                {filteredApps.length > pageSize && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Səhifə {currentPage} / {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                        onClick={() => goPage(1)}
                        disabled={currentPage === 1}
                      >
                        « İlk
                      </button>
                      <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                        onClick={() => goPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        ‹ Əvvəlki
                      </button>

                      {/* basit sayfa numaraları (max 5 göster) */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((n) => {
                          return (
                            n === 1 ||
                            n === totalPages ||
                            (n >= currentPage - 2 && n <= currentPage + 2)
                          );
                        })
                        .map((n, idx, arr) => {
                          const prev = arr[idx - 1];
                          const needDots = prev && n - prev > 1;
                          return (
                            <span key={n} className="flex">
                              {needDots && (
                                <span className="px-2 select-none">…</span>
                              )}
                              <button
                                onClick={() => goPage(n)}
                                className={`px-3 py-1 border rounded ${
                                  n === currentPage
                                    ? "bg-blue-500 text-white border-blue-500"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                {n}
                              </button>
                            </span>
                          );
                        })}

                      <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                        onClick={() => goPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Sonrakı ›
                      </button>
                      <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                        onClick={() => goPage(totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        Son »
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p>Müraciət yoxdur</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
