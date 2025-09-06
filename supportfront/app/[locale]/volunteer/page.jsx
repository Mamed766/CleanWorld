"use client";

import api from "../../utils/api";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------------- motion helpers ------------------------- */
const container = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 16 },
  },
};

const card = {
  hidden: { opacity: 0, y: 16, scale: 0.99 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 14 },
  },
};

const tapScale = { whileTap: { scale: 0.98 } };

/* ------------------------- input styles ------------------------- */
const baseInput =
  "w-full rounded-xl border border-gray-200 bg-white/70 px-3.5 py-2.5 outline-none transition shadow-sm focus:border-gray-300 focus:ring-2 focus:ring-black/5";

const baseTextArea =
  "w-full min-h-[110px] rounded-xl border border-gray-200 bg-white/70 px-3.5 py-2.5 outline-none transition shadow-sm focus:border-gray-300 focus:ring-2 focus:ring-black/5";

export default function VolunteerPage() {
  const t = useTranslations("volunteer");

  const AREAS = [
    { value: "Awareness", label: t("areas.awareness") },
    { value: "Shelter", label: t("areas.shelter") },
    { value: "Child-focused", label: t("areas.child") },
    { value: "Social media & content", label: t("areas.social") },
    { value: "Translation & documentation", label: t("areas.translation") },
    { value: "Research & data collection", label: t("areas.research") },
    { value: "Legal support", label: t("areas.legal") },
    { value: "Psychological support", label: t("areas.psych") },
  ];

  const DAYS = [
    { value: "Monday", label: t("days.monday") },
    { value: "Wednesday", label: t("days.wednesday") },
    { value: "Thursday", label: t("days.thursday") },
    { value: "Weekend", label: t("days.weekend") },
  ];

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    birthDate: "",
    gender: "", // "Male" | "Female" | "Other"
    phone: "",
    email: "",
    address: "",

    educationLevel: "", // "Secondary" | "Vocational secondary" | "Bachelor" | "Master+"
    graduatedSchool: "",
    profession: "",
    workplace: "",
    position: "",

    volunteerAreas: [], // EN values
    otherArea: "",

    previousExperience: "",
    motivation: "",

    weeklyHours: "", // "1–5" | "6–10" | "11+"
    availableDays: [], // EN values
    availableTimeRange: "",

    skills: "",
    consent: false,
  });

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));
  const toggleArray = (name, value) =>
    setForm((p) => {
      const s = new Set(p[name]);
      s.has(value) ? s.delete(value) : s.add(value);
      return { ...p, [name]: Array.from(s) };
    });

  // --- VALIDATION ---
  const validate = (f) => {
    const strip = (s) => (s || "").trim();
    const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s || "");
    const isPhone = (s) =>
      /^(\+?\d{7,15}|0\d{7,14}|\+994\d{7,12})$/.test(
        (s || "").replace(/[^\d+]/g, "")
      );
    const ageFrom = (dateStr) => {
      if (!dateStr) return 0;
      const d = new Date(dateStr);
      if (Number.isNaN(+d)) return 0;
      const today = new Date();
      let age = today.getFullYear() - d.getFullYear();
      const m = today.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
      return age;
    };

    if (
      !strip(f.fullName) ||
      !strip(f.birthDate) ||
      !strip(f.gender) ||
      !strip(f.phone) ||
      !strip(f.email) ||
      !strip(f.address)
    ) {
      return t("messages.requiredAll");
    }

    if (
      !strip(f.educationLevel) ||
      !strip(f.graduatedSchool) ||
      !strip(f.profession)
    ) {
      return t("messages.requiredEdu");
    }

    if (!strip(f.weeklyHours)) return t("messages.requiredHours");
    if (!f.consent) return t("messages.consent");

    if (strip(f.fullName).length < 3) return t("validation.fullNameMin");
    if (ageFrom(f.birthDate) < 16) return t("validation.birthDateMinAge");
    if (!["Male", "Female", "Other"].includes(f.gender))
      return t("validation.genderInvalid");

    if (!isPhone(f.phone)) return t("validation.phoneInvalid");
    if (!isEmail(f.email)) return t("validation.emailInvalid");

    if (strip(f.address).length < 5) return t("validation.addressMin");

    const eduValid = [
      "Secondary",
      "Vocational secondary",
      "Bachelor",
      "Master+",
    ];
    if (!eduValid.includes(f.educationLevel))
      return t("validation.educationInvalid");

    if (strip(f.graduatedSchool).length < 2) return t("validation.schoolMin");
    if (strip(f.profession).length < 2) return t("validation.professionMin");

    if (strip(f.availableTimeRange) && strip(f.availableTimeRange).length < 5) {
      return t("validation.timeRangeMin");
    }

    if (strip(f.availableTimeRange)) {
      const ok = /^([01]?\d|2[0-3]):[0-5]\d-([01]?\d|2[0-3]):[0-5]\d$/.test(
        strip(f.availableTimeRange)
      );
      if (!ok) return t("validation.timeRangeFormat");
    }

    if (f.volunteerAreas.length === 0 && !strip(f.otherArea)) {
      return t("validation.areaRequired");
    }

    const dayValues = new Set(["Monday", "Wednesday", "Thursday", "Weekend"]);
    if (f.availableDays.some((d) => !dayValues.has(d))) {
      return t("validation.daysInvalid");
    }

    return ""; // no error
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk(false);

    const v = validate(form);
    if (v) {
      setErr(v);
      return;
    }

    try {
      setLoading(true);
      await api.post("/volunteer", form);
      setOk(true);
      setForm({
        fullName: "",
        birthDate: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
        educationLevel: "",
        graduatedSchool: "",
        profession: "",
        workplace: "",
        position: "",
        volunteerAreas: [],
        otherArea: "",
        previousExperience: "",
        motivation: "",
        weeklyHours: "",
        availableDays: [],
        availableTimeRange: "",
        skills: "",
        consent: false,
      });
    } catch (e) {
      setErr(e?.response?.data?.message || t("messages.error"));
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------- progress (playful) ------------------------- */
  const totalRequiredBlocks = 4; // personal, education, weeklyHours+consent, areas
  const filledBlocks =
    (form.fullName &&
    form.birthDate &&
    form.gender &&
    form.phone &&
    form.email &&
    form.address
      ? 1
      : 0) +
    (form.educationLevel && form.graduatedSchool && form.profession ? 1 : 0) +
    (form.weeklyHours && form.consent ? 1 : 0) +
    (form.volunteerAreas.length > 0 || (form.otherArea || "").trim() ? 1 : 0);
  const progress = Math.round((filledBlocks / totalRequiredBlocks) * 100);

  return (
    <main className="relative mx-auto mt-[9rem] max-w-5xl px-6 pb-24">
      {/* dreamy gradient blobs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/25 to-fuchsia-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-gradient-to-tr from-emerald-500/25 to-cyan-500/25 blur-3xl" />

      {/* header */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mb-8 text-center"
      >
        <motion.h1
          variants={itemUp}
          className="text-3xl md:text-4xl font-extrabold tracking-tight"
        >
          {t("title")}
        </motion.h1>
        <motion.p variants={itemUp} className="mt-2 text-sm text-gray-600">
          {t("subtitle")}
        </motion.p>

        {/* progress pill */}
        <motion.div variants={itemUp} className="mx-auto mt-5 w-full max-w-md">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200/70">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-black to-gray-700"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 110, damping: 16 }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-600">
            {progress}% {t("progress")}
          </div>
        </motion.div>
      </motion.div>

      <motion.form
        onSubmit={onSubmit}
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Personal */}
        <motion.section
          variants={card}
          className="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-lg backdrop-blur"
        >
          <motion.h2 variants={itemUp} className="mb-3 text-lg font-semibold">
            {t("sections.personal")}
          </motion.h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <motion.input
              variants={itemUp}
              className={baseInput}
              placeholder={t("placeholders.fullName")}
              value={form.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
            />
            <motion.input
              variants={itemUp}
              type="date"
              className={baseInput}
              value={form.birthDate}
              onChange={(e) => setField("birthDate", e.target.value)}
            />
            <motion.select
              variants={itemUp}
              className={baseInput}
              value={form.gender}
              onChange={(e) => setField("gender", e.target.value)}
            >
              <option value="">{t("placeholders.gender")}</option>
              <option value="Male">{t("gender.male")}</option>
              <option value="Female">{t("gender.female")}</option>
              <option value="Other">{t("gender.other")}</option>
            </motion.select>
            <motion.input
              variants={itemUp}
              className={baseInput}
              placeholder={t("placeholders.phone")}
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
            />
            <motion.input
              variants={itemUp}
              type="email"
              className={baseInput}
              placeholder={t("placeholders.email")}
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
            />
            <motion.input
              variants={itemUp}
              className={baseInput}
              placeholder={t("placeholders.address")}
              value={form.address}
              onChange={(e) => setField("address", e.target.value)}
            />
          </div>
        </motion.section>

        {/* Education */}
        <motion.section
          variants={card}
          className="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-lg backdrop-blur"
        >
          <motion.h2 variants={itemUp} className="mb-3 text-lg font-semibold">
            {t("sections.education")}
          </motion.h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <motion.select
              variants={itemUp}
              className={baseInput}
              value={form.educationLevel}
              onChange={(e) => setField("educationLevel", e.target.value)}
            >
              <option value="">{t("placeholders.educationLevel")}</option>
              <option value="Secondary">
                {t("educationOptions.secondary")}
              </option>
              <option value="Vocational secondary">
                {t("educationOptions.vocational")}
              </option>
              <option value="Bachelor">{t("educationOptions.bachelor")}</option>
              <option value="Master+">
                {t("educationOptions.masterPlus")}
              </option>
            </motion.select>
            <motion.input
              variants={itemUp}
              className={baseInput}
              placeholder={t("placeholders.graduatedSchool")}
              value={form.graduatedSchool}
              onChange={(e) => setField("graduatedSchool", e.target.value)}
            />
            <motion.input
              variants={itemUp}
              className={baseInput}
              placeholder={t("placeholders.profession")}
              value={form.profession}
              onChange={(e) => setField("profession", e.target.value)}
            />
            <motion.input
              variants={itemUp}
              className={baseInput}
              placeholder={t("placeholders.workplace")}
              value={form.workplace}
              onChange={(e) => setField("workplace", e.target.value)}
            />
            <motion.input
              variants={itemUp}
              className={baseInput}
              placeholder={t("placeholders.position")}
              value={form.position}
              onChange={(e) => setField("position", e.target.value)}
            />
          </div>
        </motion.section>

        {/* Activity */}
        <motion.section
          variants={card}
          className="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-lg backdrop-blur"
        >
          <motion.h2 variants={itemUp} className="mb-3 text-lg font-semibold">
            {t("sections.activity")}
          </motion.h2>

          <motion.div
            variants={itemUp}
            className="grid grid-cols-1 gap-3 md:grid-cols-2"
          >
            {AREAS.map((a) => {
              const checked = form.volunteerAreas.includes(a.value);
              return (
                <motion.label
                  key={a.value}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border px-3.5 py-2 ${
                    checked
                      ? "border-black/60 bg-black/5"
                      : "border-gray-200 bg-white/70"
                  } transition`}
                  whileHover={{ y: -1 }}
                >
                  <span className="text-sm">{a.label}</span>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={checked}
                    onChange={() => toggleArray("volunteerAreas", a.value)}
                  />
                </motion.label>
              );
            })}
            <motion.input
              variants={itemUp}
              className={`${baseInput} md:col-span-2`}
              placeholder={t("placeholders.otherArea")}
              value={form.otherArea}
              onChange={(e) => setField("otherArea", e.target.value)}
            />
          </motion.div>

          <motion.textarea
            variants={itemUp}
            className={baseTextArea}
            placeholder={t("placeholders.prevExp")}
            value={form.previousExperience}
            onChange={(e) => setField("previousExperience", e.target.value)}
          />
          <motion.textarea
            variants={itemUp}
            className={baseTextArea}
            placeholder={t("placeholders.motivation")}
            value={form.motivation}
            onChange={(e) => setField("motivation", e.target.value)}
          />
        </motion.section>

        {/* Availability */}
        <motion.section
          variants={card}
          className="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-lg backdrop-blur"
        >
          <motion.h2 variants={itemUp} className="mb-3 text-lg font-semibold">
            {t("sections.availability")}
          </motion.h2>

          <motion.div variants={itemUp} className="flex flex-wrap gap-3">
            {["1–5", "6–10", "11+"].map((w) => (
              <label
                key={w}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 transition ${
                  form.weeklyHours === w
                    ? "border-black/60 bg-black/5"
                    : "border-gray-200 bg-white/70"
                }`}
              >
                <input
                  type="radio"
                  name="weeklyHours"
                  checked={form.weeklyHours === w}
                  onChange={() => setField("weeklyHours", w)}
                />
                <span>
                  {w === "1–5"
                    ? t("hours.h1_5")
                    : w === "6–10"
                    ? t("hours.h6_10")
                    : t("hours.h11")}
                </span>
              </label>
            ))}
          </motion.div>

          <motion.div variants={itemUp} className="mt-4 flex flex-wrap gap-3">
            {DAYS.map((d) => {
              const checked = form.availableDays.includes(d.value);
              return (
                <label
                  key={d.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 transition ${
                    checked
                      ? "border-black/60 bg-black/5"
                      : "border-gray-200 bg-white/70"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={checked}
                    onChange={() => toggleArray("availableDays", d.value)}
                  />
                  <span>{d.label}</span>
                </label>
              );
            })}
          </motion.div>

          <motion.input
            variants={itemUp}
            className={`${baseInput} mt-4`}
            placeholder={t("placeholders.timeRange")}
            value={form.availableTimeRange}
            onChange={(e) => setField("availableTimeRange", e.target.value)}
          />
        </motion.section>

        {/* Other + consent */}
        <motion.section
          variants={card}
          className="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-lg backdrop-blur"
        >
          <motion.h2 variants={itemUp} className="mb-3 text-lg font-semibold">
            {t("sections.other")}
          </motion.h2>
          <motion.textarea
            variants={itemUp}
            className={baseTextArea}
            placeholder={t("placeholders.skills")}
            value={form.skills}
            onChange={(e) => setField("skills", e.target.value)}
          />
          <motion.label
            variants={itemUp}
            className="mt-2 flex items-start gap-2 text-sm"
          >
            <input
              type="checkbox"
              className="mt-1"
              checked={form.consent}
              onChange={(e) => setField("consent", e.target.checked)}
            />
            <span>{t("consent")}</span>
          </motion.label>
        </motion.section>

        {/* status banners */}
        <AnimatePresence>
          {err && (
            <motion.div
              key="err"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
            >
              {err}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {ok && (
            <motion.div
              key="ok"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700"
            >
              {t("messages.success")}
            </motion.div>
          )}
        </AnimatePresence>

        {/* sticky submit bar on mobile */}
        <motion.div
          className="sticky bottom-6 z-10 mx-auto flex w-full max-w-md items-center justify-center"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            {...tapScale}
            type="submit"
            disabled={loading}
            className={`relative w-full rounded-2xl px-5 py-3 text-center text-sm font-semibold text-white shadow-xl transition ${
              loading ? "bg-gray-400" : "bg-black hover:bg-gray-900"
            }`}
          >
            <span className="relative z-10">
              {loading ? t("buttons.sending") : t("buttons.submit")}
            </span>
            {!loading && (
              <motion.span
                initial={{ x: "-120%" }}
                animate={{ x: ["-120%", "120%"] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
                className="absolute inset-y-0 -skew-x-12 w-1/3 bg-white/15"
              />
            )}
          </motion.button>
        </motion.div>
      </motion.form>

      {/* page bg */}
      <style jsx global>{`
        body {
          background: #f7fafc;
        }
      `}</style>
    </main>
  );
}
