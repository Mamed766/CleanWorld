"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const Footer = () => {
  const t = useTranslations("footer");

  return (
    <div>
      <footer className="bg-[#007A3E]">
        <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
          <div className="md:flex md:justify-between">
            <div className="mb-6 md:mb-0">
              <Link href="/" className="flex items-center">
                <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
                  TəmizDünya
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
              {/* Links 1 */}
              <div>
                <h2 className="mb-6 text-sm font-semibold text-white uppercase">
                  {t("title1")}
                </h2>
                <ul className="text-white font-medium space-y-3">
                  <li>
                    <Link href="/blog" className="hover:underline">
                      {t("blog")}
                    </Link>
                  </li>
                  <li>
                    <Link href="/documents" className="hover:underline">
                      {t("documents")}
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="hover:underline">
                      {t("about")}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Links 2 */}
              <div>
                <h2 className="mb-6 text-sm font-semibold text-white uppercase">
                  {t("title2")}
                </h2>
                <ul className="text-white font-medium space-y-3">
                  <li>
                    <Link
                      href="/projects-monitoring"
                      className="hover:underline"
                    >
                      {t("projects")}
                    </Link>
                  </li>
                  <li>
                    <Link href="/services" className="hover:underline">
                      {t("services")}
                    </Link>
                  </li>
                  <li>
                    <Link href="/events" className="hover:underline">
                      {t("events")}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Social */}
              <div>
                <h2 className="mb-6 text-sm font-semibold text-white uppercase">
                  {t("title3")}
                </h2>
                <ul className="text-white font-medium space-y-3">
                  <li>
                    <a
                      href="https://www.instagram.com/qadin_ve_usaq_siginma_evi/?igsh=MWxjaHltZ21laHI2eg%3D%3D#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {t("instagram")}
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.facebook.com/Siginacaq?rdid=f1sLbN9MI9fMtxlz&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1Aqt4bEaA4%2F#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {t("facebook")}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <hr className="my-6 border-white/30 sm:mx-auto lg:my-8" />

          <div className="sm:flex sm:items-center sm:justify-between">
            <span className="text-sm text-white/80 sm:text-center">
              © 2025{" "}
              <a
                href="https://bgaitechstudio.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                TəmizDünya
              </a>
              . {t("rights")}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
