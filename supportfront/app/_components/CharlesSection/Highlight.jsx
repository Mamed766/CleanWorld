import { useTranslations } from "next-intl";
import HighlightSection from "./HighlightSection";

const HighlightSections = () => {
  const t = useTranslations();
  const sections = t.raw("highlightSections");

  return (
    <div className="mt-[2rem]">
      {sections.map((section, index) => (
        <HighlightSection
          key={index}
          image={section.image}
          title={section.title}
          description={section.description}
          buttonText={section.buttonText}
          layout={section.layout}
        />
      ))}
    </div>
  );
};

export default HighlightSections;
