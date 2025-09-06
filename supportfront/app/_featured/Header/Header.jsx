"use client";
import { useEffect, useState } from "react";
import {
  FaUser,
  FaSignInAlt,
  FaBars,
  FaTimes,
  FaAngleDown,
  FaPhoneAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "use-intl";
import { usePathname, useRouter } from "next/navigation";
import { deleteCookie, getCookie } from "cookies-next";
import { toast } from "react-toastify";
import DonateModal from "@/app/_components/Modal/DonateModal";

export default function Header() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(getCookie("token"));
  }, []);

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAboutOpen, setAboutOpen] = useState(false);
  const [isCareerOpen, setCareerOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const t = useTranslations("header");
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (e) => {
    const selectedLocale = e.target.value;
    const segments = pathname.split("/");
    segments[1] = selectedLocale;
    router.push(segments.join("/"));
  };

  const handleLogout = () => {
    deleteCookie("token");
    setToken(null);
    router.push("/login");
    toast.error("User logged out");
  };

  return (
    <header className="bg-[#007A3E] fixed top-0 left-0 w-full text-white py-[1rem] z-50">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between px-4">
          {/* Logo */}
          <div className="flex flex-col">
            <a href="/">
              <span className="text-3xl font-bold">
                Təmiz<span className="font-normal">Dünya</span>
              </span>
            </a>
          </div>

          {/* Sağ grup */}
          <div className="flex items-center space-x-4">
            {/* Desktop Icons */}
            <div className="hidden md:flex items-center space-x-4">
              {token ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center cursor-pointer space-x-1 hover:underline"
                >
                  <FaSignInAlt />
                  <span className="hidden sm:inline">{t("logout")}</span>
                </button>
              ) : (
                <div className="relative group">
                  <div className="flex items-center space-x-1 cursor-pointer">
                    <FaUser />
                    <span className="hidden sm:inline">{t("account")}</span>
                  </div>
                  <div className="absolute left-0 mt-2 bg-white text-black rounded shadow-md w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <a
                      href="/register"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      {t("register")}
                    </a>
                    <a
                      href="/login"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      {t("signIn")}
                    </a>
                  </div>
                </div>
              )}

              <a
                href="/contact"
                className="flex items-center space-x-1 hover:underline"
              >
                <FaPhoneAlt />
                <span className="hidden sm:inline">{t("contact")}</span>
              </a>
            </div>

            {/* Language select */}
            <select
              onChange={handleLanguageChange}
              defaultValue={pathname.split("/")[1] || "az"}
              className="bg-green-600 border border-white text-white text-sm px-2 py-1 rounded"
            >
              <option value="az">AZ</option>
              <option value="en">EN</option>
            </select>

            {/* Hamburger */}
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? " " : <FaBars size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center justify-between mt-3 px-4">
          <nav className="flex space-x-6 text-sm font-semibold relative">
            {/* ABOUT */}
            <div className="relative group z-20">
              <a href="/about" className="hover:underline">
                {t("about")}
              </a>
              <div className="absolute left-0 top-full mt-2 bg-white text-black rounded shadow-md w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <a
                  href="/about"
                  className="block rounded px-4 py-2 hover:bg-gray-100"
                >
                  {t("about")}
                </a>
                <a
                  href="/projects-monitoring"
                  className="block rounded px-4 py-2 hover:bg-gray-100"
                >
                  {t("projectsMontoring")}
                </a>
                <a
                  href="/events"
                  className="block rounded px-4 py-2 hover:bg-gray-100"
                >
                  {t("eventsAndResearch")}
                </a>
              </div>
            </div>

            <a href="/services" className="hover:underline">
              {t("services")}
            </a>
            <a href="/documents" className="hover:underline">
              {t("documents")}
            </a>
            <a href="/blog" className="hover:underline">
              {t("blog")}
            </a>

            {/* Career dropdown */}
            <div className="relative group z-20">
              <a href="#" className="hover:underline flex items-center gap-1">
                {t("career")}
              </a>
              <div className="absolute left-0 top-full mt-2 bg-white text-black rounded shadow-md w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <a
                  href="/volunteer"
                  className="block rounded px-4 py-2 hover:bg-gray-100"
                >
                  {t("volunteer")}
                </a>
                <a
                  href="/vacancy"
                  className="block rounded px-4 py-2 hover:bg-gray-100"
                >
                  {t("vacancy")}
                </a>
              </div>
            </div>
          </nav>

          {/* Buttons */}
          <div className="flex items-center ">
            <button
              onClick={() => setOpen(true)}
              className="border cursor-pointer border-white px-[6rem] py-1 rounded text-[#009966] font-bold bg-white hover:text-green-700 transition"
            >
              {t("donate")}
            </button>

            <DonateModal
              open={open}
              onClose={() => setOpen(false)}
              cardNumber="4169 7388 1103 3368"
              whatsapp="+994553143515"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                key="sidebar"
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="fixed top-0 left-0 w-64 h-full bg-green-800 text-white p-5 z-50 shadow-lg md:hidden"
              >
                <button
                  className="absolute top-4 cursor-pointer right-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaTimes size={22} />
                </button>

                <div className="mt-12 space-y-3">
                  {/* About */}
                  <div className="relative">
                    <div className="flex justify-between items-center">
                      <a href="/about" className="font-semibold">
                        {t("about")}
                      </a>
                      <button onClick={() => setAboutOpen(!isAboutOpen)}>
                        <FaAngleDown
                          className={`transition-transform duration-200 ${
                            isAboutOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                    <AnimatePresence>
                      {isAboutOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-2 bg-white text-black rounded shadow-md overflow-hidden"
                        >
                          <a
                            href="/about"
                            className="block px-4 py-2 hover:bg-gray-100"
                          >
                            {t("about")}
                          </a>
                          <a
                            href="/projects-monitoring"
                            className="block px-4 py-2 hover:bg-gray-100"
                          >
                            {t("projectsMontoring")}
                          </a>

                          <a
                            href="/events"
                            className="block px-4 py-2 hover:bg-gray-100"
                          >
                            {t("eventsAndResearch")}
                          </a>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <a href="/services" className="block">
                    {t("services")}
                  </a>
                  <a href="/documents" className="block">
                    {t("documents")}
                  </a>
                  <a href="/blog" className="block">
                    {t("blog")}
                  </a>

                  {/* Career mobile */}
                  <div className="relative">
                    <div className="flex justify-between items-center">
                      <a href="#" className="font-semibold">
                        {t("career")}
                      </a>
                      <button onClick={() => setCareerOpen(!isCareerOpen)}>
                        <FaAngleDown
                          className={`transition-transform duration-200 ${
                            isCareerOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                    <AnimatePresence>
                      {isCareerOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-2 bg-white text-black rounded shadow-md overflow-hidden"
                        >
                          <a
                            href="/volunteer"
                            className="block px-4 py-2 hover:bg-gray-100"
                          >
                            {t("volunteer")}
                          </a>
                          <a
                            href="/vacancy"
                            className="block px-4 py-2 hover:bg-gray-100"
                          >
                            {t("vacancy")}
                          </a>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <a href="/contact" className="block">
                    {t("contact")}
                  </a>

                  {/* Auth */}
                  {token ? (
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 border border-white px-4 py-2 rounded hover:bg-white hover:text-green-700 transition"
                    >
                      <FaSignInAlt />
                      <span>{t("logout")}</span>
                    </button>
                  ) : (
                    <>
                      <a
                        href="/register"
                        className="w-full flex items-center space-x-2 border border-white px-4 py-2 rounded hover:bg-white hover:text-green-700 transition"
                      >
                        <FaUser />
                        <span>{t("register")}</span>
                      </a>
                      <a
                        href="/login"
                        className="w-full flex items-center space-x-2 border border-white px-4 py-2 rounded hover:bg-white hover:text-green-700 transition"
                      >
                        <FaSignInAlt />
                        <span>{t("signIn")}</span>
                      </a>
                    </>
                  )}

                  <button
                    onClick={() => setOpen(true)}
                    className="w-full cursor-pointer border border-white px-4 py-1 rounded hover:bg-white hover:text-green-700 transition"
                  >
                    {t("donate")}
                  </button>

                  <div>
                    <DonateModal
                      open={open}
                      onClose={() => setOpen(false)}
                      cardNumber="4169 7388 1103 3368"
                      whatsapp="+994553143515"
                    />
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
