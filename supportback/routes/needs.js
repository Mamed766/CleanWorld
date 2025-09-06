const router = require("express").Router();
const ctrl = require("../controllers/needsController");
const { adminMiddleware } = require("../middleware/adminMiddleware");

// /needs
router.get(
  "/",
  adminMiddleware({ permissions: ["needs_manager"] }),
  ctrl.listNeeds
);
router.post(
  "/",
  adminMiddleware({ permissions: ["needs_manager"] }),
  ctrl.createNeed
);
router.put(
  "/:id",
  adminMiddleware({ permissions: ["needs_manager"] }),
  ctrl.updateNeed
);
router.delete(
  "/:id",
  adminMiddleware({ permissions: ["needs_manager"] }),
  ctrl.deleteNeed
);

// quick action
router.post(
  "/:id/fulfill",
  adminMiddleware({ permissions: ["needs_manager"] }),
  ctrl.markFulfilled
);

module.exports = router;
