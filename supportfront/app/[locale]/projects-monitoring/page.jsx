"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function ProjectsMonitoringPage() {
  const t = useTranslations("projectsMonitoring");

  return (
    <div className="mt-[10rem]">
      <div className="bg-gray-50 text-gray-900">
        {/* Hero Section */}
        <section className="text-center py-20 text-white">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-bold text-black"
          >
            {t("title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-4 text-lg text-black max-w-2xl mx-auto"
          >
            {t("subtitle")}
          </motion.p>
        </section>

        {/* Monitoring Section */}
        <section className="max-w-6xl mx-auto py-16 px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold mb-8 text-center"
          >
            {t("monitoring.title")}
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {t.raw("monitoring.items").map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="bg-white p-6 rounded-2xl shadow-lg border"
              >
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.text}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-center mt-6 text-gray-700 italic">
            {t("monitoring.note")}
          </p>
        </section>

        {/* Partnerships Section */}
        <section className="bg-white py-16 px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold mb-8 text-center"
          >
            {t("partnerships.title")}
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-center">
            {t.raw("partnerships.partners").map((partner, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-gray-50 rounded-xl shadow-sm border"
              >
                <p className="font-medium">{partner}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-center mt-6 text-gray-700">
            {t("partnerships.note")}
          </p>
        </section>

        {/* Innovative Initiative Section */}
        <section className="bg-green-50 py-16 px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold mb-6 text-center"
          >
            {t("innovation.title")}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg border"
          >
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              {t.raw("innovation.list").map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
            <p className="mt-4 text-gray-600">{t("innovation.note")}</p>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
