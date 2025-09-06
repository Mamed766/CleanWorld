const mongoose = require("mongoose");

const VolunteerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    birthDate: { type: String, required: true }, // YYYY-MM-DD
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },

    educationLevel: {
      type: String,
      enum: ["Secondary", "Vocational secondary", "Bachelor", "Master+"],
      required: true,
    },
    graduatedSchool: { type: String, required: true },
    profession: { type: String, required: true },
    workplace: { type: String, default: "" },
    position: { type: String, default: "" },

    volunteerAreas: [{ type: String }], // e.g. "Awareness", "Shelter", ...
    otherArea: { type: String, default: "" },

    previousExperience: { type: String, default: "" },
    motivation: { type: String, default: "" },

    weeklyHours: { type: String, enum: ["1–5", "6–10", "11+"], required: true },
    availableDays: [{ type: String }], // e.g. "Monday","Wednesday","Thursday","Weekend"
    availableTimeRange: { type: String, default: "" }, // "10:00-14:00"

    skills: { type: String, default: "" },
    consent: { type: Boolean, required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Volunteer", VolunteerSchema);
