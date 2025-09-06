import React from "react";
import { useTranslations } from "next-intl";

const NewsletterSection = () => {
  const t = useTranslations("newsletterSection");

  return (
    <div className="py-[10rem] text-center bg-white">
      <h2 className="text-2xl md:text-3xl font-bold mb-4">{t("title")}</h2>
      <p className="text-lg text-gray-700 mb-6 max-w-xl mx-auto">
        {t("description")}
      </p>
      <button className="bg-green-700 text-white px-6 py-2 rounded-md hover:bg-green-800">
        <a href="/register">{t("buttonText")}</a>
      </button>
    </div>
  );
};

export default NewsletterSection;
