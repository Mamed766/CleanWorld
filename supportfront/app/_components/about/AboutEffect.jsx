"use client";
import { useTranslations } from "next-intl";

export default function AboutEffect() {
  const t = useTranslations("effectPage");

  return (
    <div className="bg-gray-50 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Başlıq */}
        <h1 className="text-4xl font-semibold text-green-700 mb-6 text-center">
          {t("title")}
        </h1>

        {/* Təsirimiz */}
        <section className="mb-16">
          <div className="space-y-6 text-gray-700 text-lg">
            {t.raw("impact.items").map((item, index) => (
              <p key={index}>
                • {item.title}
                <span className="block text-sm text-gray-500 mt-1">
                  {item.desc}
                </span>
              </p>
            ))}
          </div>
        </section>

        {/* Necə Qoşula bilərsiniz */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-green-700 mb-6 text-center">
            {t("join.title")}
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {t.raw("join.options").map((item, index) => (
              <div key={index} className="p-6 bg-white shadow rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2024–2025-ci illərin əsas məqamları */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-green-700 mb-6 text-center">
            {t("highlights.title")}
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 text-lg">
            {t.raw("highlights.items").map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        {/* Rəhbərlik */}
        <section>
          <h2 className="text-2xl font-semibold text-green-700 mb-6 text-center">
            {t("leadership.title")}
          </h2>

          <div className="bg-white max-w-5xl mx-auto shadow rounded-2xl p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 md:items-center gap-8">
              {/* Sol: Şəkil */}
              <img
                src="/assets/images/zeynalova.jpg"
                alt={t("leadership.name")}
                className="w-[340px] h-[340px] md:w-[360px] md:h-[360px] rounded-xl object-cover justify-self-center md:justify-self-start"
              />

              {/* Sağ: Mətnlər */}
              <div className="text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
                  {t("leadership.name")}
                </h3>
                <p className="text-sm md:text-base text-gray-600 mt-1">
                  {t("leadership.position")}
                </p>
                <p className="text-sm md:text-base text-gray-600 mt-4 leading-relaxed max-w-[60ch] md:max-w-none mx-auto md:mx-0">
                  {t("leadership.desc")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
