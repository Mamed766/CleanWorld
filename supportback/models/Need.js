const mongoose = require("mongoose");

const NeedSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["clothing", "food", "shelter", "health", "education", "other"],
      default: "other",
      index: true,
    },
    description: { type: String, default: "" },
    quantity: { type: Number, default: 1, min: 0 },
    unit: { type: String, default: "pcs" }, // pcs, kg, box, pack, etc.
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true,
    },
    status: {
      type: String,
      enum: ["open", "pending", "fulfilled"],
      default: "open",
      index: true,
    },
    deadline: { type: Date, default: null, index: true },
    location: { type: String, default: "" },
    contact: { type: String, default: "" },
    tags: [{ type: String, index: true }],
    images: [{ type: String }],
  },
  { timestamps: true }
);

NeedSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Need", NeedSchema);
