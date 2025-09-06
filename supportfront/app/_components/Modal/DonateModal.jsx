"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useSpring,
  useMotionValue,
} from "framer-motion";

export default function DonateModal({
  open,
  onClose,
  cardNumber = "XXXX XXXX XXXX XXXX",
  whatsapp = "+994553143515",
}) {
  const t = useTranslations("donateModal");
  const locale = useLocale();

  const [tab, setTab] = useState("money"); // "money" | "needs"
  const [copied, setCopied] = useState(false);

  const prefersReduced = useReducedMotion();
  const overlayRef = useRef(null);

  // 3D micro parallax for the modal card
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const springX = useSpring(rx, { stiffness: 120, damping: 14, mass: 0.3 });
  const springY = useSpring(ry, { stiffness: 120, damping: 14, mass: 0.3 });

  useEffect(() => {
    if (!open) {
      setTab("money");
      setCopied(false);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const onMouseMove = (e) => {
    if (prefersReduced) return;
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;
    ry.set(px * 5);
    rx.set(-py * 5);
  };

  const onMouseLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  const copyCard = async () => {
    try {
      await navigator.clipboard.writeText(cardNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100]">
        {/* Animated overlay */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-hidden="true"
        >
          {/* Soft animated gradient */}
          <div className="absolute inset-0 bg-black/40" />
          <motion.div
            className="absolute inset-0 opacity-50"
            initial={{ scale: 1.2, rotate: 0 }}
            animate={{ scale: 1, rotate: 15 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background:
                "radial-gradient(1200px circle at 10% 10%, rgba(34,197,94,.20), transparent 40%), radial-gradient(1200px circle at 90% 90%, rgba(59,130,246,.18), transparent 40%)",
            }}
          />
        </motion.div>

        {/* Click outside to close */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal card */}
        <motion.div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          className="absolute left-1/2 top-1/2 w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2"
          style={{
            rotateX: prefersReduced ? 0 : springX,
            rotateY: prefersReduced ? 0 : springY,
            transformStyle: "preserve-3d",
          }}
        >
          <div className="relative rounded-3xl bg-white text-gray-900 shadow-[0_30px_80px_rgba(0,0,0,0.25)] overflow-hidden">
            {/* glow edge */}
            <motion.div
              className="pointer-events-none absolute -inset-px rounded-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background:
                  "linear-gradient(135deg, rgba(34,197,94,.35), rgba(59,130,246,.35))",
                filter: "blur(18px)",
              }}
            />

            {/* header */}
            <div className="relative flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <HeartIcon />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {t("title") || "Support the Mission"}
                  </h3>
                  {/* subtitle intentionally removed */}
                </div>
              </div>

              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
              >
                {t("close") || "Close"}
              </motion.button>
            </div>

            {/* tabs */}
            <div className="relative px-6 pt-4">
              <div className="inline-flex gap-2 rounded-xl bg-gray-100 p-1">
                <TabButton
                  active={tab === "money"}
                  onClick={() => setTab("money")}
                >
                  {t("tabs.money") || "Donate"}
                </TabButton>
                <TabButton
                  active={tab === "needs"}
                  onClick={() => setTab("needs")}
                >
                  {t("tabs.needs") || "In-Kind Needs"}
                </TabButton>
              </div>
            </div>

            {/* content */}
            <div className="relative p-6">
              <AnimatePresence mode="wait">
                {tab === "money" ? (
                  <motion.div
                    key="money"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-5"
                  >
                    <p className="text-sm text-gray-600">
                      {t("money.desc") ||
                        "Copy the card number below and complete your donation via your bank app."}
                    </p>

                    {/* Card number + copy */}
                    <div className="flex items-center gap-3 rounded-2xl border p-4">
                      <div className="grow">
                        <div className="text-xs uppercase text-gray-500">
                          {t("money.cardLabel") || "Card Number"}
                        </div>
                        <div className="select-all break-all text-lg font-mono tracking-wider">
                          {cardNumber}
                        </div>
                      </div>
                      <motion.button
                        onClick={copyCard}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        {copied
                          ? t("money.copied") || "Copied!"
                          : t("money.copy") || "Copy"}
                      </motion.button>
                    </div>

                    {/* Trust note
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      <ShieldIcon />
                    </div> */}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-3">
                      <motion.a
                        href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 14px 40px rgba(34,197,94,.35)",
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-white hover:bg-emerald-700"
                      >
                        <WhatsAppIcon />
                        {t("actions.whatsapp") || "WhatsApp"}
                      </motion.a>

                      <motion.a
                        href={`/${locale}/contact`}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className="cursor-pointer inline-flex items-center gap-2 rounded-2xl border px-5 py-3 hover:bg-gray-50"
                      >
                        <MailIcon />
                        {t("actions.contact") || "Contact"}
                      </motion.a>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="needs"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-5"
                  >
                    <p className="text-sm text-gray-600">{t("needs.desc")}</p>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <NeedCard
                        title={t("needs.clothes.title")}
                        desc={t("needs.clothes.desc")}
                        icon={<TshirtIcon />}
                      />
                      <NeedCard
                        title={t("needs.food.title")}
                        desc={t("needs.food.desc")}
                        icon={<FoodIcon />}
                      />
                      <NeedCard
                        title={t("needs.school.title")}
                        desc={t("needs.school.desc")}
                        icon={<SchoolIcon />}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <motion.a
                        href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 14px 40px rgba(34,197,94,.35)",
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-white hover:bg-emerald-700"
                      >
                        <WhatsAppIcon />
                        {t("actions.whatsapp")}
                      </motion.a>

                      <motion.a
                        href={`/${locale}/contact`}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className="cursor-pointer inline-flex items-center gap-2 rounded-2xl border px-5 py-3 hover:bg-gray-50"
                      >
                        <MailIcon />
                        {t("actions.contact")}
                      </motion.a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* ---------- Small Pieces ---------- */

function TabButton({ active, onClick, children }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={
        "rounded-lg px-4 py-2 text-sm transition " +
        (active ? "bg-white shadow text-gray-900" : "text-gray-600")
      }
    >
      {children}
    </motion.button>
  );
}

function NeedCard({ title, desc, icon }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border p-4 hover:shadow"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
          {icon}
        </div>
        <div className="text-sm font-semibold">{title}</div>
      </div>
      <p className="mt-2 text-xs text-gray-600">{desc}</p>
    </motion.div>
  );
}

/* ---------- Icons (lightweight SVGs) ---------- */

function HeartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      className="text-emerald-600"
    >
      <path
        fill="currentColor"
        d="M12 21s-7-4.35-9.33-8A5.49 5.49 0 0 1 12 5a5.49 5.49 0 0 1 9.33 8C19 16.65 12 21 12 21Z"
      />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      className="text-emerald-500"
    >
      <path
        fill="currentColor"
        d="M12 2l7 3v6c0 5-3.5 9.74-7 11c-3.5-1.26-7-6-7-11V5l7-3Zm0 4l-5 2v3c0 3.9 2.71 7.86 5 9c2.29-1.14 5-5.1 5-9V8l-5-2Zm-1 9l-3-3l1.41-1.41L11 12.17l4.59-4.58L17 9z"
      />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="text-white">
      <path
        fill="currentColor"
        d="M20.52 3.48A11.85 11.85 0 0 0 12.01 0C5.38 0 0 5.37 0 12a11.93 11.93 0 0 0 1.64 6L0 24l6.14-1.61A12.01 12.01 0 0 0 24 12c0-3.2-1.25-6.2-3.48-8.52m-8.5 18.04c-1.98 0-3.82-.58-5.38-1.58l-.39-.25l-3.64.95l.97-3.55l-.26-.4A9.64 9.64 0 0 1 2.36 12A9.65 9.65 0 1 1 12.02 21.52M19 14.63c-.27-.14-1.59-.78-1.84-.87c-.25-.1-.43-.14-.62.14c-.18.27-.71.87-.87 1.05c-.16.18-.32.2-.59.07c-.27-.14-1.12-.41-2.13-1.3c-.79-.69-1.32-1.54-1.47-1.81c-.15-.27-.02-.41.12-.55c.13-.13.27-.34.41-.5c.14-.16.18-.27.27-.45c.09-.18.05-.34-.02-.48c-.07-.14-.62-1.49-.85-2.04c-.22-.53-.44-.46-.62-.47l-.53-.01c-.18 0-.48.07-.73.34c-.25.27-.96.93-.96 2.28c0 1.34.98 2.63 1.12 2.81c.14.18 1.93 2.94 4.68 4.11c.65.28 1.16.45 1.55.57c.65.2 1.24.17 1.7.1c.52-.08 1.59-.65 1.81-1.28c.22-.63.22-1.17.16-1.28c-.06-.11-.24-.18-.51-.32"
      />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="text-gray-700">
      <path
        fill="currentColor"
        d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 4l-8 5L4 8V6l8 5l8-5z"
      />
    </svg>
  );
}
function TshirtIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="text-gray-700">
      <path
        fill="currentColor"
        d="M16.7 4L14 2H9.9L7.3 4L4 3l-1 4l3 1v11h12V8l3-1l-1-4z"
      />
    </svg>
  );
}
function FoodIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="text-gray-700">
      <path
        fill="currentColor"
        d="M11 9H7V2H5v7H1v2h4v10h2V11h4V9m12-6h-2v9h-2V3h-2v9c0 2.21 1.79 4 4 4v5h2v-5c2.21 0 4-1.79 4-4V3z"
      />
    </svg>
  );
}
function SchoolIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="text-gray-700">
      <path
        fill="currentColor"
        d="m12 3l10 6l-10 6l-10-6l10-6m0 8.75l7.91-4.75L12 4.25L4.09 7.75L12 11.75M5 13v5h14v-5l-7 4l-7-4Z"
      />
    </svg>
  );
}
