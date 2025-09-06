"use client";
import React from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { usePathname } from "next/navigation";

const Layout = ({ children }) => {
  const pathname = usePathname();
  const isAdmin = pathname.includes("/admin");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      {!isAdmin && <Header />}

      {/* Page Content */}
      <main className="flex-1">{children}</main>

      {!isAdmin && <Footer />}
    </div>
  );
};
export default Layout;
