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

export default function BlogDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const locale = useLocale();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await api.get(`/admin/blogs/${id}`);
        setBlog(res.data.blog);
      } catch (err) {
        console.error("Blog tapılmadı:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBlog();
  }, [id]);

  const title = useMemo(() => {
    if (!blog) return "";
    return locale === "az" ? blog.titleAZ : blog.titleEN;
  }, [blog, locale]);

  const description = useMemo(() => {
    if (!blog) return "";
    return locale === "az" ? blog.descriptionAZ : blog.descriptionEN;
  }, [blog, locale]);

  const readingTime = useMemo(() => {
    const words = (description || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }, [description]);

  if (loading) return <SkeletonHero />;
  if (!blog) return <p className="p-10">Tapılmadı.</p>;

  return (
    <article className="relative min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <ScrollProgress />

      <Hero
        src={`${process.env.NEXT_PUBLIC_API}/${blog?.image}`}
        title={title}
        readingTime={readingTime}
        date={new Date(blog.createdAt)}
        onBack={() => router.back()}
      />

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-3xl px-6 pb-24 mt-8 sm:mt-10"
      >
        {!prefersReduced && <AmbientParticles />}

        {/* Description alanını biraz daha aşağıya almak için margin-top eklendi */}
        <div className="mt-6 sm:mt-8">
          <RichBody text={description} />
        </div>
      </motion.section>

      {/* Taşan metinleri kesin ve satır sonundan kırın */}
      <style jsx global>{`
        .prose p,
        .prose li,
        .prose blockquote {
          overflow-wrap: anywhere; /* modern */
          word-break: break-word; /* fallback */
          white-space: pre-wrap; /* senin istediğin satır atlamayı korur */
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

/* ====================== Cinematic Hero ====================== */

function Hero({ src, title, readingTime, date, onBack }) {
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
        ← Back
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

            <motion.p
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.6, ease: "easeOut" }}
              className="mt-3 text-white/90 text-sm sm:text-base"
            >
              {date.toLocaleDateString()} • {readingTime} min read
            </motion.p>
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
  // Boş sətirləri də saxla: \n ilə böl və filter(Boolean) ETMƏ
  const lines = (text || "").split(/\r?\n/);

  return (
    <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-lg">
      {lines.map((line, i) => {
        // Boş sətir üçün vizual boşluq ver
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
