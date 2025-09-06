const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const { ErrorMiddleware } = require("../utils/ErrorHandler");
const { adminMiddleware } = require("../middleware/adminMiddleware");

const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

// GET all (search + pagination + date filters)
router.get("/", getAllEvents);

// GET by ID
router.get("/:id", getEventById);

// CREATE (image upload)
router.post(
  "/",
  adminMiddleware({ permissions: ["event_editor"] }),
  upload.single("image"),
  createEvent
);

// UPDATE
router.put(
  "/:id",
  adminMiddleware({ permissions: ["event_editor"] }),
  upload.single("image"),
  updateEvent
);

// DELETE
router.delete(
  "/:id",
  adminMiddleware({ permissions: ["event_editor"] }),
  deleteEvent
);

// Error middleware
router.use(ErrorMiddleware);

module.exports = router;
