"use client";

import React, { memo, useMemo, useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import api from "@/app/utils/api";

/* ===== constants hoisted to avoid recreating on each render ===== */
const EMAIL_RE = /^[^\s@]+@[^\s@]{2,}\.[^\s@]{2,}$/;
const PHONE_RE = /^(\+?\d{7,15}|0\d{7,14}|\+994\d{7,12})$/;

/* ===== Reusable Pieces (memoized to prevent unnecessary re-renders) ===== */

const GlassCard = memo(function GlassCard({ children }) {
  return <div className="glass rounded-2xl p-5">{children}</div>;
});

const Field = memo(function Field({
  as = "input",
  label,
  value,
  onChange,
  rows = 4,
  type = "text",
}) {
  const baseClass =
    "w-full rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300";
  const padding = as === "textarea" ? "p-3 min-h-[140px]" : "p-3";

  if (as === "textarea") {
    return (
      <textarea
        rows={rows}
        className={`${baseClass} ${padding}`}
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <input
      type={type}
      className={`${baseClass} ${padding}`}
      placeholder={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete={type === "email" ? "email" : type === "tel" ? "tel" : "on"}
    />
  );
});

const MagicButton = memo(function MagicButton({
  loading,
  labelIdle,
  labelLoading,
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="relative w-full md:w-auto px-6 py-3 rounded-xl bg-emerald-400 text-slate-900 font-semibold shadow-lg disabled:opacity-70"
      aria-busy={loading}
    >
      <span className="relative z-10">
        {loading ? labelLoading : labelIdle}
      </span>
    </button>
  );
});

/* ===== Page ===== */

export default function ContactPage() {
  const t = useTranslations("contact");

  const socialLinks = useMemo(
    () => [
      {
        key: "fb",
        icon: <FaFacebook size={22} />,
        label: t("social.links.facebook"),
        url: "https://www.facebook.com/Siginacaq?rdid=UbBTRIQ8UNw70MML&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1Aqt4bEaA4%2F#",
      },
      {
        key: "ig",
        icon: <FaInstagram size={22} />,
        label: t("social.links.instagram"),
        url: "https://www.instagram.com/qadin_ve_usaq_siginma_evi/?igsh=MWxjaHltZ21laHI2eg%3D%3D#",
      },
    ],
    [t]
  );

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    consent: false,
  });
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");

  const okTimerRef = useRef(null);
  useEffect(() => {
    return () => {
      if (okTimerRef.current) clearTimeout(okTimerRef.current);
    };
  }, []);

  const validate = () => {
    const s = (x) => (x || "").trim();
    const emailOk = EMAIL_RE.test(form.email);
    const phoneNormalized = (form.phone || "").replace(/[^\d+]/g, "");
    const phoneOk = PHONE_RE.test(phoneNormalized);

    if (
      !s(form.fullName) ||
      !s(form.email) ||
      !s(form.subject) ||
      !s(form.message)
    )
      return t("form.errors.requiredAll");
    if (!emailOk) return t("form.errors.email");
    if (!phoneOk && s(form.phone)) return t("form.errors.phone");
    if (!form.consent) return t("form.errors.consent");
    if (s(form.message).length < 10) return t("form.errors.messageMin");
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk(false);

    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    try {
      setLoading(true);
      await api.post("/contact", form);
      setOk(true);
      setForm({
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        consent: false,
      });
      if (okTimerRef.current) clearTimeout(okTimerRef.current);
      okTimerRef.current = setTimeout(() => setOk(false), 4000);
    } catch (error) {
      setErr(error?.response?.data?.message || t("form.errors.server"));
    } finally {
      setLoading(false);
    }
  };

  const handlers = useMemo(
    () => ({
      fullName: (v) => setForm((p) => ({ ...p, fullName: v })),
      email: (v) => setForm((p) => ({ ...p, email: v })),
      phone: (v) => setForm((p) => ({ ...p, phone: v })),
      subject: (v) => setForm((p) => ({ ...p, subject: v })),
      message: (v) => setForm((p) => ({ ...p, message: v })),
      consent: (v) => setForm((p) => ({ ...p, consent: v })),
    }),
    []
  );

  return (
    <div className="relative mt-[5rem] min-h-screen bg-white text-slate-900 overflow-hidden">
      {/* Light arka plan – yumuşak yeşil/mavi vurgular (statik) */}
      <div
        aria-hidden
        className="absolute -inset-32"
        style={{ mixBlendMode: "multiply" }}
      >
        {/* Sol-üst: emerald */}
        <div
          className="absolute left-10 top-10 w-[45vw] h-[45vw] rounded-full blur-3xl opacity-20"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(16,185,129,.25) 0%, transparent 60%)",
          }}
        />
        {/* Sağ-alt: sky */}
        <div
          className="absolute right-0 bottom-0 w-[52vw] h-[52vw] rounded-full blur-3xl opacity-15"
          style={{
            background:
              "radial-gradient(circle at 70% 70%, rgba(59,130,246,.22) 0%, transparent 65%)",
          }}
        />
        {/* Merkez: emerald soft */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[58vw] h-[58vw] rounded-full blur-3xl opacity-10"
          style={{
            background:
              "radial-gradient(circle, rgba(16,185,129,.25) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* çok hafif tint */}
      <div
        className="absolute inset-0 bg-emerald-50 pointer-events-none"
        aria-hidden
        style={{ opacity: 0.35 }}
      />

      {/* Hero */}
      <section className="relative text-center py-16">
        <h1 className="text-4xl pt-5 md:text-5xl font-bold tracking-tight">
          {t("title")}
        </h1>
      </section>

      {/* Content */}
      <section className="relative max-w-6xl mx-auto px-6 pb-16 grid lg:grid-cols-3 gap-8">
        {/* Left - Info & Social */}
        <aside className="lg:col-span-1 space-y-6">
          <GlassCard>
            <h2 className="text-xl font-semibold mb-1">{t("address.label")}</h2>
            <p className="text-slate-700">{t("address.value")}</p>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold mb-1">{t("phone.label")}</h2>
            <a
              href={`tel:${t("phone.value")}`}
              className="text-emerald-600 hover:underline"
            >
              {t("phone.value")}
            </a>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold mb-1">{t("email.label")}</h2>
            <a
              href={`mailto:${t("email.value")}`}
              className="text-emerald-600 hover:underline"
            >
              {t("email.value")}
            </a>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold">{t("social.label")}</h2>
            <div className="flex flex-col gap-3 mt-3">
              {socialLinks.map((item) => (
                <a
                  key={item.key}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-slate-700 hover:translate-x-1 transition-transform"
                >
                  <span className="grid place-items-center w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
                    {item.icon}
                  </span>
                  <span className="hover:text-slate-900">{item.label}</span>
                </a>
              ))}
            </div>
          </GlassCard>

          <div className="w-full h-[260px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3039.124653263013!2d49.8225!3d40.4265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40307d4b3a9b69b1%3A0xf5b037d80efcdd48!2sBil%C9%99c%C9%99ri!5e0!3m2!1sen!2saz!4v1691493488872!5m2!1sen!2saz"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Map"
            />
          </div>
        </aside>

        {/* Right - Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={submit}
            className="relative rounded-2xl p-6 md:p-8 bg-white border border-slate-200 shadow-xl"
            noValidate
          >
            {/* subtle inner/outer shadow */}
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                boxShadow:
                  "inset 0 0 0 1px rgba(15,23,42,.08), 0 20px 80px rgba(16,185,129,.10)",
              }}
              aria-hidden
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Field
                label={t("form.placeholders.fullName")}
                value={form.fullName}
                onChange={handlers.fullName}
              />
              <Field
                type="email"
                label={t("form.placeholders.email")}
                value={form.email}
                onChange={handlers.email}
              />
              <Field
                type="tel"
                label={t("form.placeholders.phone")}
                value={form.phone}
                onChange={handlers.phone}
              />
              <Field
                label={t("form.placeholders.subject")}
                value={form.subject}
                onChange={handlers.subject}
              />
            </div>

            <div className="mt-5">
              <Field
                as="textarea"
                label={t("form.placeholders.message")}
                value={form.message}
                onChange={handlers.message}
                rows={6}
              />
            </div>

            <label className="flex items-start gap-3 text-sm mt-1 mb-1">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => handlers.consent(e.target.checked)}
                className="mt-0.5 accent-emerald-500 cursor-pointer"
              />
              <span className="text-slate-700">{t("form.consent")}</span>
            </label>

            {err && (
              <p className="text-sm text-rose-600" aria-live="polite">
                {err}
              </p>
            )}

            <div className="mt-3 relative">
              <MagicButton
                loading={loading}
                labelIdle={t("form.submit")}
                labelLoading={t("form.sending")}
              />
            </div>

            {/* Success text (no confetti, no animation) */}
            {ok && (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
                <h3 className="text-base font-semibold mb-1">
                  {t("form.successTitle") || "Mesajın bize ulaştı!"}
                </h3>
                <p className="text-sm">{t("form.success")}</p>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Styles for inputs / cards (LIGHT) */}
      <style jsx global>{`
        .glass {
          background: #ffffff;
          border: 1px solid rgba(226, 232, 240, 1); /* slate-200 */
          box-shadow: 0 8px 30px rgba(2, 6, 23, 0.06);
          backdrop-filter: blur(6px);
        }
      `}</style>
    </div>
  );
}
