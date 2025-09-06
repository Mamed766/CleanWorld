const Volunteer = require("../models/Volunteer");
const sendMail = require("../utils/sendMail");

// Könüllü müraciətini yaratmaq (public)
exports.create = async (req, res) => {
  try {
    const doc = await Volunteer.create({ ...req.body, status: "pending" });

    // 🔹 Yeni müraciət bildirişi adminlərə göndərilir
    req.io.emit("receiveNotification", {
      type: "volunteer",
      title: "Yeni könüllü müraciəti",
      message: `${doc.fullName} yeni müraciət göndərdi`,
      data: doc,
      createdAt: new Date(),
    });

    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Admin: bütün müraciətləri görmək
exports.list = async (req, res) => {
  try {
    const {
      search = "",
      status,
      gender, // <-- EKLENDİ
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const query = {};
    if (status) query.status = status;

    // ✅ gender filtresi
    if (gender && ["Male", "Female", "Other"].includes(gender)) {
      query.gender = gender;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { fullName: regex },
        { email: regex },
        { phone: regex },
        { address: regex },
        { profession: regex },
      ];
    }

    const sort = { [sortBy]: sortOrder?.toLowerCase() === "asc" ? 1 : -1 };
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Volunteer.find(query).sort(sort).skip(skip).limit(limitNum).lean(),
      Volunteer.countDocuments(query), // <-- toplam artık filtreye göre
    ]);

    res.json({
      success: true,
      data: items,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
        hasNext: pageNum * limitNum < total,
        sortBy,
        sortOrder: sortOrder?.toLowerCase() === "asc" ? "asc" : "desc",
        search: search || null,
        status: status || null,
        gender: gender || null, // <-- geri döndürmek istersen
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: müraciəti təsdiqləmək + mail
exports.approve = async (req, res) => {
  try {
    const item = await Volunteer.findById(req.params.id);
    if (!item)
      return res.status(404).json({ success: false, message: "Not found" });

    item.status = "approved";
    await item.save();

    const subject = "Könüllü müraciətiniz qəbul olundu";
    const text =
      `Hörmətli ${item.fullName},\n\n` +
      `“Təmiz Dünya” təşkilatına etdiyiniz könüllü müraciəti qəbul olundu. ` +
      `Sizinlə əlaqə saxlanılacaq.\n\n` +
      `Hörmətlə,\nTəmiz Dünya`;

    await sendMail(item.email, text, { subject });

    res.json({ success: true, message: "Application approved", data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: müraciəti rədd etmək + mail
exports.reject = async (req, res) => {
  try {
    const item = await Volunteer.findById(req.params.id);
    if (!item)
      return res.status(404).json({ success: false, message: "Not found" });

    item.status = "rejected";
    await item.save();

    const subject = "Könüllü müraciətiniz haqqında";
    const text =
      `Hörmətli ${item.fullName},\n\n` +
      `Müraciətiniz üçün təşəkkür edirik. Təəssüf ki, hazırda yer yoxdur. ` +
      `Məlumatlarınızı saxlayırıq, uyğun imkan yarandıqda sizinlə əlaqə saxlayacağıq.\n\n` +
      `Hörmətlə,\nTəmiz Dünya`;

    await sendMail(item.email, text, { subject });

    res.json({ success: true, message: "Application rejected", data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: müraciəti silmək
exports.remove = async (req, res) => {
  try {
    const item = await Volunteer.findByIdAndDelete(req.params.id);
    if (!item)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, message: "Application deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.stats = async (req, res) => {
  try {
    const interval = (req.query.interval || "month").toLowerCase(); // "month"
    const months = Math.min(
      Math.max(parseInt(req.query.months || "12", 10), 1),
      36
    );
    const status = req.query.status; // opsiyonel filtre

    if (interval !== "month") {
      return res
        .status(400)
        .json({ success: false, message: "Only interval=month is supported." });
    }

    // son N ayın başlangıcı
    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth() - (months - 1),
      1,
      0,
      0,
      0,
      0
    );

    const match = { createdAt: { $gte: start } };
    if (status) match.status = status;

    const rows = await Volunteer.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            y: { $year: "$createdAt" },
            m: { $month: "$createdAt" },
            g: "$gender",
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.y",
          month: "$_id.m",
          gender: "$_id.g",
          count: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    // pivot: her ay için { label, Male, Female, Other }
    const byKey = new Map();
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);

    // eksik ayları 0 ile doldur
    for (let i = 0; i < months; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      byKey.set(key, { label: key, Male: 0, Female: 0, Other: 0 });
    }

    for (const r of rows) {
      const key = `${r.year}-${pad(r.month)}`;
      if (!byKey.has(key))
        byKey.set(key, { label: key, Male: 0, Female: 0, Other: 0 });
      const row = byKey.get(key);
      if (
        r.gender === "Male" ||
        r.gender === "Female" ||
        r.gender === "Other"
      ) {
        row[r.gender] = r.count;
      }
    }

    const data = Array.from(byKey.values());
    return res.json({ success: true, data });
  } catch (err) {
    console.error("stats error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
