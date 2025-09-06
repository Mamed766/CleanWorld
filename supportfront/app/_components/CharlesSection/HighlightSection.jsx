"use client";

import React, { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useRouter } from "next/navigation";

export default function HighlightSection({
  image,
  title,
  description,
  buttonText,
  layout, // "left" | "right"
}) {
  const isReversed = layout === "right";
  const prefersReduced = useReducedMotion();

  const router = useRouter();

  // ===== 3D Tilt & Parallax =====
  const cardRef = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 120, damping: 14, mass: 0.35 });
  const sy = useSpring(ry, { stiffness: 120, damping: 14, mass: 0.35 });

  // Slight float for image/content
  const float = useTransform(sx, [-8, 8], [-2, 2]);

  const handleMouseMove = (e) => {
    if (prefersReduced) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width - 0.5; // -0.5..0.5
    const py = y / rect.height - 0.5;

    // Flip axes depending on layout to keep it feeling natural
    const dir = isReversed ? -1 : 1;
    ry.set(px * 10 * dir); // rotateY
    rx.set(-py * 10); // rotateX
  };

  const handleLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  // ===== Magnetic CTA =====
  const btnRef = useRef(null);
  const bx = useMotionValue(0);
  const by = useMotionValue(0);
  const bxs = useSpring(bx, { stiffness: 180, damping: 18, mass: 0.25 });
  const bys = useSpring(by, { stiffness: 180, damping: 18, mass: 0.25 });

  const onCtaMove = (e) => {
    if (prefersReduced) return;
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    bx.set(x * 0.2);
    by.set(y * 0.2);
  };
  const onCtaLeave = () => {
    bx.set(0);
    by.set(0);
  };

  // ===== Ripple Pulse on CTA click =====
  const [ripples, setRipples] = useState([]);
  const spawnRipple = (e) => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = crypto.randomUUID();
    setRipples((r) => [...r, { id, x, y }]);
    setTimeout(() => setRipples((r) => r.filter((i) => i.id !== id)), 600);

    router.push("/about");
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-600 via-emerald-600 to-emerald-700 py-14">
      {/* Soft ambient particles */}
      {!prefersReduced && <Particles reversed={isReversed} />}

      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleLeave}
        className={`mx-auto flex max-w-[1200px] flex-col items-center gap-10 px-5 md:flex-row ${
          isReversed ? "md:flex-row-reverse" : ""
        }`}
        style={{
          rotateX: prefersReduced ? 0 : sx,
          rotateY: prefersReduced ? 0 : sy,
          transformStyle: "preserve-3d",
        }}
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0%" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Media Card */}
        <motion.div
          className="group relative w-full select-none overflow-hidden rounded-2xl shadow-2xl md:w-1/2"
          style={{ y: prefersReduced ? 0 : float, translateZ: 20 }}
        >
          {/* Glow */}
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-2xl"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,.18), rgba(255,255,255,.04))",
              filter: "blur(10px)",
              mixBlendMode: "overlay",
            }}
          />
          {/* Image */}
          <motion.img
            src={image}
            alt={title}
            className="block h-[320px] w-full object-cover md:h-[420px]"
            whileHover={prefersReduced ? {} : { scale: 1.04 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
          />
          {/* Sheen sweep */}
          {!prefersReduced && (
            <motion.div
              aria-hidden
              className="absolute inset-0"
              initial={{ opacity: 0, x: "-120%" }}
              whileHover={{ opacity: 1 }}
              animate={{ x: ["-120%", "120%"] }}
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
          )}
          {/* Corner badge */}
        </motion.div>

        {/* Content */}
        <motion.div
          className="relative w-full text-center text-white md:w-1/2 md:text-left"
          style={{ y: prefersReduced ? 0 : float, translateZ: 25 }}
        >
          <motion.h2
            className="text-3xl font-black leading-tight drop-shadow-sm sm:text-4xl"
            initial={{ opacity: 0, y: 14, clipPath: "inset(0 100% 0 0)" }}
            whileInView={{ opacity: 1, y: 0, clipPath: "inset(0 0% 0 0)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {title}
          </motion.h2>

          <motion.p
            className="mt-4 text-sm leading-relaxed text-emerald-50/90 sm:text-base"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
          >
            {description}
          </motion.p>

          {buttonText && (
            <motion.button
              ref={btnRef}
              onMouseMove={onCtaMove}
              onMouseLeave={onCtaLeave}
              onClick={(e) => spawnRipple(e)}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 16px 50px rgba(0,0,0,.25)",
                y: -1,
              }}
              whileTap={{ scale: 0.98, y: 0 }}
              className="relative mt-6 inline-flex cursor-pointer select-none items-center justify-center overflow-hidden rounded-xl bg-white px-6 py-3 font-semibold text-emerald-700 shadow-lg"
              style={{ x: bxs, y: bys }}
            >
              {/* Button sheen */}
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                initial={{ opacity: 0.2, x: "-120%" }}
                animate={{ x: ["-120%", "130%"] }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 2.8,
                  ease: "linear",
                }}
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(16,185,129,0.15), transparent)",
                }}
              />
              {/* Ripples */}
              <AnimatePresence>
                {ripples.map((r) => (
                  <motion.span
                    key={r.id}
                    className="pointer-events-none absolute h-16 w-16 rounded-full bg-emerald-500/20"
                    initial={{
                      opacity: 0.5,
                      scale: 0,
                      x: r.x - 32,
                      y: r.y - 32,
                    }}
                    animate={{ opacity: 0, scale: 2.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                ))}
              </AnimatePresence>
              <a href="/about">
                <span className="relative z-10">{buttonText}</span>
              </a>
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ========= Ambient Particles (background micro-animation) ========= */
function Particles({ reversed }) {
  const dots = 18;
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {Array.from({ length: dots }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute block h-1.5 w-1.5 rounded-full"
          style={{
            left: `${(i * 57) % 100}%`,
            top: `${(i * 29) % 100}%`,
            background:
              i % 3 ? "rgba(255,255,255,.35)" : "rgba(255,255,255,.18)",
            filter: "blur(1px)",
          }}
          initial={{ opacity: 0, y: 0, x: 0 }}
          animate={{
            opacity: [0, 1, 0.7, 1],
            y: reversed ? [0, -18, 6, -16] : [0, -16, 8, -18],
            x: reversed ? [0, 8, -6, 10] : [0, -8, 6, -10],
          }}
          transition={{
            duration: 9 + ((i * 137) % 5),
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            delay: (i * 73) % 1.2,
          }}
        />
      ))}
    </div>
  );
}
