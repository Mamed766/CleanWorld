const express = require("express");
const router = express.Router();
const volunteerController = require("../controllers/volunteerController");
const { adminMiddleware } = require("../middleware/adminMiddleware");

// Public
router.post("/", volunteerController.create);

// Admin
router.get(
  "/",
  adminMiddleware({ permissions: ["application_editor"] }),
  volunteerController.list
);

router.get(
  "/stats",
  adminMiddleware({ permissions: ["application_editor"] }),
  volunteerController.stats
);

router.patch(
  "/:id/approve",
  adminMiddleware({ permissions: ["application_editor"] }),
  volunteerController.approve
);
router.patch(
  "/:id/reject",
  adminMiddleware({ permissions: ["application_editor"] }),
  volunteerController.reject
);
router.delete(
  "/:id",
  adminMiddleware({ permissions: ["application_editor"] }),
  volunteerController.remove
);

module.exports = router;
