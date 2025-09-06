const mongoose = require("mongoose");

const VacancySchema = new mongoose.Schema(
  {
    // Düz alanlar (AZ / EN)
    title_az: { type: String, default: "", trim: true },
    title_en: { type: String, default: "", trim: true },

    department_az: { type: String, default: "", trim: true },
    department_en: { type: String, default: "", trim: true },

    location_az: { type: String, default: "", trim: true },
    location_en: { type: String, default: "", trim: true },

    description_az: { type: String, default: "" }, // markdown / rich text
    description_en: { type: String, default: "" },

    requirements_az: { type: String, default: "" },
    requirements_en: { type: String, default: "" },

    // Geriye uyumluluk (opsiyonel) — eski tek dilli alanlar
    title: { type: String, trim: true, default: "" },
    department: { type: String, default: "" },
    location: { type: String, default: "" },
    description: { type: String, default: "" },
    requirements: { type: String, default: "" },

    type: {
      type: String,
      enum: ["full-time", "part-time", "internship", "contract"],
      default: "full-time",
    },
    active: { type: Boolean, default: true },
    deadline: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vacancy", VacancySchema);
