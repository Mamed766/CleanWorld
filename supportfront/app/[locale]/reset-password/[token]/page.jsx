"use client";

import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../../utils/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = params;
  const t = useTranslations("reset");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e?.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await api.post(`/auth/reset-password/${token}`, { password });

      if (res.status === 200) {
        toast.success(t("resetForm.successReset"));
        router.push("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {t("resetForm.title")}
        </h1>

        {/* ✅ form ekledik */}
        <form onSubmit={handleReset}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("resetForm.newPassword")}
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("resetForm.confirmPassword")}
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            disabled={
              !password ||
              !confirmPassword ||
              password !== confirmPassword ||
              loading
            }
            className={`w-full py-2 rounded-lg text-white font-semibold transition 
              ${
                password &&
                confirmPassword &&
                password === confirmPassword &&
                !loading
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            {loading ? "Resetting..." : t("resetForm.resetButton")}
          </button>
        </form>
      </div>
    </div>
  );
}
