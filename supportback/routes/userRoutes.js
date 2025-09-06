const express = require("express");
const { updateUserProfile } = require("../controllers/userController");

const router = express.Router();

router.put("/profile/:id", updateUserProfile);

module.exports = router;
