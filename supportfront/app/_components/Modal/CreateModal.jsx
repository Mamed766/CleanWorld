"use client";

import { useState } from "react";
import { toast } from "react-toastify";

const CreateModal = ({ isOpen, onClose, onSubmit }) => {
  const [activeLang, setActiveLang] = useState("az");
  const [form, setForm] = useState({
    titleAZ: "",
    titleEN: "",
    descriptionAZ: "",
    descriptionEN: "",
    image: null,
  });
  const [previewImage, setPreviewImage] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setForm((prev) => ({ ...prev, image: file || null }));
    setPreviewImage(file ? URL.createObjectURL(file) : null);
  };

  const handleSave = async () => {
    const { titleAZ, titleEN, descriptionAZ, descriptionEN, image } = form;

    if (!titleAZ || !titleEN || !descriptionAZ || !descriptionEN || !image) {
      toast.error("Zəhmət olmasa bütün sahələri doldurun! (AZ & EN)");
      return;
    }

    const formData = new FormData();
    formData.append("titleAZ", titleAZ);
    formData.append("titleEN", titleEN);
    formData.append("descriptionAZ", descriptionAZ);
    formData.append("descriptionEN", descriptionEN);
    formData.append("image", image);

    await onSubmit(formData);
    onClose();
    setForm({
      titleAZ: "",
      titleEN: "",
      descriptionAZ: "",
      descriptionEN: "",
      image: null,
    });
    setPreviewImage(null);
    setActiveLang("az");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-3xl rounded-2xl shadow-xl relative
                   max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur border-b px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold">Yeni blog yarat</h2>
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
          {/* Language tabs */}
          <div className="flex gap-2">
            {[
              { key: "az", label: "Azərbaycan dili" },
              { key: "en", label: "English" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveLang(t.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition
                 ${
                   activeLang === t.key
                     ? "bg-black text-white"
                     : "bg-gray-200 hover:bg-gray-300"
                 }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* AZ fields */}
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

          {/* EN fields */}
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

          {/* Image upload + preview */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">Şəkil</label>
            <div className="flex flex-col md:flex-row gap-4">
              <label className="flex-1 border-2 border-dashed rounded-xl p-4 text-sm text-gray-600 hover:border-gray-400 cursor-pointer transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
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

export default CreateModal;
