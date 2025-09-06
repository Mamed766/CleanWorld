"use client";

import AboutEffect from "../../_components/about/AboutEffect";
import AboutMission from "../../_components/about/AboutMission";
import { AboutSection } from "@/app/_components/about/AboutSection";
import { AboutText } from "@/app/_components/about/AboutText";
import AboutVision from "@/app/_components/about/AboutVision";
import HeroBanner from "@/app/_components/HeroBanner";
import ScrollProgress from "@/app/_components/ScrollProgress";
import React from "react";
import { useTranslations } from "use-intl";

const page = () => {
  const t = useTranslations("header");

  return (
    <div>
      <ScrollProgress />
      {/* changed */}
      <HeroBanner image={"/assets/images/banner4.png"} />

      <AboutText />

      <AboutSection />

      <AboutVision />
      <AboutMission />
      <AboutEffect />
    </div>
  );
};

export default page;
