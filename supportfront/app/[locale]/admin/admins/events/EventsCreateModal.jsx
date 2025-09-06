"use client";

import { useState } from "react";
import { toast } from "react-toastify";

const EventsCreateModal = ({ isOpen, onClose, onSubmit }) => {
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
    image: null,
  });
  const [previewImage, setPreviewImage] = useState(null);

  if (!isOpen) return null;

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
    const {
      titleAZ,
      titleEN,
      descriptionAZ,
      descriptionEN,
      image,
      startDate,
      status,
    } = form;

    if (!titleAZ || !titleEN || !descriptionAZ || !descriptionEN) {
      toast.error("AZ & EN başlıq və açıqlamalar zəhmət olmasa doldurun.");
      return;
    }
    if (!image) {
      toast.error("Şəkil seçin.");
      return;
    }
    if (!startDate) {
      toast.error("Başlama tarixi (startDate) vacibdir.");
      return;
    }
    if (!status) {
      toast.error("Status seçin (draft/published).");
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") fd.append(k, v);
    });

    await onSubmit(fd);
    onClose();
    setActiveLang("az");
    setForm({
      titleAZ: "",
      titleEN: "",
      descriptionAZ: "",
      descriptionEN: "",
      location: "",
      status: "draft",
      isFeatured: false,
      startDate: "",
      endDate: "",
      image: null,
    });
    setPreviewImage(null);
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
          <h2 className="text-xl md:text-2xl font-bold">Yeni Event yarat</h2>
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
                id="isFeatured"
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
              />
              <label htmlFor="isFeatured" className="text-sm font-medium">
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
          <div className="space-y-3">
            <label className="block text-sm font-medium">Şəkil</label>
            <div className="flex flex-col md:flex-row gap-4">
              <label className="flex-1 border-2 border-dashed rounded-xl p-4 text-sm text-gray-600 hover:border-gray-400 cursor-pointer transition">
                <input
                  type="file"
                  accept="image/*"
                  name="image"
                  onChange={handleChange}
                  className="hidden"
                />
                <span className="block text-center">
                  Şəkil seç (sürükleyib burax da edə bilərsən)
                </span>
              </label>

              {previewImage && (
                <div className="flex-1">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl shadow"
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
            className="px-4 py-2 rounded-xl text-white bg-black hover:bg-gray-900 transition"
          >
            Yarat
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventsCreateModal;
