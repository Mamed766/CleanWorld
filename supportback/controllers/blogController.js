const path = require("path");
const fs = require("fs");
const Blog = require("../models/Blog");
const { ErrorHandler } = require("../utils/ErrorHandler");

// GET ALL (search + pagination destekli, geriye donuk uyumlu)
const getAllBlogs = async (req, res, next) => {
  try {
    // query parametreleri
    const { page, limit, q } = req.query;

    const hasPagination =
      typeof limit !== "undefined" && String(limit).trim() !== "";

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 0, 0);

    // arama filtresi
    const filter = {};
    if (q && String(q).trim()) {
      const regex = new RegExp(String(q).trim(), "i"); // case-insensitive
      filter.$or = [
        { titleAZ: regex },
        { titleEN: regex },
        { descriptionAZ: regex },
        { descriptionEN: regex },
      ];
    }

    if (hasPagination && limitNum > 0) {
      // sayfalama modu
      const total = await Blog.countDocuments(filter);
      const blogs = await Blog.find(filter)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      if (!blogs.length) {
        return next(new ErrorHandler("No blog posts found", 404));
      }

      return res.status(200).json({
        success: true,
        blogs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } else {
      // eski davranis: sayfalama yok, tumunu dondur
      const blogs = await Blog.find(filter);
      if (!blogs.length) {
        return next(new ErrorHandler("No blog posts found", 404));
      }
      return res.status(200).json({ success: true, blogs });
    }
  } catch (error) {
    next(error);
  }
};

// GET BY ID
const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return next(new ErrorHandler("Blog post not found", 404));
    }
    res.status(200).json({ success: true, blog });
  } catch (error) {
    next(new ErrorHandler("Invalid blog post ID", 400));
  }
};

// CREATE
const createBlog = async (req, res) => {
  try {
    const { titleAZ, titleEN, descriptionAZ, descriptionEN } = req.body;
    const image = req.file?.path;

    const newBlog = await Blog.create({
      titleAZ,
      titleEN,
      descriptionAZ,
      descriptionEN,
      image,
    });

    res.status(201).json({ success: true, newBlog });
  } catch (error) {
    console.log("💥 Blog create error:", error);
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return next(new ErrorHandler("Blog post not found", 404));
    }

    const updatedData = {
      titleAZ: req.body.titleAZ || blog.titleAZ,
      titleEN: req.body.titleEN || blog.titleEN,
      descriptionAZ: req.body.descriptionAZ || blog.descriptionAZ,
      descriptionEN: req.body.descriptionEN || blog.descriptionEN,
      image: req.file?.path || blog.image,
    };

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, updatedBlog });
  } catch (error) {
    next(new ErrorHandler("Invalid blog post ID", 400));
  }
};

// DELETE
const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return next(new ErrorHandler("Blog post not found", 404));
    }

    const imagePath = path.join(
      __dirname,
      "..",
      "uploads",
      path.basename(blog.image || "")
    );

    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Fayl silinirken hata:", err.message);
      }
    });

    res.status(200).json({
      success: true,
      message: "Blog post deleted successfully",
    });
  } catch (error) {
    next(new ErrorHandler("Invalid blog post ID", 400));
  }
};

module.exports = {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};
