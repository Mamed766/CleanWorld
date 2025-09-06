"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  HeartHandshake,
  Scale,
  Users,
  Stethoscope,
  BookOpen,
  ArrowRight,
} from "lucide-react";

// Framer Motion variants
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.3, ease: "easeIn" } },
};

const fadeInUp = (i = 0) => ({
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: "easeOut" },
  },
});

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
};

export default function ServicesPage() {
  const t = useTranslations("services");

  const services = useMemo(
    () => [
      { icon: Shield, title: t("items.0.title"), desc: t("items.0.desc") },
      {
        icon: HeartHandshake,
        title: t("items.1.title"),
        desc: t("items.1.desc"),
      },
      { icon: Scale, title: t("items.2.title"), desc: t("items.2.desc") },
      { icon: Users, title: t("items.3.title"), desc: t("items.3.desc") },
      { icon: Stethoscope, title: t("items.4.title"), desc: t("items.4.desc") },
      { icon: BookOpen, title: t("items.5.title"), desc: t("items.5.desc") },
    ],
    [t]
  );

  return (
    <div className="mt-[5rem]">
      <AnimatePresence mode="wait">
        <motion.main
          className="bg-white min-h-screen text-gray-900"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Hero */}
          <section className="relative">
            <div className="mx-auto max-w-7xl px-6 pt-16 pb-12 sm:pt-20 sm:pb-16 lg:px-8">
              <motion.div
                className="mx-auto max-w-3xl text-center"
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.4 }}
              >
                <motion.span
                  variants={fadeInUp(0)}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium tracking-wide text-gray-600"
                >
                  {t("hero.badge")}
                  <span className="h-1.5 w-1.5 rounded-full bg-[#007A3E]" />
                </motion.span>

                <motion.h1
                  variants={fadeInUp(1)}
                  className="mt-4 text-4xl font-semibold tracking-tight "
                >
                  <span className="underline decoration-[#007A3E]/40 underline-offset-8">
                    {t("hero.title_1")} {t("hero.title_2")}
                  </span>
                </motion.h1>

                <motion.p
                  variants={fadeInUp(2)}
                  className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-600"
                >
                  {t("hero.subtitle")}
                </motion.p>

                <motion.div
                  variants={fadeInUp(3)}
                  className="mx-auto mt-8 h-px w-40 bg-gray-200"
                  initial={{ scaleX: 0 }}
                  whileInView={{
                    scaleX: 1,
                    transition: { duration: 0.8, ease: "easeOut" },
                  }}
                  viewport={{ once: true }}
                />
              </motion.div>
            </div>
          </section>

          {/* Services */}
          <section className="relative">
            <div className="mx-auto max-w-7xl px-6 pb-10 sm:pb-16 lg:px-8">
              <motion.div
                className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3"
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
              >
                {services.map(({ icon: Icon, title, desc }, idx) => (
                  <motion.article
                    key={title}
                    variants={fadeInUp(idx)}
                    className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md focus-within:shadow-md"
                  >
                    {/* Corner accent */}
                    <div className="pointer-events-none absolute -right-12 -top-12 h-24 w-24 rounded-full bg-[#007A3E]/10" />

                    <div className="flex items-start gap-4">
                      <div
                        className="rounded-xl border border-gray-200 p-3 transition-transform group-hover:-translate-y-0.5"
                        aria-hidden
                      >
                        <Icon className="h-6 w-6 text-[#007A3E]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-[#007A3E]">
                          {title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-gray-600">
                          {desc}
                        </p>
                      </div>
                    </div>

                    {/* Hover underline */}
                    <span className="mt-5 block h-px w-0 bg-[#007A3E] transition-all duration-300 group-hover:w-full" />
                  </motion.article>
                ))}
              </motion.div>
            </div>
          </section>

          {/* CTA */}
          <section className="relative">
            <div className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
              <motion.div
                className="rounded-2xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm"
                variants={fadeInUp(0)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
              >
                <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                      {t("cta.title")}
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">
                      {t("cta.desc")}
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007A3E]"
                  >
                    <a href="/contact">{t("cta.button")}</a>

                    <motion.span
                      initial={{ x: 0 }}
                      whileHover={{ x: 4 }}
                      transition={{
                        type: "spring",
                        stiffness: 250,
                        damping: 20,
                      }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </section>
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
