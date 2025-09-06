const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const { ErrorMiddleware } = require("../utils/ErrorHandler");
const {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");
const { adminMiddleware } = require("../middleware/adminMiddleware");

// GET all blogs
router.get("/", getAllBlogs);

// GET blog by ID
router.get("/:id", getBlogById);

// POST new blog (image upload)
router.post(
  "/",
  adminMiddleware({ permissions: ["blog_editor"] }),
  upload.single("image"),
  createBlog
);

// PUT update blog
router.put(
  "/:id",
  adminMiddleware({ permissions: ["blog_editor"] }),
  upload.single("image"),
  updateBlog
);

// DELETE blog
router.delete(
  "/:id",
  adminMiddleware({ permissions: ["blog_editor"] }),
  deleteBlog
);

// Error middleware
router.use(ErrorMiddleware);

module.exports = router;
