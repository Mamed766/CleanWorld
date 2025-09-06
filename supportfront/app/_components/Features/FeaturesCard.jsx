"use client";

import React, { useRef, useState } from "react";
import {
  motion,
  useSpring,
  useMotionValue,
  useTransform,
  useReducedMotion,
} from "framer-motion";

const SPRING = { type: "spring", damping: 10, stiffness: 100 };

function FeaturesCard({
  image,
  title,
  description,
  buttonText,
  buttonColor = "bg-green-600",
  onButtonClick,
}) {
  const prefersReduced = useReducedMotion();
  const cardRef = useRef(null);

  // 3D tilt
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 140, damping: 12, mass: 0.25 });
  const sy = useSpring(ry, { stiffness: 140, damping: 12, mass: 0.25 });

  // subtle idle float
  const floatY = useTransform(sx, [-6, 6], [-2, 2]);

  // cursor glow
  const [glowPos, setGlowPos] = useState({ x: "50%", y: "50%" });
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
    setGlowPos({
      x: `${(x / rect.width) * 100}%`,
      y: `${(y / rect.height) * 100}%`,
    });
  };
  const handleLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={SPRING}
      style={{
        rotateX: prefersReduced ? 0 : sx,
        rotateY: prefersReduced ? 0 : sy,
        y: prefersReduced ? 0 : floatY,
        transformStyle: "preserve-3d",
      }}
      className="
        relative w-[320px] min-w-[320px] max-w-[320px]
        rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden
        will-change-transform flex flex-col
      "
    >
      {/* cursor-follow glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: `radial-gradient(600px circle at ${glowPos.x} ${glowPos.y},
            rgba(16,185,129,0.12), transparent 35%)`,
        }}
      />

      {/* hover overlay */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        style={{
          background:
            "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.12))",
          mixBlendMode: "overlay",
        }}
      />

      {/* image - fixed height */}
      <div className="relative h-40 sm:h-44 overflow-hidden">
        <motion.img
          src={image}
          alt={title}
          className="block w-full h-full object-cover"
          whileHover={prefersReduced ? {} : { scale: 1.06 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          style={{ transformOrigin: "center" }}
        />
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
              duration: 3.6,
              ease: "easeInOut",
            }}
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
            }}
          />
        )}
      </div>

      {/* content fills the rest; button sticks to bottom */}
      <div className="relative p-5 flex-1 flex flex-col">
        <motion.h3
          className="text-lg sm:text-xl font-bold tracking-tight text-slate-900"
          initial={{ y: 10, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ ...SPRING, stiffness: 150, damping: 16, delay: 0.05 }}
        >
          {title}
        </motion.h3>

        {/* text block with small min-height so buttons align */}
        <motion.p
          className="mt-2 text-[13px] sm:text-[14px] leading-relaxed text-slate-600
                     min-h-[96px]"
          initial={{ y: 12, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ ...SPRING, stiffness: 150, damping: 18, delay: 0.12 }}
        >
          {description}
        </motion.p>

        {buttonText && (
          <motion.button
            onClick={onButtonClick}
            whileHover={{
              scale: 1.04,
              boxShadow: "0 10px 35px rgba(16,185,129,0.28)",
              y: -1,
            }}
            whileTap={{ scale: 0.98, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            className={`mt-auto ${buttonColor} cursor-pointer w-full sm:w-auto inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md`}
          >
            <a href="/about">{buttonText}</a>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export default FeaturesCard;
