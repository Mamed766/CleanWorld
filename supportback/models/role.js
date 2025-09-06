const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // ör: "User Manager"
  permissions: [{ type: String }], // ör: ["view_users", "delete_users"]
});

const Role = mongoose.model("Role", roleSchema);
module.exports = { Role };
