const express = require("express");
const {
  createDonation,
  listDonations,
  getDonation,
  updateDonation,
  deleteDonation,
} = require("../controllers/donationController");
const { adminMiddleware } = require("../middleware/adminMiddleware");

const router = express.Router();

router.post(
  "/",
  adminMiddleware({ permissions: ["donation_editor"] }),
  createDonation
);
router.get(
  "/",
  adminMiddleware({ permissions: ["donation_editor"] }),
  listDonations
);
router.get(
  "/:id",
  adminMiddleware({ permissions: ["donation_editor"] }),
  getDonation
);
router.patch(
  "/:id",
  adminMiddleware({ permissions: ["donation_editor"] }),
  updateDonation
);
router.delete(
  "/:id",
  adminMiddleware({ permissions: ["donation_editor"] }),
  deleteDonation
);

module.exports = router;
