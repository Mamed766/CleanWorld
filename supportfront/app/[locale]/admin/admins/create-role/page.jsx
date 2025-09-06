"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import adminApi from "../../../../utils/adminApi";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { permissionsList } from "../../utils/utils";
import PermissionWrapper from "../../../../_components/Permission/PermissionWrapper";

export default function CreateRolePage() {
  const locale = useLocale();
  const router = useRouter();

  const [roleForm, setRoleForm] = useState({
    name: "",
    permissions: [],
  });

  const togglePermission = (permission) => {
    setRoleForm((prev) => {
      const permissions = prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission];
      return { ...prev, permissions };
    });
  };

  const handleCreateRole = async () => {
    if (!roleForm.name.trim()) {
      toast.error("Rol adı boş olamaz!");
      return;
    }
    try {
      await adminApi.post("/admin/roles", roleForm);
      toast.success("Rol başarıyla oluşturuldu!");
      router.push(`/${locale}/admin`);
    } catch {
      toast.error("Rol oluşturulamadı!");
    }
  };

  return (
    <PermissionWrapper permission={"create_role"}>
      <div className="p-6 max-w-xl mx-auto bg-white shadow-lg rounded-2xl space-y-6">
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800">Yeni Rol Oluştur</h1>

        {/* Role Name */}
        <div>
          <label className="block font-medium mb-1 text-gray-700">
            Rol Adı
          </label>
          <input
            type="text"
            placeholder="Rol adını daxil edin"
            value={roleForm.name}
            onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        {/* Permissions */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-800">İzinlər</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {permissionsList.map((permission) => (
              <label
                key={permission}
                className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={roleForm.permissions.includes(permission)}
                  onChange={() => togglePermission(permission)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{permission}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => router.push(`/${locale}/admin/admins`)}
            className="px-5 py-2 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 transition"
          >
            İmtina
          </button>
          <button
            onClick={handleCreateRole}
            className="px-5 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
          >
            Yarat
          </button>
        </div>
      </div>
    </PermissionWrapper>
  );
}
