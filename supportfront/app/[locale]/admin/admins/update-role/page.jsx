"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import adminApi from "../../../../utils/adminApi";
import { permissionsList } from "../../utils/utils";
import PermissionWrapper from "../../../../_components/Permission/PermissionWrapper";

export default function UpdateRolePage() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const { data } = await adminApi.get("/admin/roles");
      setRoles(data);
    } catch {
      toast.error("Roller alınamadı!");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (roleId) => {
    if (!roleId) {
      setSelectedRole(null);
      setPermissions([]);
      return;
    }
    const role = roles.find((r) => r._id === roleId);
    setSelectedRole(role);
    setPermissions(role?.permissions || []);
  };

  const handlePermissionChange = (perm) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    try {
      await adminApi.put(`/admin/update-permission-role/${selectedRole._id}`, {
        name: selectedRole.name,
        permissions,
      });
      toast.success("Rol başarıyla güncellendi!");
      fetchRoles();
    } catch {
      toast.error("Rol güncellenemedi!");
    }
  };

  const handleDelete = async () => {
    if (!selectedRole) return;
    if (selectedRole.name === "super_admin") {
      return toast.error("super_admin rolü silinemez!");
    }
    if (!confirm("Bu rolü silmek istediğine emin misin?")) return;
    try {
      await adminApi.delete(`/admin/roles/${selectedRole._id}`);
      toast.success("Rol başarıyla silindi!");
      setSelectedRole(null);
      fetchRoles();
    } catch {
      toast.error("Rol silinemedi!");
    }
  };

  if (loading) return <p className="p-4">Yükleniyor...</p>;

  return (
    <PermissionWrapper permission={"update_role"}>
      <div className="p-6 max-w-3xl mx-auto bg-white shadow-lg rounded-2xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Rol Güncelle</h1>

        {/* Role Seçme */}
        <div>
          <label className="block font-medium mb-2 text-gray-700">
            Rol Seç
          </label>
          <select
            onChange={(e) => handleRoleSelect(e.target.value)}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Rol seçin</option>
            {roles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        {/* Permission Listesi */}
        {selectedRole && (
          <div className="border rounded-xl p-4 bg-gray-50 space-y-3 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800">
              {selectedRole.name} - İzinler
            </h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {permissionsList.map((perm) => (
                <label
                  key={perm}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={permissions.includes(perm)}
                    onChange={() => handlePermissionChange(perm)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{perm}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Butonlar */}
        {selectedRole && (
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
            >
              Kaydet
            </button>
            {selectedRole.name !== "super_admin" && (
              <button
                onClick={handleDelete}
                className="px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
              >
                Sil
              </button>
            )}
          </div>
        )}
      </div>
    </PermissionWrapper>
  );
}
