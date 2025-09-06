import { useTranslations } from "next-intl";
import React from "react";

export const AboutText = () => {
  const t = useTranslations("about");

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="py-[5rem] px-[1rem]">
        <div className="w-full text-center">
          <h2 className="text-[44px] text-[#007A3E]  font-[600] mb-[1rem]">
            {t("text.title")}
          </h2>
        </div>

        <div className="flex flex-col gap-[20px]">
          <p className="">{t("text.subtitle1")}</p>

          <p>{t("text.subtitle2")}</p>
        </div>
      </div>
    </div>
  );
};
