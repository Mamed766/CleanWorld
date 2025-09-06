const mongoose = require("mongoose");
const Donation = require("../models/Donation");

/**
 * POST /api/admin/donations
 */
async function createDonation(req, res) {
  try {
    const {
      donorName,
      donationType, // "money" | "goods"
      amount = 0,
      currency = "AZN",
      items = [],
      majorCategory = "none",
      note,
    } = req.body || {};

    if (!donorName || !donationType) {
      return res
        .status(400)
        .json({ message: "donorName və donationType tələb olunur" });
    }

    if (donationType === "money" && Number(amount) < 0) {
      return res.status(400).json({ message: "amount 0-dan kiçik ola bilməz" });
    }

    const doc = await Donation.create({
      donorName,
      donationType,
      amount: donationType === "money" ? Number(amount) : 0,
      currency,
      items: donationType === "goods" ? items : [],
      majorCategory,
      note,
      createdBy: req.user?._id ?? null,
    });

    res.status(201).json(doc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server xətası" });
  }
}

/**
 * GET /api/admin/donations
 */
async function listDonations(req, res) {
  try {
    const {
      q,
      type,
      category,
      minAmount,
      maxAmount,
      start,
      end,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    const filter = { deletedAt: null };

    if (type) filter.donationType = type;
    if (category) filter.majorCategory = category;

    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = Number(minAmount);
      if (maxAmount) filter.amount.$lte = Number(maxAmount);
    }

    if (start || end) {
      filter.createdAt = {};
      if (start) filter.createdAt.$gte = new Date(start);
      if (end) filter.createdAt.$lte = new Date(end);
    }

    if (q) filter.$text = { $search: q };

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [items, total, sums] = await Promise.all([
      Donation.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
      Donation.countDocuments(filter),
      Donation.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalMoney: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const summary = sums?.[0] || { totalMoney: 0, count: 0 };

    res.json({
      items,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
      summary,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server xətası" });
  }
}

/**
 * GET /api/admin/donations/:id
 */
async function getDonation(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Yanlış id" });

    const doc = await Donation.findOne({ _id: id, deletedAt: null }).lean();
    if (!doc) return res.status(404).json({ message: "Tapılmadı" });
    res.json(doc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server xətası" });
  }
}

/**
 * PATCH /api/admin/donations/:id
 */
async function updateDonation(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Yanlış id" });

    const payload = { ...req.body };

    if (payload.donationType === "money") {
      payload.items = [];
      payload.amount = Math.max(0, Number(payload.amount || 0));
    }
    if (payload.donationType === "goods") {
      payload.amount = 0;
    }

    const updated = await Donation.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: payload },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Tapılmadı" });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server xətası" });
  }
}

/**
 * DELETE /api/admin/donations/:id
 */
async function deleteDonation(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Yanlış id" });

    const deleted = await Donation.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true }
    );

    if (!deleted) return res.status(404).json({ message: "Tapılmadı" });
    res.json({ message: "Silindi" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server xətası" });
  }
}

module.exports = {
  createDonation,
  listDonations,
  getDonation,
  updateDonation,
  deleteDonation,
};
