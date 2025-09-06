import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "../../i18n/routing"; // Yolunu kendine göre düzenle
import Layout from "../_featured/Layout/Layout";
import "../globals.scss";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Suspense } from "react";
import Spinner from "../_components/Spinner";

export const metadata = {
  icons: {
    icon: [{ url: "../favicon.ico", sizes: "any" }],
  },
};

export default async function LocaleLayout({ children, params }) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <Suspense fallback={<Spinner />}>
            <Layout>{children}</Layout>
            <ToastContainer />
          </Suspense>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
