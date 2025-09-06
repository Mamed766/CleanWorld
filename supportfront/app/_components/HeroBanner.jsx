"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import DonateModal from "./Modal/DonateModal";

export default function HeroBanner({
  image,
  title,
  buttonText,
  cardNumber = "XXXX XXXX XXXX XXXX",
  whatsapp = "+994553143515",
  imagePosition = "10% center", // <-- EKLENDİ: sağa kaydır
}) {
  const containerRef = useRef(null);
  const prefersReduced = useReducedMotion();

  const [isDonateOpen, setDonateOpen] = useState(false);
  const openDonate = () => setDonateOpen(true);
  const closeDonate = () => setDonateOpen(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const bgScale = prefersReduced
    ? 1
    : useTransform(scrollYProgress, [0, 1], [1.1, 1]);
  const bgY = prefersReduced
    ? 0
    : useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const fgY = prefersReduced
    ? 0
    : useTransform(scrollYProgress, [0, 1], ["0%", "-6%"]);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, {
    stiffness: 120,
    damping: 12,
    mass: 0.3,
  });
  const springY = useSpring(rotateY, {
    stiffness: 120,
    damping: 12,
    mass: 0.3,
  });

  const handleMouseMove = (e) => {
    if (prefersReduced) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;
    rotateY.set(px * 6);
    rotateX.set(-py * 6);
  };
  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <>
      <section
        ref={containerRef}
        className="relative w-full h-[64vh] min-h-[420px] max-h-[760px] overflow-hidden mt-[4rem]"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background */}
        <motion.div
          className="absolute inset-0"
          style={{ scale: bgScale, y: bgY }}
        >
          <img
            src={image}
            alt="Hero Banner"
            className="object-cover w-full h-full"
            style={{ objectPosition: imagePosition }} // <-- SAĞA KAYDIRMA BURADA
          />
        </motion.div>

        {/* Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent" />

        {/* Content */}
        <motion.div
          className="relative z-10 h-full"
          style={{
            rotateX: springX,
            rotateY: springY,
            transformStyle: "preserve-3d",
          }}
        >
          <motion.div style={{ y: fgY }} className="h-full flex items-center">
            <div className="container mx-auto px-4 max-w-[1440px]">
              <div className="max-w-3xl">
                <h1 className="text-3xl sm:text-4xl lg:text-4xl font-extrabold leading-snug text-white max-w-4xl">
                  {title}
                </h1>

                {buttonText && (
                  <div className="mt-6 flex items-center gap-3">
                    <button
                      onClick={openDonate}
                      className="relative overflow-hidden inline-flex items-center gap-2 rounded-2xl px-6 sm:px-7 py-3 sm:py-3.5 font-semibold tracking-tight text-white bg-emerald-500 hover:bg-emerald-600"
                    >
                      {buttonText}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <DonateModal
        open={isDonateOpen}
        onClose={closeDonate}
        cardNumber={cardNumber}
        whatsapp={whatsapp}
      />
    </>
  );
}
