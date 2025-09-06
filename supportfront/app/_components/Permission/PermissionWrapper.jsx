"use client";
import { FaLock } from "react-icons/fa";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import adminApi from "../../utils/adminApi"; // axios instance

export default function PermissionWrapper({ permission, children }) {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const fetchPermissions = async () => {
      const token = getCookie("adminToken");
      if (!token) return;

      try {
        const res = await adminApi.get("/admin/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userPermissions = res.data?.role?.permissions || [];
        setHasPermission(userPermissions.includes(permission));
      } catch (err) {
        console.error("Permission fetch error:", err);
      }
    };

    fetchPermissions();
  }, [permission]);

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-2xl">
        <FaLock className="mr-2" /> Permission Required
      </div>
    );
  }

  return <>{children}</>;
}
