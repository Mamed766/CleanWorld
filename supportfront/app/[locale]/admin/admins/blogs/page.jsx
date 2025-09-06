"use client";

import { useEffect, useState, useCallback } from "react";
import { FiLoader } from "react-icons/fi";
import { toast } from "react-toastify";
import PermissionWrapper from "@/app/_components/Permission/PermissionWrapper";
import adminApi from "../../../../utils/adminApi";
import Modal from "../../../../_components/Modal/Modal";
import EditModal from "../../../../_components/Modal/EditModal";
import CreateModal from "../../../../_components/Modal/CreateModal";
import { truncateText } from "../../utils/utils";

const DEFAULT_LIMIT = 10;

const BlogAdmin = () => {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [loading, setLoading] = useState(false);

  // Search & Pagination
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (q && q.trim()) params.q = q.trim();

      const res = await adminApi.get("/admin/blogs", { params });

      // API iki durumu da desteklesin: { blogs } VEYA { blogs, pagination: {...} }
      const list = res?.data?.blogs || [];
      const pagination = res?.data?.pagination;

      setBlogs(list);

      if (pagination) {
        setTotal(pagination.total || 0);
        setTotalPages(pagination.totalPages || 1);
      } else {
        // Eski backend davranışı (pagination yoksa)
        setTotal(list.length);
        setTotalPages(1);
        if (page !== 1) setPage(1);
      }
    } catch {
      console.log("Bloglar yüklənə bilmədi");
    } finally {
      setLoading(false);
    }
  }, [page, limit, q]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleDelete = async (id) => {
    if (!confirm("Bu blogu silmək istədiyinizə əminsiniz?")) return;
    try {
      await adminApi.delete(`/admin/blogs/${id}`);
      toast.success("Blog silindi");

      // Sayfalama/totali düzgün saxlamaq üçün yenidən çək
      // Son səhifədə son elementi sildikdə boş qalırsa, bir əvvəlki səhifəyə keç
      if (blogs.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchBlogs();
      }
    } catch {
      toast.error("Silinmə zamanı xəta baş verdi");
    }
  };

  const handleUpdate = async (updatedData) => {
    try {
      const res = await adminApi.put(
        `/admin/blogs/${selectedBlog._id}`,
        updatedData
      );
      const updated = res.data.updatedBlog;

      // Yerində güncelle + toplanı yenidən çəkməyə ehtiyac yoxdur
      setBlogs((prev) =>
        prev.map((b) => (b._id === updated._id ? updated : b))
      );
      toast.success("Blog yeniləndi");
      setShowEditModal(false);
      setSelectedBlog(null);
    } catch {
      toast.error("Yenilənmə zamanı xəta baş verdi");
    }
  };

  const handleCreate = async (data) => {
    try {
      await adminApi.post("/admin/blogs", data);
      toast.success("Blog yaradıldı");
      setShowCreateModal(false);

      // Yeni əlavə olundu — siyahını yenilə.
      // (Əgər page>1 və s. kimi hallar varsa düzgün hesablanması üçün refetch)
      setPage(1); // yeni əlavə olunan ən üstdə görünsün deyə 1-ci səhifəyə dön
      fetchBlogs();
    } catch {
      toast.error("Yaratma zamanı xəta baş verdi");
    }
  };

  const handleView = (blog) => {
    setSelectedBlog(blog);
    setShowViewModal(true);
  };

  const handleEdit = (blog) => {
    setSelectedBlog(blog);
    setShowEditModal(true);
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBlogs();
  };

  const clearSearch = () => {
    if (!q) return;
    setQ("");
    setPage(1);
  };

  const goPrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const goNext = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  return (
    <PermissionWrapper permission="blog_editor">
      <div className="p-6 mt-[6rem] max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <h1 className="text-2xl font-bold text-gray-800">
            Blog Admin Paneli
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
          >
            Yeni Blog
          </button>
        </div>

        {/* Search + Pagination Controls */}
        <div className="mb-4 flex flex-col md:flex-row gap-3 md:items-center">
          <form
            onSubmit={onSearchSubmit}
            className="flex gap-2 items-center w-full md:w-auto"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Axtar: başlıq və ya təsvir..."
              className="w-full md:w-80 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
            >
              Axtar
            </button>
            <button
              type="button"
              onClick={clearSearch}
              className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Təmizlə
            </button>
          </form>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Səhifə ölçüsü:</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(1);
              }}
              className="border rounded-lg px-2 py-2"
            >
              {[5, 10, 15, 20, 30].map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Cəmi: <b>{total}</b>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={goPrev}
                disabled={page <= 1 || loading}
                className="px-3 py-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50"
              >
                Öncekı
              </button>
              <span className="text-sm text-gray-700">
                Səhifə <b>{page}</b> / {totalPages}
              </span>
              <button
                onClick={goNext}
                disabled={page >= totalPages || loading}
                className="px-3 py-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50"
              >
                Sonrakı
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <FiLoader className="animate-spin text-4xl text-gray-500" />
          </div>
        ) : (
          <div className="rounded-lg shadow bg-white overflow-hidden">
            {/* Header - yalnız böyük ekranda */}
            <div className="hidden md:grid md:grid-cols-6 font-semibold bg-gray-100 p-3 text-gray-700">
              <div>Şəkil</div>
              <div>Title AZ</div>
              <div>Description AZ</div>
              <div className="col-span-3 text-center">Əməliyyatlar</div>
            </div>

            {blogs && blogs.length > 0 ? (
              blogs.map((blog, idx) => (
                <div
                  key={blog._id}
                  className={`border-b md:grid md:grid-cols-6 items-center p-3 transition ${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100 flex flex-col md:flex-none gap-3`}
                >
                  {/* Şəkil */}
                  <div>
                    <img
                      src={`${process.env.NEXT_PUBLIC_API}/${blog.image}`}
                      alt="blog"
                      className="w-16 h-16 object-cover rounded-lg shadow-sm"
                    />
                  </div>

                  {/* Title */}
                  <div className="truncate">
                    {truncateText(blog.titleAZ, 20)}
                  </div>

                  {/* Description */}
                  <div className="truncate">
                    {truncateText(blog.descriptionAZ, 30)}
                  </div>

                  {/* Buttons */}
                  <div className="md:col-span-3 flex gap-2 flex-wrap justify-start md:justify-center">
                    <button
                      onClick={() => handleView(blog)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                    >
                      Bax
                    </button>
                    <button
                      onClick={() => handleEdit(blog)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                    >
                      Redaktə et
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                Heç bir blog tapılmadı.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bax Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)}>
        {selectedBlog && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 break-words">
              {selectedBlog.titleAZ} / {selectedBlog.titleEN}
            </h2>

            <img
              src={`${process.env.NEXT_PUBLIC_API}/${selectedBlog.image}`}
              alt="blog"
              className="w-full max-h-[350px] object-cover rounded-lg shadow"
            />

            <div className="text-sm text-gray-700 leading-relaxed space-y-3 break-words">
              <p className="whitespace-pre-line break-words">
                {selectedBlog.descriptionAZ}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <EditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        blog={selectedBlog}
        onSubmit={handleUpdate}
      />

      {/* Create Modal */}
      <CreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
      />
    </PermissionWrapper>
  );
};

export default BlogAdmin;
