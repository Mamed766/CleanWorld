"use client";
import axios from "axios";

import api from "../../utils/api";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "react-toastify";
const countries = [{ value: "AZ", label: "Azerbaijan" }];

export default function ContactForm() {
  const t = useTranslations("registration");

  const initialFormData = {
    firstName: "",
    lastName: "",
    country: "Azerbaijan",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const response = await api.post("/users", formData);
      toast.success(response.data.message || "User registered successfully!");

      setFormData(initialFormData);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed!");
    }
  };

  return (
    <>
      <div className="py-[13rem]">
        <h2 className="text-center text-[30px] font-[600] pb-[2rem]">
          {t("title")}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="max-w-lg mx-auto bg-[#f4f4f4] py-6  px-[2rem]  space-y-4"
        >
          {/* Title & Suffix */}
          {/* <div className="flex space-x-4">
            <select
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-1/2  p-2 "
            >
              <option value="">{t("placeholders.title")}</option>
              <option value="Mr">Mr</option>
              <option value="Ms">Ms</option>
              <option value="Mrs">Mrs</option>
              <option value="Dr">Dr</option>
            </select>

            <select
              name="suffix"
              value={formData.suffix}
              onChange={handleChange}
              className="w-1/2  p-2 rounded"
            >
              <option value="">{t("placeholders.suffix")}</option>
              <option value="Jr">Jr</option>
              <option value="Sr">Sr</option>
              <option value="III">III</option>
            </select>
          </div>

          {/* First & Last Name */}
          <input
            type="text"
            name="firstName"
            placeholder={t("form.firstName")}
            value={formData.firstName}
            onChange={handleChange}
            className="w-full border p-2 "
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder={t("form.lastName")}
            value={formData.lastName}
            onChange={handleChange}
            className="w-full border p-2 "
            required
          />

          {/* Username */}
          <input
            type="text"
            name="username"
            placeholder={t("form.username")}
            value={formData.username}
            onChange={handleChange}
            className="w-full border p-2 "
            required
          />

          {/* Country */}
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full border p-2 "
          >
            {countries?.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>

          {/* Address */}
          <input
            type="text"
            name="streetAddress"
            placeholder={t("form.streetAddress")}
            value={formData.streetAddress}
            onChange={handleChange}
            className="w-full border p-2 "
            required
          />

          {/* City, State, Zip */}
          <input
            type="text"
            name="city"
            placeholder={t("form.city")}
            value={formData.city}
            onChange={handleChange}
            className="w-full border p-2 "
            required
          />
          <input
            type="text"
            name="state"
            placeholder={t("form.state")}
            value={formData.state}
            onChange={handleChange}
            className="w-full border p-2 "
            required
          />
          <input
            type="text"
            name="zipCode"
            placeholder={t("form.zipCode")}
            value={formData.zipCode}
            onChange={handleChange}
            className="w-full border p-2 "
            required
          />

          {/* Phone */}
          <div className="flex space-x-2">
            <input
              type="text"
              name="phone"
              placeholder={t("placeholders.phone")}
              value={formData.phone}
              onChange={handleChange}
              className="flex-1 border p-2 "
              required
            />
          </div>

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder={t("form.email")}
            value={formData.email}
            onChange={handleChange}
            className="w-full border p-2 "
            required
          />

          <p className="text-xs text-gray-500 mt-1">{t("validate.title")}</p>

          <input
            type="password"
            name="password"
            placeholder={t("form.password")}
            value={formData.password}
            onChange={handleChange}
            className="w-full border p-2 "
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder={t("form.confirmPassword")}
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full border p-2 "
            required
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            {t("buttons.continue")}
          </button>
        </form>
      </div>
    </>
  );
}
