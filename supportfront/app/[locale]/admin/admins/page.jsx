"use client";

import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaEye, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import adminApi from "../../../utils/adminApi";
import { useLocale } from "next-intl";
import PermissionWrapper from "../../../_components/Permission/PermissionWrapper";

export default function AdminsPage() {
  const locale = useLocale();
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    roleId: "",
  });
  const [createForm, setCreateForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    roleId: "",
  });
  const limit = 10;

  useEffect(() => {
    fetchAdmins();
    fetchRoles();
  }, [search, page]);

  const fetchAdmins = async () => {
    try {
      const { data } = await adminApi.get("/admin/admins", {
        params: { search, page, limit },
      });
      const filteredAdmins = data.data.filter(
        (admin) => admin.role?.name !== "super_admin"
      );
      setAdmins(filteredAdmins);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Adminlər alınamadı!");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data } = await adminApi.get("/admin/roles");
      setRoles(data);
    } catch {
      toast.error("Rollar alınamadı!");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu admini silmək istədiyinizə əminsiniz?")) return;
    try {
      await adminApi.delete(`/admin/admins/${id}`);
      toast.success("Admin silindi!");
      fetchAdmins();
    } catch {
      toast.error("Silinmə uğursuz oldu!");
    }
  };

  const handleView = (admin) => {
    setSelectedAdmin(admin);
    setIsViewModalOpen(true);
  };

  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setEditForm({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      username: admin.username,
      roleId: admin.role?._id || "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditSave = async () => {
    try {
      await adminApi.put(`/admin/admins/${selectedAdmin._id}`, editForm);
      toast.success("Admin yeniləndi!");
      setIsEditModalOpen(false);
      fetchAdmins();
    } catch {
      toast.error("Yenilənmə uğursuz oldu!");
    }
  };

  const handleCreate = async () => {
    try {
      await adminApi.post("/admin/create", createForm);
      toast.success("Admin yaradıldı!");
      setIsCreateModalOpen(false);
      fetchAdmins();
      setCreateForm({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
        roleId: "",
      });
    } catch {
      toast.error("Admin yaradılmadı!");
    }
  };

  if (loading) return <p className="p-4">Yüklənir...</p>;

  return (
    <PermissionWrapper permission={"view_admins"}>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <h1 className="text-2xl font-bold">Adminlər</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition"
          >
            <FaPlus /> Admin yarat
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Axtar (ad, email, username)..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-1/3 border rounded-xl px-3 py-2"
        />

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full hidden sm:table">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left">Ad Soyad</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Username</th>
                <th className="p-3 text-left">Rol</th>
                <th className="p-3 text-left">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin._id} className="hover:bg-gray-50">
                  <td className="p-3">
                    {admin.firstName} {admin.lastName}
                  </td>
                  <td className="p-3">{admin.email}</td>
                  <td className="p-3">{admin.username}</td>
                  <td className="p-3">{admin.role?.name || "—"}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handleView(admin)}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleEdit(admin)}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(admin._id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="grid sm:hidden gap-4 p-3">
            {admins.map((admin) => (
              <div
                key={admin._id}
                className="border rounded-xl p-4 shadow-sm space-y-2"
              >
                <p className="font-semibold">
                  {admin.firstName} {admin.lastName}
                </p>
                <p className="text-sm text-gray-600">{admin.email}</p>
                <p className="text-sm">{admin.username}</p>
                <p className="text-sm italic">{admin.role?.name || "—"}</p>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleView(admin)}
                    className="flex-1 bg-green-500 text-white p-2 rounded-lg"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleEdit(admin)}
                    className="flex-1 bg-blue-500 text-white p-2 rounded-lg"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(admin._id)}
                    className="flex-1 bg-red-500 text-white p-2 rounded-lg"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-2">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>

        {/* View Modal */}
        {isViewModalOpen && selectedAdmin && (
          <ModalLayout
            onClose={() => setIsViewModalOpen(false)}
            title="Admin məlumatları"
          >
            <p>
              <strong>Ad:</strong> {selectedAdmin.firstName}{" "}
              {selectedAdmin.lastName}
            </p>
            <p>
              <strong>Email:</strong> {selectedAdmin.email}
            </p>
            <p>
              <strong>Username:</strong> {selectedAdmin.username}
            </p>
            <p>
              <strong>Rol:</strong> {selectedAdmin.role?.name || "—"}
            </p>
          </ModalLayout>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && (
          <ModalLayout
            onClose={() => setIsEditModalOpen(false)}
            title="Admin redaktə et"
          >
            <input
              type="text"
              placeholder="Ad"
              value={editForm.firstName}
              onChange={(e) =>
                setEditForm({ ...editForm, firstName: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              placeholder="Soyad"
              value={editForm.lastName}
              onChange={(e) =>
                setEditForm({ ...editForm, lastName: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              placeholder="Username"
              value={editForm.username}
              onChange={(e) =>
                setEditForm({ ...editForm, username: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <select
              value={editForm.roleId}
              onChange={(e) =>
                setEditForm({ ...editForm, roleId: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            >
              <option value="">Rol seç</option>
              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                İmtina
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Yadda saxla
              </button>
            </div>
          </ModalLayout>
        )}

        {/* Create Modal */}
        {isCreateModalOpen && (
          <ModalLayout
            onClose={() => setIsCreateModalOpen(false)}
            title="Admin yarat"
          >
            <input
              type="text"
              placeholder="Ad"
              value={createForm.firstName}
              onChange={(e) =>
                setCreateForm({ ...createForm, firstName: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              placeholder="Soyad"
              value={createForm.lastName}
              onChange={(e) =>
                setCreateForm({ ...createForm, lastName: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={createForm.email}
              onChange={(e) =>
                setCreateForm({ ...createForm, email: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              placeholder="Username"
              value={createForm.username}
              onChange={(e) =>
                setCreateForm({ ...createForm, username: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="password"
              placeholder="Şifrə"
              value={createForm.password}
              onChange={(e) =>
                setCreateForm({ ...createForm, password: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <select
              value={createForm.roleId}
              onChange={(e) =>
                setCreateForm({ ...createForm, roleId: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            >
              <option value="">Rol seç</option>
              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                İmtina
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                Yarat
              </button>
            </div>
          </ModalLayout>
        )}
      </div>
    </PermissionWrapper>
  );
}

function ModalLayout({ onClose, title, children }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4"
      >
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-2xl leading-none">
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
