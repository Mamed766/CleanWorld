const mongoose = require("mongoose");

const VacancyApplicationSchema = new mongoose.Schema(
  {
    vacancy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vacancy",
      required: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    coverLetter: { type: String, default: "" },
    cvPath: { type: String, required: true }, // uploads/vacancy/xxx.pdf
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending",
    },
    notes: { type: String, default: "" }, // admin iç not
  },
  { timestamps: true }
);

module.exports = mongoose.model("VacancyApplication", VacancyApplicationSchema);
