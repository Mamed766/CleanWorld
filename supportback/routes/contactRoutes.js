const { Router } = require("express");
const {
  createContactMessage,
  listContactMessages,
  markRead,
  replyMessage,
} = require("../controllers/contactController");
const { adminMiddleware } = require("../middleware/adminMiddleware");

const router = Router();

// PUBLIC
// POST /api/v3/contact
router.post("/", createContactMessage);

// ADMIN
// GET /api/v3/contact/admin
router.get(
  "/admin",
  adminMiddleware({ permissions: ["user_response"] }),
  listContactMessages
);

// PATCH /api/v3/contact/admin/:id/read
router.patch(
  "/admin/:id/read",
  adminMiddleware({ permissions: ["user_response"] }),
  markRead
);

// POST /api/v3/contact/admin/:id/reply
router.post(
  "/admin/:id/reply",
  adminMiddleware({ permissions: ["user_response"] }),
  replyMessage
);

module.exports = router;
