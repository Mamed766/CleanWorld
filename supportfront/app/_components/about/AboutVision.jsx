import { useTranslations } from "next-intl";
import React from "react";

const AboutVision = () => {
  const t = useTranslations("about");

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex flex-wrap gap-[2rem] py-[2rem] px-[1rem]">
        <div>
          <img
            src="/assets/images/child3.jpg"
            alt=""
            className="h-[350px] w-[550px] object-cover"
          />
        </div>
        <div className="flex flex-col gap-[10px]">
          <h3 className="text-[2rem] font-[600]">{t("vision.title")}</h3>
          <p className="max-w-[500px] ">{t("vision.description")}</p>
          {/* <button className="bg-[#007A45] border  transition ease duration-300  border-[#007A45] hover:bg-transparent hover:text-[#007A45] max-w-[8rem] text-white px-2 py-2 rounded cursor-pointer ">
            {t("vision.buttonText")}
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default AboutVision;
