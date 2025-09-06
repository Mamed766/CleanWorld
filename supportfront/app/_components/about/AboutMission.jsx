import React from "react";
import { useTranslations } from "next-intl";

const AboutMission = () => {
  const t = useTranslations("about");

  const points = t.raw("mission.points");

  const renderText = (text) => {
    const [firstWord, ...rest] = text.split(" ");
    return (
      <p>
        <strong>{firstWord}</strong> {rest.join(" ")}
      </p>
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex flex-wrap gap-[2rem] py-[2rem] px-[1rem]">
        {/* Sol taraf: Resim */}
        <div>
          <img
            src="/assets/images/child4.jpg"
            alt=""
            className="h-[350px] w-[550px] object-cover"
          />
        </div>

        {/* Sağ taraf: Yazılar */}
        <div className="flex flex-col gap-[1.5rem] ">
          <h2 className="text-[2rem] font-[600]">{t("mission.title")}</h2>

          <div className="flex flex-col gap-[1rem] max-w-[500px]">
            {points.map((point, index) => (
              <div key={index}>{renderText(point)}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutMission;
