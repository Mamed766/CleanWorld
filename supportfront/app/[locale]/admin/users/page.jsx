"use client";

import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { toast } from "react-toastify";
import adminApi from "../../../utils/adminApi";
import PermissionWrapper from "../../../_components/Permission/PermissionWrapper";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await adminApi.get("/admin/users");
      const userList = data.users || data;
      setUsers(userList);
      setFilteredUsers(userList);
    } catch (err) {
      toast.error("İstifadəçilar alınamadı!");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = users.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(value) ||
        u.email.toLowerCase().includes(value)
    );
    setFilteredUsers(filtered);
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu İstifadəçiyı silmek istiyor musun?")) return;
    try {
      await adminApi.delete(`/admin/users/${id}`);
      const updated = users.filter((u) => u._id !== id);
      setUsers(updated);
      setFilteredUsers(updated);
      toast.success("İstifadəçi silindi!");
    } catch {
      toast.error("Silme işlemi başarısız!");
    }
  };

  const handleView = async (id) => {
    try {
      const { data } = await adminApi.get(`/admin/users/${id}`);
      setSelectedUser(data);
      setIsViewModalOpen(true);
    } catch {
      toast.error("İstifadəçi məlumatları alınamadı!");
    }
  };

  const handleEdit = async (id) => {
    try {
      const { data } = await adminApi.get(`/admin/users/${id}`);
      setSelectedUser(data);
      setEditData({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      });
      setIsEditModalOpen(true);
    } catch {
      toast.error("İstifadəçi məlumatları alınamadı!");
    }
  };

  const handleEditSubmit = async () => {
    try {
      await adminApi.put(`/admin/users/${selectedUser._id}`, editData);
      toast.success("Kullanıcı güncellendi!");
      setIsEditModalOpen(false);
      fetchUsers();
    } catch {
      toast.error("Güncelleme başarısız!");
    }
  };

  if (loading) return <p className="p-4">Yüklənir...</p>;

  return (
    <PermissionWrapper permission={"view_users"}>
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">İstifadəçilər</h1>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="İstifadəçi axtar (ad və ya soyad)..."
          value={search}
          onChange={handleSearch}
          className="w-full md:w-1/3 mb-4 p-2 border rounded"
        />

        {/* Desktop Table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left border-b">Ad</th>
                <th className="p-3 text-left border-b">Email</th>
                <th className="p-3 text-left border-b">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="p-3 border-b">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="p-3 border-b">{user.email}</td>
                  <td className="p-3 border-b flex gap-2">
                    <button
                      onClick={() => handleView(user._id)}
                      className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleEdit(user._id)}
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="mt-4 space-y-4 md:hidden">
          {filteredUsers.map((user) => (
            <div key={user._id} className="border rounded-lg p-3 shadow-sm">
              <p>
                <strong>Name:</strong> {user.firstName} {user.lastName}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleView(user._id)}
                  className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  <FaEye />
                </button>
                <button
                  onClick={() => handleEdit(user._id)}
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(user._id)}
                  className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View Modal */}
        {isViewModalOpen && selectedUser && (
          <div
            onClick={() => setIsViewModalOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm   bg-opacity-50 flex justify-center items-center"
          >
            <div
              className="bg-white p-6 rounded shadow w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-4">
                İstifadəçi məlumatları
              </h2>
              <p>
                <strong>Ad:</strong> {selectedUser.firstName}{" "}
                {selectedUser.lastName}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>İstifadəçi Adı:</strong> {selectedUser.username}
              </p>
              <p>
                <strong>Telefon:</strong> {selectedUser.phone}
              </p>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Kapat
              </button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && selectedUser && (
          <div
            onClick={() => setIsEditModalOpen(false)}
            className="fixed   inset-0 bg-black/20 backdrop-blur-sm  flex justify-center items-center"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-6 rounded shadow w-96"
            >
              <h2 className="text-xl font-semibold mb-4">İstifadəçi Düzenle</h2>
              <input
                type="text"
                value={editData.firstName}
                onChange={(e) =>
                  setEditData({ ...editData, firstName: e.target.value })
                }
                className="w-full border p-2 mb-2 rounded"
                placeholder="Ad"
              />
              <input
                type="text"
                value={editData.lastName}
                onChange={(e) =>
                  setEditData({ ...editData, lastName: e.target.value })
                }
                className="w-full border p-2 mb-2 rounded"
                placeholder="Soyad"
              />
              <input
                type="email"
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
                className="w-full border p-2 mb-2 rounded"
                placeholder="Email"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleEditSubmit}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Saxla
                </button>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Ləğv et
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionWrapper>
  );
}
