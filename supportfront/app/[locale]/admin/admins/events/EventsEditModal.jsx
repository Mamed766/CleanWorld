"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const isoToLocalInput = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    // YYYY-MM-DDTHH:mm
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  } catch {
    return "";
  }
};

const EventsEditModal = ({ isOpen, onClose, initialData, onSubmit }) => {
  const [activeLang, setActiveLang] = useState("az");
  const [form, setForm] = useState({
    titleAZ: "",
    titleEN: "",
    descriptionAZ: "",
    descriptionEN: "",
    location: "",
    status: "draft",
    isFeatured: false,
    startDate: "",
    endDate: "",
    image: null, // yeni dosya seçilirse
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (isOpen && initialData) {
      setForm({
        titleAZ: initialData.titleAZ || "",
        titleEN: initialData.titleEN || "",
        descriptionAZ: initialData.descriptionAZ || "",
        descriptionEN: initialData.descriptionEN || "",
        location: initialData.location || "",
        status: initialData.status || "draft",
        isFeatured: !!initialData.isFeatured,
        startDate: isoToLocalInput(initialData.startDate),
        endDate: isoToLocalInput(initialData.endDate),
        image: null,
      });
      setPreviewImage(null);
      setActiveLang("az");
    }
  }, [isOpen, initialData]);

  if (!isOpen || !initialData) return null;

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      const file = files?.[0] || null;
      setForm((prev) => ({ ...prev, [name]: file }));
      setPreviewImage(file ? URL.createObjectURL(file) : null);
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (
      !form.titleAZ ||
      !form.titleEN ||
      !form.descriptionAZ ||
      !form.descriptionEN
    ) {
      toast.error("AZ & EN başlıq və açıqlamalar doldurulmalıdır.");
      return;
    }
    if (!form.startDate) {
      toast.error("Başlama tarixi (startDate) vacibdir.");
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === "image" && !v) return; // resim seçilmediyse gönderme
      if (v !== undefined && v !== null && v !== "") fd.append(k, v);
    });

    await onSubmit(fd);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-4xl rounded-2xl shadow-xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur border-b px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold">Eventi Redaktə et</h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none text-gray-500 hover:text-gray-800"
            aria-label="Bağla"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-4 space-y-6">
          {/* Dil sekmeleri */}
          <div className="flex gap-2">
            {[
              { key: "az", label: "Azərbaycan dili" },
              { key: "en", label: "English" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveLang(t.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeLang === t.key
                    ? "bg-black text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* AZ */}
          {activeLang === "az" && (
            <div className="space-y-3">
              <label className="block text-sm font-medium">Başlıq (AZ)</label>
              <input
                name="titleAZ"
                value={form.titleAZ}
                onChange={handleChange}
                placeholder="Title AZ"
                className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/60"
              />
              <label className="block text-sm font-medium">Açıqlama (AZ)</label>
              <textarea
                name="descriptionAZ"
                value={form.descriptionAZ}
                onChange={handleChange}
                placeholder="Description AZ"
                rows={6}
                className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/60"
              />
            </div>
          )}

          {/* EN */}
          {activeLang === "en" && (
            <div className="space-y-3">
              <label className="block text-sm font-medium">Title (EN)</label>
              <input
                name="titleEN"
                value={form.titleEN}
                onChange={handleChange}
                placeholder="Title EN"
                className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/60"
              />
              <label className="block text-sm font-medium">
                Description (EN)
              </label>
              <textarea
                name="descriptionEN"
                value={form.descriptionEN}
                onChange={handleChange}
                placeholder="Description EN"
                rows={6}
                className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/60"
              />
            </div>
          )}

          {/* Event meta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">Məkan</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Location"
                className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border rounded-xl px-3 py-2"
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                id="isFeatured_edit"
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
              />
              <label htmlFor="isFeatured_edit" className="text-sm font-medium">
                Featured
              </label>
            </div>
          </div>

          {/* Tarihler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm text-gray-700">
              Start Date
              <input
                type="datetime-local"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="mt-1 border rounded-xl px-3 py-2 w-full"
              />
            </label>
            <label className="text-sm text-gray-700">
              End Date (opsiyonel)
              <input
                type="datetime-local"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="mt-1 border rounded-xl px-3 py-2 w-full"
              />
            </label>
          </div>

          {/* Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <div className="text-sm text-gray-600 mb-2">Mövcud şəkil</div>
              {initialData?.image ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API}/${initialData.image}`}
                  alt="current"
                  className="w-full h-48 object-cover rounded-xl shadow"
                />
              ) : (
                <div className="w-full h-48 border rounded-xl flex items-center justify-center text-sm text-gray-500">
                  Şəkil yoxdur
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Yeni şəkil (opsiyonel)
              </label>
              <label className="border-2 border-dashed rounded-xl p-4 text-sm text-gray-600 hover:border-gray-400 cursor-pointer transition block">
                <input
                  type="file"
                  accept="image/*"
                  name="image"
                  onChange={handleChange}
                  className="hidden"
                />
                <span className="block text-center">Yeni şəkil seç</span>
              </label>

              {previewImage && (
                <div className="mt-3">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-xl shadow"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/80 backdrop-blur border-t px-6 py-4 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
          >
            Bağla
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-white bg-yellow-600 hover:bg-yellow-700 transition"
          >
            Yenilə
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventsEditModal;
