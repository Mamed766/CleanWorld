"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  FaHome,
  FaUsers,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaSignOutAlt,
  FaCog,
} from "react-icons/fa";
import { cn } from "./utils/utils";
import { useLocale } from "next-intl";
import { deleteCookie } from "cookies-next";
import { CiViewBoard } from "react-icons/ci";

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();

  const SIDEBAR_W = isOpen ? "w-[250px]" : "w-[70px]";

  const menuItems = [
    { title: "Analitika", href: `/${locale}/admin`, icon: FaHome },
    { title: "İstifadəçilər", href: `/${locale}/admin/users`, icon: FaUsers },
    {
      title: "Ehtiyaclar Analitika",
      href: `/${locale}/admin/needBoard`,
      icon: CiViewBoard,
    },
  ];

  const adminSubMenu = [
    { title: "Adminlər", href: `/${locale}/admin/admins` },
    { title: "Rol yarat", href: `/${locale}/admin/admins/create-role` },
    { title: "Rol güncəllə", href: `/${locale}/admin/admins/update-role` },
    { title: "Bloqlar", href: `/${locale}/admin/admins/blogs` },
    { title: "Müraciətlər", href: `/${locale}/admin/admins/applications` },
    { title: "Əlaqə", href: `/${locale}/admin/admins/contact` },
    { title: "Vakansiya", href: `/${locale}/admin/admins/vacancy` },
    { title: "Ehtiyaclar", href: `/${locale}/admin/admins/needs` },
    { title: "Tədbirlər", href: `/${locale}/admin/admins/events` },
    { title: "İanələr", href: `/${locale}/admin/admins/donations` },
  ];

  const handleLogout = () => {
    deleteCookie("adminToken");
    router.push(`/${locale}/admin`);
  };

  return (
    <>
      {/* Fixed sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-dark transition-all duration-300 overflow-hidden",
          SIDEBAR_W
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header + toggle */}
          <div className="flex items-center justify-between p-4">
            {isOpen && <span className="text-xl font-bold">Admin</span>}
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          {/* Menu (scrollable area) */}
          <nav className="mt-2 flex-1 overflow-y-auto">
            <ul className="space-y-2 px-2 pb-4">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.title}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-lg transition",
                        isActive
                          ? "bg-green-100 text-green-600 dark:bg-green-700 dark:text-white"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#FFFFFF1A]"
                      )}
                    >
                      <Icon className="text-lg" />
                      {isOpen && <span>{item.title}</span>}
                    </Link>
                  </li>
                );
              })}

              {/* Admin group */}
              <li>
                <button
                  onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                  className="flex w-full items-center justify-between px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition dark:text-gray-300 dark:hover:bg-[#FFFFFF1A]"
                >
                  <div className="flex items-center gap-3">
                    <FaCog className="text-lg" />
                    {isOpen && <span>Admins</span>}
                  </div>
                  {isOpen && (
                    <FaChevronDown
                      className={cn(
                        "transition",
                        isAdminMenuOpen && "rotate-180"
                      )}
                    />
                  )}
                </button>

                {isAdminMenuOpen && isOpen && (
                  <ul className="mt-2 space-y-1 pl-10">
                    {adminSubMenu.map((sub) => {
                      const active = pathname === sub.href;
                      return (
                        <li key={sub.title}>
                          <Link
                            href={sub.href}
                            className={cn(
                              "block rounded px-2 py-1 transition",
                              active
                                ? "bg-green-100 text-green-600 dark:bg-green-700 dark:text-white"
                                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#FFFFFF1A]"
                            )}
                          >
                            {sub.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            </ul>
          </nav>

          {/* Bottom: Logout (hep görünür) */}
          <div className="border-t border-gray-200 p-4 dark:border-gray-800">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              <FaSignOutAlt />
              {isOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Spacer: content’in sidebar altına girmemesi için */}
      <div className={cn("shrink-0", SIDEBAR_W)} />
    </>
  );
}
