// app/[locale]/event/[id]/page.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import api from "@/app/utils/api";

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const locale = useLocale();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/admin/events/${id}`);
        setEvent(res.data.event);
      } catch (err) {
        console.error("Event tapılmadı:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent();
  }, [id]);

  const title = useMemo(() => {
    if (!event) return "";
    return locale === "az" ? event.titleAZ : event.titleEN;
  }, [event, locale]);

  const description = useMemo(() => {
    if (!event) return "";
    return locale === "az" ? event.descriptionAZ : event.descriptionEN;
  }, [event, locale]);

  // Tarixi səliqəli göstər: 2 sətirlik chip (mümkünsə eyni gündə zaman aralığı)
  const dateLines = useMemo(() => {
    if (!event?.startDate) return [];
    const L = locale === "az" ? "az-Latn-AZ" : "en-US";
    const s = new Date(event.startDate);
    const e = event.endDate ? new Date(event.endDate) : null;

    const dOpt = { year: "numeric", month: "short", day: "2-digit" };
    const tOpt = { hour: "2-digit", minute: "2-digit" };

    const sDate = s.toLocaleDateString(L, dOpt);
    const sTime = s.toLocaleTimeString(L, tOpt);

    if (!e) return [sDate, sTime];

    const sameDay =
      s.getFullYear() === e.getFullYear() &&
      s.getMonth() === e.getMonth() &&
      s.getDate() === e.getDate();

    const eDate = e.toLocaleDateString(L, dOpt);
    const eTime = e.toLocaleTimeString(L, tOpt);

    return sameDay
      ? [sDate, `${sTime}–${eTime}`]
      : [`${sDate} ${sTime}`, `${eDate} ${eTime}`];
  }, [event?.startDate, event?.endDate, locale]);

  // Tədbir müddəti (opsional informasiya)
  const durationText = useMemo(() => {
    if (!event?.startDate || !event?.endDate) return "";
    const ms = new Date(event.endDate) - new Date(event.startDate);
    if (ms <= 0) return "";
    const mins = Math.round(ms / 60000);
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  }, [event?.startDate, event?.endDate]);

  if (loading) return <SkeletonHero />;
  if (!event) return <p className="p-10">Tapılmadı.</p>;

  return (
    <article className="relative min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <ScrollProgress />

      <Hero
        src={`${process.env.NEXT_PUBLIC_API}/${event?.image}`}
        title={title}
        dateLines={dateLines}
        location={event?.location || ""}
        durationText={durationText}
        onBack={() => router.back()}
        locale={locale}
      />

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-3xl px-6 pb-24 mt-8 sm:mt-10"
      >
        {/* təsir hissi üçün yumşaq hissəciklər */}
        <AmbientParticles />

        {/* mətn */}
        <div className="mt-6 sm:mt-8">
          <RichBody text={description} />
        </div>
      </motion.section>

      {/* global overflow fix + sətir qırılması */}
      <style jsx global>{`
        .prose p,
        .prose li,
        .prose blockquote {
          overflow-wrap: anywhere;
          word-break: break-word;
          white-space: pre-wrap;
        }
        .prose a {
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        html,
        body {
          overflow-x: hidden;
        }
      `}</style>
    </article>
  );
}

/* ====================== Cinematic Hero (event meta ilə) ====================== */

function Hero({
  src,
  title,
  dateLines,
  location,
  durationText,
  onBack,
  locale,
}) {
  const ref = useRef(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const scale = prefersReduced
    ? 1
    : useTransform(scrollYProgress, [0, 1], [1.1, 1]);
  const yImg = prefersReduced
    ? 0
    : useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const yText = prefersReduced
    ? 0
    : useTransform(scrollYProgress, [0, 1], ["0%", "-6%"]);

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const springX = useSpring(rx, { stiffness: 120, damping: 12, mass: 0.3 });
  const springY = useSpring(ry, { stiffness: 120, damping: 12, mass: 0.3 });

  const handleMove = (e) => {
    if (prefersReduced) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;
    ry.set(px * 6);
    rx.set(-py * 6);
  };

  const handleLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <section
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative w-full h-[64vh] min-h-[420px] max-h-[760px] overflow-hidden"
    >
      <motion.div className="absolute inset-0" style={{ scale, y: yImg }}>
        <img src={src} alt={title} className="w-full h-full object-cover" />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" />

      <motion.button
        onClick={onBack}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className="absolute left-6 top-6 z-20 rounded-full bg-white/80 backdrop-blur px-3 py-1.5 text-sm font-semibold text-slate-800 shadow"
      >
        ← {locale === "az" ? "Geri" : "Back"}
      </motion.button>

      <motion.div
        className="relative z-10 h-full"
        style={{
          rotateX: springX,
          rotateY: springY,
          transformStyle: "preserve-3d",
        }}
      >
        <motion.div style={{ y: yText }} className="h-full flex items-end">
          <div className="container mx-auto px-6 max-w-5xl pb-10">
            <motion.h1
              initial={{ y: 24, opacity: 0, clipPath: "inset(0 100% 0 0)" }}
              animate={{ y: 0, opacity: 1, clipPath: "inset(0 0% 0 0)" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-white drop-shadow-xl break-words"
            >
              {title}
            </motion.h1>

            {/* Meta pill-lər: tarix (2 sətir) + məkan + müddət */}
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.6, ease: "easeOut" }}
              className="mt-3 flex flex-wrap gap-2"
            >
              {dateLines.length > 0 && (
                <div className="backdrop-blur bg-white/85 text-slate-800 text-xs sm:text-sm rounded-xl px-3 py-2 shadow flex flex-col leading-tight max-w-[90%] sm:max-w-[70%]">
                  <span className="font-semibold">{dateLines[0]}</span>
                  {dateLines[1] && (
                    <span className="opacity-85">{dateLines[1]}</span>
                  )}
                </div>
              )}

              {location && (
                <div className="backdrop-blur my-auto  bg-white/80 text-slate-800 text-xs sm:text-sm rounded-full px-3 py-1.5 shadow">
                  {location}
                </div>
              )}

              {durationText && (
                <div className="backdrop-blur my-auto   bg-white/70 text-slate-800 text-xs sm:text-sm rounded-full px-3 py-1.5 shadow">
                  {locale === "az" ? "Müddət:" : "Duration:"} {durationText}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ====================== Scroll Progress ====================== */

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 20,
    mass: 0.3,
  });
  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-emerald-500 via-sky-500 to-fuchsia-500"
      style={{ scaleX }}
    />
  );
}

/* ====================== Body / Typography ====================== */

function RichBody({ text }) {
  // 1) Normalizasiya: CRLF → LF
  // 2) HTML break/para → newline
  const normalized = (text || "")
    .replace(/\r\n/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<\/?p>/gi, "");

  // Boş sətirləri də saxla (filter(Boolean) YOX)
  const lines = normalized.split("\n");

  return (
    <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-lg">
      {lines.map((line, i) => {
        // Tam boş sətir üçün görünən boşluq ver
        if (line.trim() === "") {
          return <div key={i} className="h-4 sm:h-5" aria-hidden="true" />;
        }

        // NORMAL paragraf (drop-cap YOX)
        return (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.03 }}
            className="break-words"
          >
            {line}
          </motion.p>
        );
      })}
    </div>
  );
}

/* ====================== Share Bar ====================== */

/* ====================== Ambient Particles ====================== */

function AmbientParticles() {
  const count = 16;
  const width = typeof window !== "undefined" ? window.innerWidth : 1200;

  return (
    <div className="pointer-events-none absolute -z-10 inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute block h-1.5 w-1.5 rounded-full bg-emerald-400/40"
          initial={{
            x: Math.random() * width - width * 0.5,
            y: Math.random() * 600 - 300,
            opacity: 0,
            scale: 0.6,
          }}
          whileInView={{
            opacity: [0, 1, 0.6, 1],
            y: ["0%", "-30%", "10%", "-25%"],
          }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{
            duration: 10 + Math.random() * 6,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "mirror",
            delay: Math.random() * 2,
          }}
          style={{
            left: `${(i * 97) % 100}%`,
            top: `${(i * 43) % 100}%`,
            filter: "blur(1px)",
          }}
        />
      ))}
    </div>
  );
}

/* ====================== Skeleton ====================== */

function SkeletonHero() {
  return (
    <div className="animate-pulse">
      <div className="mt-[5rem] h-[64vh] min-h-[420px] w-full bg-slate-200" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="h-8 w-2/3 bg-slate-200 rounded" />
        <div className="mt-4 space-y-3">
          <div className="h-4 bg-slate-200 rounded" />
          <div className="h-4 bg-slate-200 rounded" />
          <div className="h-4 w-5/6 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
}
