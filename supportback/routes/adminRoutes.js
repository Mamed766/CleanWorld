const express = require("express");
const {
  createAdmin,
  loginAdmin,
  updateAdminRole,
  getAllAdmins,
  getAdminById,
  updateAdminById,
  deleteAdminById,
  getAdminProfile,
} = require("../controllers/adminController");
const { adminMiddleware } = require("../middleware/adminMiddleware");
const {
  createRole,
  getRoles,
  updateRole,
  deleteRole,
} = require("../controllers/roleController");
const {
  getAllUsers,
  deleteUserByAdmin,
  updateUserByAdmin,
  getUserById,
} = require("../controllers/userController");
const { authMiddleware } = require("../middleware/middleware");

const router = express.Router();

// Sadece super_admin yeni admin oluşturabilir
router.post(
  "/create",
  adminMiddleware({ permissions: ["create_admin"] }),
  createAdmin
);
router.post(
  "/roles",
  adminMiddleware({ permissions: ["create_role"] }),
  createRole
);
router.get("/roles", adminMiddleware({ permissions: ["get_roles"] }), getRoles);

router.put(
  "/update-permission-role/:id",
  adminMiddleware({ permissions: ["update_role"] }),
  updateRole
);

router.put(
  "/update-role/:id",
  adminMiddleware({ permissions: ["update_role"] }),
  updateAdminRole
);

router.delete(
  "/roles/:id",
  adminMiddleware({ permissions: ["delete_role"] }),
  deleteRole
);

// Admin login
router.post("/login", loginAdmin);

//Users Control
router.get(
  "/users",
  adminMiddleware({ permissions: ["view_users"] }),
  getAllUsers
);
router.put(
  "/users/:id",
  adminMiddleware({ permissions: ["update_users"] }),
  updateUserByAdmin
);
router.delete(
  "/users/:id",
  adminMiddleware({ permissions: ["delete_users"] }),
  deleteUserByAdmin
);

router.get(
  "/users/:id",
  adminMiddleware({ permissions: ["view_users"] }),
  getUserById
);

//Admins Control
router.get(
  "/admins",
  adminMiddleware({ permissions: ["view_admins"] }),
  getAllAdmins
);
router.get(
  "/admins/:id",
  adminMiddleware({ permissions: ["view_admins"] }),
  getAdminById
);
router.put(
  "/admins/:id",
  adminMiddleware({ permissions: ["update_admin"] }),
  updateAdminById
);
router.delete(
  "/admins/:id",
  adminMiddleware({ permissions: ["delete_admin"] }),
  deleteAdminById
);

router.get("/me", adminMiddleware(), getAdminProfile);

module.exports = router;
