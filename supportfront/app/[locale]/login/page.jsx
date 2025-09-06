"use client";
import axios from "axios";
import { setCookie } from "cookies-next";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FaUser } from "react-icons/fa";
import { toast } from "react-toastify";

import api from "../../utils/api";

export default function LoginForm() {
  const t = useTranslations("login");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post(`/auth`, formData);

      setCookie("token", response.data, { maxAge: 60 * 60 * 24 * 7 });

      setFormData({ email: "", password: "" });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      toast.success(response.data.message || "Login successful!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed!");
      setLoading(false);
    }
  };

  return (
    <div className="py-[15rem]">
      <h2 className="text-center text-[30px] font-[600] pb-[2rem]">
        {t("title")}
      </h2>
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto bg-[#f4f4f4] py-6 px-[2rem] space-y-4"
      >
        {/* Email */}
        <div className="flex justify-center">
          <FaUser fontSize={70} color="#C09F80" />
        </div>
        <input
          type="email"
          name="email"
          placeholder={t("form.email")}
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-2"
          required
        />
        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder={t("form.password")}
          value={formData.password}
          onChange={handleChange}
          className="w-full border p-2"
          required
        />
        {/* Submit Button */}

        <a href="/forgot-password" className="pb-[20px]">
          {t("forgot")}
        </a>
        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white p-2 mt-[5px] rounded  
               ${
                 loading
                   ? "bg-gray-400 cursor-not-allowed"
                   : "bg-blue-600 hover:bg-blue-700"
               }
            `}
        >
          {t("buttons.login")}
        </button>
      </form>
    </div>
  );
}
