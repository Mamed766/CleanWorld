const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    titleAZ: { type: String, required: true },
    titleEN: { type: String, required: true },
    descriptionAZ: { type: String, required: true },
    descriptionEN: { type: String, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BlogSupport", blogSchema);
