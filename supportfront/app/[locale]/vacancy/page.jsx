"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/app/utils/api";
import { toast } from "react-toastify";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import { useLocale } from "next-intl";

/* ---------------------- Helpers ---------------------- */
function classNames(...c) {
  return c.filter(Boolean).join(" ");
}
const shimmer =
  "animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200";

/** Locale-aware field picker with graceful fallbacks */
function pickLang(v = {}, locale = "az", base) {
  const isEn = String(locale).toLowerCase().startsWith("en");
  const az = v?.[`${base}_az`];
  const en = v?.[`${base}_en`];
  return (isEn ? en || az : az || en) || v?.[base] || "";
}

/* ---------------------- Job Card ---------------------- */
function JobCard({ v, onApply, locale }) {
  // Önce backend'in lokalize alanı; yoksa *_az/_en fallback
  const title = v.title ?? pickLang(v, locale, "title");
  const location = v.location ?? pickLang(v, locale, "location");
  const description = v.description ?? pickLang(v, locale, "description");
  const department = v.department ?? pickLang(v, locale, "department");

  // 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useTransform(y, [-50, 50], [10, -10]);
  const ry = useTransform(x, [-50, 50], [-10, 10]);
  const rotateX = useSpring(rx, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(ry, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    x.set(px - rect.width / 2);
    y.set(py - rect.height / 2);
  };
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const badgeColor = useMemo(() => {
    switch ((v?.type || "").toLowerCase()) {
      case "full-time":
        return "from-emerald-500 to-teal-500";
      case "part-time":
        return "from-sky-500 to-indigo-500";
      case "internship":
        return "from-amber-500 to-orange-500";
      case "contract":
        return "from-rose-500 to-pink-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  }, [v?.type]);

  return (
    <motion.article
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -6 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      className="relative group"
    >
      {/* Glow ring */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-white/20 to-white/0 opacity-0 group-hover:opacity-100 blur transition" />
      {/* Card shell */}
      <div className="relative rounded-2xl border border-white/10 bg-white/70 backdrop-blur-xl shadow-xl overflow-hidden">
        {/* Top gradient strip */}
        <div
          className={classNames(
            "h-1.5 w-full bg-gradient-to-r",
            "from-transparent via-black/10 to-transparent"
          )}
          style={{ transform: "translateZ(40px)" }}
        />

        <div className="p-5 md:p-6">
          {/* Title + Badge */}
          <div
            className="flex items-start justify-between gap-3"
            style={{ transform: "translateZ(50px)" }}
          >
            <h3 className="text-lg md:text-xl font-bold tracking-tight text-gray-900">
              {title || "—"}
            </h3>
            <span
              className={classNames(
                "inline-flex items-center rounded-full px-3 py-1 text-xs md:text-[11px] font-medium",
                "text-white shadow",
                "bg-gradient-to-br",
                badgeColor
              )}
              title={v.type}
            >
              {v.type?.replace("-", " ") || "role"}
            </span>
          </div>

          {/* Meta */}
          <div
            className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600"
            style={{ transform: "translateZ(40px)" }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                className="opacity-70"
              >
                <path
                  fill="currentColor"
                  d="M12 12q.825 0 1.413-.587T14 9q0-.825-.587-1.412T12 7q-.825 0-1.412.588T10 9q0 .825.588 1.413T12 12m0 9q-3.75-3.25-5.875-5.762T4 10q0-3.35 2.325-5.675T12 2q3.35 0 5.675 2.325T20 10q0 2.475-2.125 5T12 21"
                />
              </svg>
              {location || "—"}
            </span>

            {v.deadline && (
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  className="opacity-70"
                >
                  <path
                    fill="currentColor"
                    d="M17 21q-2.9 0-4.95-2.05T10 14q0-2.9 2.05-4.95T17 7q2.9 0 4.95 2.05T24 14q0 2.9-2.05 4.95T17 21m0-2q.85 0 1.663-.237T20.2 18.1l-2.2-2.1V11h-2v4l2.9 2.7q.5-.25.8-.75t.3-1q0-1.25-.875-2.125T17 12q-1.25 0-2.125.875T14 15t.875 2.125T17 19M2 22q-.825 0-1.412-.587T0 20V6q0-.825.588-1.412T2 4h2V2h2v2h8V2h2v2h2q.825 0 1.413.588T20 6v3.1q-.725-.275-1.488-.413T17 8.55Q13.65 8.55 11.325 10.9T9 16q0 .8.138 1.563T9.55 19z"
                  />
                </svg>
                Son tarixi:{" "}
                {new Date(v.deadline).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>

          {/* Description */}
          <p
            className="mt-4 line-clamp-3 text-sm text-gray-700"
            style={{ transform: "translateZ(35px)" }}
          >
            {description || "—"}
          </p>

          {/* CTA */}
          <div
            className="mt-5 flex items-center justify-between"
            style={{ transform: "translateZ(40px)" }}
          >
            <div className="text-xs text-gray-500">
              Bölmə: <span className="font-medium">{department || "—"}</span>
            </div>
            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onApply(v)}
              className="relative overflow-hidden rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-lg"
            >
              <span className="relative z-10">Müraciət et</span>
              <motion.span
                initial={{ x: "-120%" }}
                animate={{ x: ["-120%", "120%"] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
                className="absolute inset-y-0 -skew-x-12 w-1/3 bg-white/20"
              />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/* ---------------------- Apply Modal ---------------------- */
function ApplyModal({
  open,
  onClose,
  vacancy,
  onSubmit,
  loading,
  form,
  setForm,
  locale,
}) {
  const title = (vacancy?.title ?? pickLang(vacancy, locale, "title")) || "—";
  const location = vacancy?.location ?? pickLang(vacancy, locale, "location");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal card */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 160, damping: 16 }}
            className="relative z-[70] w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-white/80 shadow-2xl backdrop-blur-xl"
          >
            <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br from-blue-500/20 to-fuchsia-500/20 blur-2xl" />
            <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 blur-2xl" />

            <div className="relative p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">
                    Müraciət: {title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {location || "—"} • {vacancy?.type?.replace("-", " ")}
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  aria-label="close"
                  className="rounded-lg border border-gray-200 bg-white/80 px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  Bağla
                </motion.button>
              </div>

              <form onSubmit={onSubmit} className="mt-5 space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Ad Soyad
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-200 bg-white/70 p-2.5 outline-none ring-0 focus:border-gray-300"
                      value={form.fullName}
                      onChange={(e) =>
                        setForm({ ...form, fullName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full rounded-lg border border-gray-200 bg-white/70 p-2.5 outline-none ring-0 focus:border-gray-300"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Telefon (opsiyonel)
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-200 bg-white/70 p-2.5 outline-none ring-0 focus:border-gray-300"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="+994..."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    CV (.pdf)
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    className="w-full cursor-pointer rounded-lg border border-dashed border-gray-300 bg-white/60 p-3 file:mr-4 file:rounded-md file:border-0 file:bg-gray-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:border-gray-400"
                    onChange={(e) =>
                      setForm({ ...form, cv: e.target.files?.[0] || null })
                    }
                    required
                  />
                  <p className="mt-1 text-[11px] text-gray-500">
                    Max 10MB • PDF
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Vazgeç
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                    className={classNames(
                      "relative overflow-hidden rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-lg",
                      loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                    )}
                  >
                    <span className="relative z-10">
                      {loading ? "Gönderiliyor…" : "Gönder"}
                    </span>
                    {!loading && (
                      <motion.span
                        initial={{ x: "-120%" }}
                        animate={{ x: ["-120%", "120%"] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.8,
                          ease: "linear",
                        }}
                        className="absolute inset-y-0 -skew-x-12 w-1/3 bg-white/20"
                      />
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------------- Page ---------------------- */
export default function VacanciesPage() {
  const locale = useLocale(); // aktif dil
  const [vacancies, setVacancies] = useState([]);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    cv: null,
  });
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  // locale -> lang param mapping
  const langParam = String(locale).toLowerCase().startsWith("en") ? "en" : "az";

  // fetch vacancies with lang (backend localized fields: title, location, ...)
  const fetchVacancies = async () => {
    try {
      setLoadingList(true);
      const res = await api.get("/vacancies", { params: { lang: langParam } });
      setVacancies(res.data?.data || []);
    } catch {
      toast.error("Vakansiyalar yüklənə bilmədi");
    } finally {
      setLoadingList(false);
    }
  };

  // apply
  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedVacancy) return toast.error("Vakansiya seçilməyib");
    const formData = new FormData();
    formData.append("fullName", form.fullName);
    formData.append("email", form.email);
    formData.append("phone", form.phone || "");
    if (form.cv) formData.append("cv", form.cv);

    try {
      setLoading(true);
      await api.post(`/vacancies/${selectedVacancy._id}/apply`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Müraciət göndərildi");
      setSelectedVacancy(null);
      setForm({ fullName: "", email: "", phone: "", cv: null });
    } catch (err) {
      toast.error(err.response?.data?.message || "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  // locale değişince listeyi güncelle
  useEffect(() => {
    fetchVacancies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [langParam]);

  return (
    <div className="relative mx-auto mt-[12rem] max-w-6xl px-6 pb-20">
      {/* soft gradient blobs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 to-fuchsia-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 blur-3xl" />

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 110, damping: 14 }}
        className="mb-10 text-center"
      >
        <h1 className="bg-gradient-to-r from-gray-900 via-black to-gray-700 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent md:text-4xl">
          Vakansiyalar
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-600">
          Komandamıza qoşulun — uyğun rolu seçin, CV-nizi yükləyin, sürətlə
          müraciət edin.
        </p>
      </motion.div>

      {/* Grid */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 1 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.05 },
          },
        }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {loadingList &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`sk-${i}`}
              className="rounded-2xl border border-gray-200/70 bg-white/60 p-6 backdrop-blur"
            >
              <div className={classNames("h-5 w-3/5 rounded", shimmer)} />
              <div className="mt-3 flex gap-2">
                <div className={classNames("h-6 w-24 rounded-full", shimmer)} />
                <div className={classNames("h-6 w-36 rounded-full", shimmer)} />
              </div>
              <div
                className={classNames("mt-4 h-24 w-full rounded", shimmer)}
              />
              <div
                className={classNames("mt-5 h-9 w-28 rounded-lg", shimmer)}
              />
            </div>
          ))}

        {!loadingList &&
          vacancies.map((v) => (
            <JobCard
              key={v._id}
              v={v}
              onApply={setSelectedVacancy}
              locale={locale}
            />
          ))}
      </motion.div>

      {!loadingList && vacancies.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 rounded-2xl border border-dashed border-gray-300 bg-white/60 p-10 text-center backdrop-blur"
        >
          <p className="text-gray-600">Hazırda aktiv vakansiya yoxdur.</p>
        </motion.div>
      )}

      {/* Modal */}
      <ApplyModal
        open={!!selectedVacancy}
        onClose={() => setSelectedVacancy(null)}
        vacancy={selectedVacancy}
        onSubmit={handleApply}
        loading={loading}
        form={form}
        setForm={setForm}
        locale={locale}
      />
    </div>
  );
}
