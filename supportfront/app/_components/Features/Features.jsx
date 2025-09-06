"use client";
import React from "react";
import FeaturesCard from "./FeaturesCard";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

const Features = () => {
  const t = useTranslations("featuresSection");

  const router = useRouter();

  const cards = t.raw("cards");

  return (
    <div className="py-[5rem]">
      <div className="flex flex-col justify-center text-center">
        <h2 className="text-[44px] text-[#007A3E] font-medium">{t("title")}</h2>
        <p className="text-[20px] text-center max-w-[700px] mx-auto ">
          {t("subtitle")}
        </p>
      </div>

      <div className="flex flex-wrap mt-[2rem] justify-center gap-10">
        {cards.map((card, index) => (
          <FeaturesCard
            onButtonClick={() => router.push("/about")}
            key={index}
            {...card}
          />
        ))}
      </div>
    </div>
  );
};

export default Features;
