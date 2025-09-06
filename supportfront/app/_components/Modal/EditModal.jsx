"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const EditModal = ({ isOpen, onClose, onSubmit, blog }) => {
  const [language, setLanguage] = useState("az");
  const [formData, setFormData] = useState({
    titleAZ: "",
    descriptionAZ: "",
    titleEN: "",
    descriptionEN: "",
    image: null,
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (blog) {
      setFormData({
        titleAZ: blog.titleAZ || "",
        descriptionAZ: blog.descriptionAZ || "",
        titleEN: blog.titleEN || "",
        descriptionEN: blog.descriptionEN || "",
        image: null,
      });
      setPreviewImage(`${process.env.NEXT_PUBLIC_API}/${blog.image}`);
    }
  }, [blog]);

  // modal açıq deyilsə heç nə render etmə
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((p) => ({ ...p, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    const { titleAZ, descriptionAZ, titleEN, descriptionEN } = formData;
    if (!titleAZ || !descriptionAZ || !titleEN || !descriptionEN) {
      toast.error("Zəhmət olmasa bütün sahələri doldurun! (AZ & EN)");
      return;
    }

    const data = new FormData();
    data.append("titleAZ", titleAZ);
    data.append("descriptionAZ", descriptionAZ);
    data.append("titleEN", titleEN);
    data.append("descriptionEN", descriptionEN);
    if (formData.image) data.append("image", formData.image);

    onSubmit(data);
    onClose();
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
          <h2 className="text-xl md:text-2xl font-bold">Blogu redaktə et</h2>
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
                onClick={() => setLanguage(t.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition
                 ${
                   language === t.key
                     ? "bg-black text-white"
                     : "bg-gray-200 hover:bg-gray-300"
                 }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Form Inputs */}
          {language === "az" && (
            <div className="space-y-3">
              <label className="block text-sm font-medium">Başlıq (AZ)</label>
              <input
                type="text"
                name="titleAZ"
                value={formData.titleAZ}
                onChange={handleChange}
                className="w-full border rounded-xl px-3 py-2 focus:outline-none
                           focus:ring-2 focus:ring-black/60"
              />

              <label className="block text-sm font-medium">Açıqlama (AZ)</label>
              <textarea
                name="descriptionAZ"
                value={formData.descriptionAZ}
                onChange={handleChange}
                rows={6}
                className="w-full border rounded-xl px-3 py-2 focus:outline-none
                           focus:ring-2 focus:ring-black/60"
              />
            </div>
          )}

          {language === "en" && (
            <div className="space-y-3">
              <label className="block text-sm font-medium">Title (EN)</label>
              <input
                type="text"
                name="titleEN"
                value={formData.titleEN}
                onChange={handleChange}
                className="w-full border rounded-xl px-3 py-2 focus:outline-none
                           focus:ring-2 focus:ring-black/60"
              />

              <label className="block text-sm font-medium">
                Description (EN)
              </label>
              <textarea
                name="descriptionEN"
                value={formData.descriptionEN}
                onChange={handleChange}
                rows={6}
                className="w-full border rounded-xl px-3 py-2 focus:outline-none
                           focus:ring-2 focus:ring-black/60"
              />
            </div>
          )}

          {/* Image upload */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">Şəkil</label>

            <div className="flex flex-col md:flex-row gap-4">
              <label
                className="flex-1 border-2 border-dashed rounded-xl p-4 text-sm
                           text-gray-600 hover:border-gray-400 cursor-pointer
                           transition"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="block text-center">
                  Yeni şəkil seç (sürükleyib burax da edə bilərsən)
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
            Yadda saxla
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
