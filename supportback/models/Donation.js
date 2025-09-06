const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["clothing", "food", "school", "other"],
      required: true,
    },
    name: { type: String, trim: true },
    quantity: { type: Number, min: 0, default: 1 },
    unit: { type: String, trim: true }, // pcs, kg, set...
  },
  { _id: false }
);

const DonationSchema = new mongoose.Schema(
  {
    donorName: { type: String, required: true, trim: true },

    donationType: { type: String, enum: ["money", "goods"], required: true },

    // money
    amount: { type: Number, min: 0, default: 0 },
    currency: { type: String, default: "AZN" },

    // goods
    items: { type: [ItemSchema], default: [] },

    // hızlı sınıflama (liste/filtre için)
    majorCategory: {
      type: String,
      enum: ["clothing", "food", "school", "mixed", "none"],
      default: "none",
    },

    note: { type: String, trim: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser" },

    // soft delete
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// search: donorName + note
DonationSchema.index({ donorName: "text", note: "text" });

module.exports = mongoose.model("Donation", DonationSchema);
