// controllers/needs.controller.js
const Need = require("../models/Need");

// GET /needs?search=&status=&category=&priority=&page=1&limit=10&sort=-createdAt
exports.listNeeds = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      category = "",
      priority = "",
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    const q = {};
    if (status) q.status = status;
    if (category) q.category = category;
    if (priority) q.priority = priority;

    if (search) {
      // regex search fallback (works even without text index)
      q.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
      // If you prefer $text search, uncomment below and remove the regex block:
      // q.$text = { $search: search };
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Need.find(q).sort(sort).skip(skip).limit(limitNum),
      Need.countDocuments(q),
    ]);

    res.json({
      ok: true,
      data: items,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Failed to fetch needs",
      error: err.message,
    });
  }
};

// POST /needs
exports.createNeed = async (req, res) => {
  try {
    const body = req.body || {};

    const need = await Need.create({
      title: body.title,
      category: body.category || "other",
      description: body.description || "",
      quantity: Number(body.quantity) || 1,
      unit: body.unit || "pcs",
      priority: body.priority || "medium",
      status: body.status || "open",
      deadline: body.deadline || null,
      location: body.location || "",
      contact: body.contact || "",
      tags: Array.isArray(body.tags)
        ? body.tags
        : String(body.tags || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
      images: Array.isArray(body.images) ? body.images : [],
    });

    res.json({ ok: true, data: need });
  } catch (err) {
    res.status(400).json({
      ok: false,
      message: "Failed to create need",
      error: err.message,
    });
  }
};

// PUT /needs/:id
exports.updateNeed = async (req, res) => {
  try {
    const id = req.params.id;
    const body = { ...req.body };

    if (typeof body.tags === "string") {
      body.tags = body.tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const need = await Need.findByIdAndUpdate(id, body, { new: true });
    if (!need)
      return res.status(404).json({ ok: false, message: "Need not found" });

    res.json({ ok: true, data: need });
  } catch (err) {
    res.status(400).json({
      ok: false,
      message: "Failed to update need",
      error: err.message,
    });
  }
};

// DELETE /needs/:id
exports.deleteNeed = async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await Need.findByIdAndDelete(id);
    if (!doc)
      return res.status(404).json({ ok: false, message: "Need not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({
      ok: false,
      message: "Failed to delete need",
      error: err.message,
    });
  }
};

// POST /needs/:id/fulfill
exports.markFulfilled = async (req, res) => {
  try {
    const id = req.params.id;
    const need = await Need.findByIdAndUpdate(
      id,
      { status: "fulfilled" },
      { new: true }
    );
    if (!need)
      return res.status(404).json({ ok: false, message: "Need not found" });
    res.json({ ok: true, data: need });
  } catch (err) {
    res.status(400).json({
      ok: false,
      message: "Failed to mark fulfilled",
      error: err.message,
    });
  }
};
