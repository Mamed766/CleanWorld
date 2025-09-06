// app/[locale]/events/page.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import api from "@/app/utils/api";
import { truncateText } from "../admin/utils/utils";

const spring = { type: "spring", damping: 12, stiffness: 120 };

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("events");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // istəsən buradakı filterləri silə bilərsən
        const res = await api.get("/admin/events", {
          params: { status: "published" },
        });
        setEvents(res?.data?.events || []);
      } catch (err) {
        // Backend "No events found" üçün 404 qaytarır → boş siyahı göstər
        if (err?.response?.status === 404) {
          setEvents([]);
        } else {
          console.error("Eventlər alınarkən xəta:", err);
        }
      }
    };
    fetchEvents();
  }, []);

  const getLocalizedText = (item, field) =>
    locale === "az" ? item?.[`${field}AZ`] : item?.[`${field}EN`];

  return (
    <div className="mt-[9rem] min-h-screen px-6 py-10">
      <motion.h1
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...spring, delay: 0.05 }}
        className="text-3xl md:text-4xl font-extrabold text-center tracking-tight"
      >
        {t("title")}
      </motion.h1>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { transition: { staggerChildren: 0.05 } },
          show: { transition: { staggerChildren: 0.08 } },
        }}
        className="mt-8 flex flex-wrap justify-center gap-7"
      >
        {events.map((ev) => (
          <EventCard
            key={ev._id}
            event={ev}
            title={truncateText(getLocalizedText(ev, "title") || "", 18)}
            description={truncateText(
              getLocalizedText(ev, "description") || "",
              34
            )}
            locale={locale}
            onClick={(id) => router.push(`/${locale}/events/${id}`)}
          />
        ))}

        {events.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-500 mt-8"
          >
            Hələlik tədbir tapılmadı.
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

/* ----------------------------- EventCard ----------------------------- */

function EventCard({ event, title, description, onClick, locale }) {
  const prefersReduced = useReducedMotion();
  const cardRef = useRef(null);

  // 3D tilt
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 140, damping: 12, mass: 0.25 });
  const sy = useSpring(ry, { stiffness: 140, damping: 12, mass: 0.25 });

  // cursor glow
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const glowXpx = useTransform(glowX, (v) => `${v}%`);
  const glowYpx = useTransform(glowY, (v) => `${v}%`);

  const handleMouseMove = (e) => {
    if (prefersReduced) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;

    ry.set(px * 10);
    rx.set(-py * 10);
    glowX.set((x / rect.width) * 100);
    glowY.set((y / rect.height) * 100);
  };

  const handleLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  const dateLocale = locale === "az" ? "az-Latn-AZ" : "en-US";

  const dateLines = useMemo(() => {
    const s = event.startDate ? new Date(event.startDate) : null;
    const e = event.endDate ? new Date(event.endDate) : null;
    if (!s) return [];

    const optsD = { year: "numeric", month: "short", day: "2-digit" };
    const optsT = { hour: "2-digit", minute: "2-digit" };

    const sDate = s.toLocaleDateString(dateLocale, optsD);
    const sTime = s.toLocaleTimeString(dateLocale, optsT);

    if (!e) {
      // yalnız start
      return [sDate, sTime];
    }

    const eDate = e.toLocaleDateString(dateLocale, optsD);
    const eTime = e.toLocaleTimeString(dateLocale, optsT);

    const sameDay =
      s.getFullYear() === e.getFullYear() &&
      s.getMonth() === e.getMonth() &&
      s.getDate() === e.getDate();

    if (sameDay) {
      return [sDate, `${sTime}–${eTime}`];
    }
    return [`${sDate} ${sTime}`, `${eDate} ${eTime}`];
  }, [event.startDate, event.endDate, dateLocale]);

  const locationText = useMemo(() => event.location || "", [event.location]);

  return (
    <motion.article
      ref={cardRef}
      variants={{ hidden: { y: 22, opacity: 0 }, show: { y: 0, opacity: 1 } }}
      transition={spring}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
      onClick={() => onClick(event._id)}
      style={{
        rotateX: prefersReduced ? 0 : sx,
        rotateY: prefersReduced ? 0 : sy,
        transformStyle: "preserve-3d",
      }}
      className="
        group relative cursor-pointer select-none
        w-[340px] min-w-[340px] max-w-[340px]
        bg-white rounded-3xl overflow-hidden
        border border-slate-200 shadow-md hover:shadow-2xl
        transition-shadow
        flex flex-col
      "
    >
      {/* neon breathing border */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        style={{
          background:
            "conic-gradient(from 180deg at 50% 50%, rgba(16,185,129,0.18), rgba(59,130,246,0.18), rgba(236,72,153,0.18), rgba(16,185,129,0.18))",
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          padding: 1,
          opacity: 0.9,
          mixBlendMode: "overlay",
        }}
      />

      {/* cursor-follow glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(400px circle at ${glowXpx} ${glowYpx},
            rgba(59,130,246,0.12), transparent 35%)`,
        }}
      />

      {/* image with parallax */}
      <div className="relative h-[220px] overflow-hidden">
        <motion.img
          src={`${process.env.NEXT_PUBLIC_API}/${event?.image}`}
          alt={title}
          className="w-full h-full object-cover"
          whileHover={prefersReduced ? {} : { scale: 1.06 }}
          transition={{ type: "spring", damping: 14, stiffness: 120 }}
          style={{ transformOrigin: "center" }}
        />

        {/* glass date chip */}
        {dateLines.length > 0 && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ ...spring, delay: 0.15 }}
            className="
      absolute top-3 left-3 backdrop-blur-md
      bg-white/70 text-slate-800 text-[11px]
      px-3 py-2 rounded-xl shadow-sm
      inline-flex flex-col items-start gap-0.5
      whitespace-normal break-words leading-tight
      max-w-[210px] sm:max-w-[260px]
    "
          >
            <span className="font-semibold">{dateLines[0]}</span>
            {dateLines[1] && <span className="opacity-80">{dateLines[1]}</span>}
          </motion.div>
        )}

        {/* location chip */}
        {locationText && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ ...spring, delay: 0.25 }}
            className="
              absolute top-3 right-3 backdrop-blur-md
              bg-white/70 text-slate-800 text-[11px] font-medium
              px-3 py-1 rounded-full shadow-sm
            "
          >
            {truncateText(locationText, 22)}
          </motion.div>
        )}

        {/* sheen sweep */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          initial={{ opacity: 0, x: "-110%" }}
          whileHover={{ opacity: 1 }}
          animate={prefersReduced ? {} : { x: ["-110%", "115%"] }}
          transition={{
            repeat: Infinity,
            repeatType: "mirror",
            duration: 3.8,
            ease: "easeInOut",
          }}
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
          }}
        />
      </div>

      {/* content */}
      <div className="p-5 flex-1 flex flex-col">
        <motion.h3
          initial={{ y: 10, opacity: 0, clipPath: "inset(0 100% 0 0)" }}
          whileInView={{ y: 0, opacity: 1, clipPath: "inset(0 0% 0 0)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-xl font-extrabold tracking-tight leading-snug"
        >
          {title}
        </motion.h3>

        <motion.p
          initial={{ y: 12, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ ...spring, delay: 0.08 }}
          className="mt-2 text-[13.5px] leading-relaxed text-slate-600 line-clamp-4"
        >
          {description}
        </motion.p>

        {/* CTA row pinned bottom */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[12px] uppercase tracking-wider text-emerald-600 font-semibold"
          >
            {locale === "az" ? "Ətraflı bax" : "View details"}
          </motion.span>

          <motion.div
            whileHover={{ x: 4 }}
            transition={spring}
            className="relative"
          >
            <motion.span
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white shadow-md"
              whileHover={{
                boxShadow: "0 10px 35px rgba(16,185,129,0.35)",
                scale: 1.06,
              }}
              whileTap={{ scale: 0.96 }}
            >
              →
            </motion.span>
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
}
