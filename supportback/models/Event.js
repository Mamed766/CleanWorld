const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    // i18n alanları – blogla aynı
    titleAZ: { type: String, required: true, trim: true },
    titleEN: { type: String, required: true, trim: true },
    descriptionAZ: { type: String, required: true, trim: true },
    descriptionEN: { type: String, required: true, trim: true },

    // medya
    image: { type: String, required: true },

    // event bilgileri
    startDate: { type: Date, required: true },
    endDate: { type: Date }, // opsiyonel; verilirse start<=end validasyonu controller’da
    location: { type: String, default: "", trim: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// basit arama için
eventSchema.index({
  titleAZ: "text",
  titleEN: "text",
  descriptionAZ: "text",
  descriptionEN: "text",
  location: "text",
});

module.exports = mongoose.model("EventSupport", eventSchema);
