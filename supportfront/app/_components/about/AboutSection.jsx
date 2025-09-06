import { useTranslations } from "next-intl";
import React from "react";
import FeaturesCard from "../Features/FeaturesCard";

export const AboutSection = () => {
  const t = useTranslations("about");

  const cards = t.raw("cards");

  return (
    <div className="pb-[5rem]">
      <div className="flex flex-col justify-center text-center">
        <h2 className="text-[44px] text-black font-medium">{t("title")}</h2>
      </div>

      <div className="flex flex-wrap mt-[2rem] justify-center gap-10">
        {cards.map((card, index) => (
          <FeaturesCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
};
