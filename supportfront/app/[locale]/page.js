import { useTranslations } from "next-intl";
import HeroBanner from "../_components/HeroBanner";
import Features from "../_components/Features/Features";
import HighlightSections from "../_components/CharlesSection/Highlight";
import NewsletterSection from "../_components/Subscribe/subscribe";
import ScrollProgress from "../_components/ScrollProgress";
export default function HomePage() {
  const t = useTranslations("heroBanner");
  return (
    <div>
      <ScrollProgress />
      <HeroBanner
        image="/assets/images/Banner1.jpg"
        title={t("title")}
        buttonText={t("buttonText")}
        cardNumber="4169 7388 1103 3368"
        whatsapp="+994553143515"
      />
      <Features />
      <HighlightSections />
      <NewsletterSection />
    </div>
  );
}
