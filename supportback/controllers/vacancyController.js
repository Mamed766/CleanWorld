const Vacancy = require("../models/Vacancy");
const VacancyApplication = require("../models/VacancyApplication");
const sendMail = require("../utils/sendMail");

// helpers
const isEmail = (s = "") => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
const isNonEmpty = (s = "") => !!String(s).trim();
const norm = (x) => String(x || "").trim();

// tek vacancy kaydından istenen dilde düz bir obje üret
function toLocalized(v, lang = "az") {
  const L = (lang || "az").toLowerCase();
  const pick = (az, en, legacy) => {
    if (L === "en") return en || az || legacy || "";
    // default az
    return az || en || legacy || "";
  };

  return {
    _id: v._id,
    type: v.type,
    active: v.active,
    deadline: v.deadline,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,

    title: pick(v.title_az, v.title_en, v.title),
    department: pick(v.department_az, v.department_en, v.department),
    location: pick(v.location_az, v.location_en, v.location),
    description: pick(v.description_az, v.description_en, v.description),
    requirements: pick(v.requirements_az, v.requirements_en, v.requirements),
  };
}

// -------- Public: vacancies list & detail
exports.publicList = async (req, res) => {
  try {
    const {
      q = "",
      active = "true",
      page = 1,
      limit = 12,
      lang = "az",
    } = req.query;
    const filter = {};
    if (active === "true") filter.active = true;

    if (q) {
      const r = new RegExp(q, "i");
      // Dil alanlarında da arama yapalım
      filter.$or = [
        { title_az: r },
        { title_en: r },
        { title: r },
        { department_az: r },
        { department_en: r },
        { department: r },
        { location_az: r },
        { location_en: r },
        { location: r },
      ];
    }

    const p = Math.max(1, Number(page));
    const l = Math.min(100, Math.max(1, Number(limit)));
    const skip = (p - 1) * l;

    const [items, total] = await Promise.all([
      Vacancy.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l),
      Vacancy.countDocuments(filter),
    ]);

    // İstenen dilde map’le
    const data = items.map((v) => toLocalized(v, lang));

    res.json({ success: true, data, meta: { total, page: p, limit: l, lang } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.publicGet = async (req, res) => {
  try {
    const v = await Vacancy.findById(req.params.id);
    if (!v)
      return res.status(404).json({ success: false, message: "Not found" });
    const lang = (req.query.lang || "az").toLowerCase();
    res.json({ success: true, data: toLocalized(v, lang) });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// -------- Admin: CRUD vacancy (çok dilli alan kabul eder)
exports.createVacancy = async (req, res) => {
  try {
    const b = req.body || {};

    // En az bir dilde title zorunlu
    if (
      !isNonEmpty(b.title_az) &&
      !isNonEmpty(b.title_en) &&
      !isNonEmpty(b.title)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Title (AZ or EN) required" });
    }

    const doc = await Vacancy.create({
      // Dil alanları
      title_az: norm(b.title_az) || "",
      title_en: norm(b.title_en) || "",
      department_az: norm(b.department_az) || "",
      department_en: norm(b.department_en) || "",
      location_az: norm(b.location_az) || "",
      location_en: norm(b.location_en) || "",
      description_az: String(b.description_az || ""),
      description_en: String(b.description_en || ""),
      requirements_az: String(b.requirements_az || ""),
      requirements_en: String(b.requirements_en || ""),

      // Legacy alanlara da (gönderildiyse) yaz
      title: norm(b.title),
      department: norm(b.department),
      location: norm(b.location),
      description: String(b.description || ""),
      requirements: String(b.requirements || ""),

      // Diğer
      type: b.type || "full-time",
      active: b.active !== undefined ? !!b.active : true,
      deadline: b.deadline ? new Date(b.deadline) : undefined,
      createdBy: req.user?.id || undefined,
    });

    res.status(201).json({ success: true, data: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.updateVacancy = async (req, res) => {
  try {
    const b = req.body || {};
    const $set = {};

    // sadece gönderilen alanları güncelle
    [
      "title_az",
      "title_en",
      "department_az",
      "department_en",
      "location_az",
      "location_en",
      "description_az",
      "description_en",
      "requirements_az",
      "requirements_en",
      // legacy
      "title",
      "department",
      "location",
      "description",
      "requirements",
      "type",
      "active",
    ].forEach((k) => {
      if (b[k] !== undefined) $set[k] = b[k];
    });

    if (b.deadline !== undefined) {
      $set.deadline = b.deadline ? new Date(b.deadline) : undefined;
    }

    const updated = await Vacancy.findByIdAndUpdate(
      req.params.id,
      { $set },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.removeVacancy = async (req, res) => {
  try {
    const r = await Vacancy.findByIdAndDelete(req.params.id);
    if (!r)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// -------- Public: apply (PDF upload)
exports.apply = async (req, res) => {
  try {
    const vacancyId = req.params.id;
    const { fullName, email, phone = "", coverLetter = "" } = req.body || {};

    if (!isNonEmpty(fullName) || !isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid name or email" });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "CV (PDF) is required" });
    }

    const v = await Vacancy.findById(vacancyId);
    if (!v || !v.active) {
      return res
        .status(404)
        .json({ success: false, message: "Vacancy not found or inactive" });
    }

    const appDoc = await VacancyApplication.create({
      vacancy: vacancyId,
      fullName: norm(fullName),
      email: norm(email).toLowerCase(),
      phone: norm(phone),
      coverLetter: String(coverLetter || ""),
      cvPath: `uploads/pdfs/${req.file.filename}`,
      status: "pending",
    });

    // real-time xəbərdarlıq
    if (req.io) {
      const title = toLocalized(v, "az").title || v.title || "Vakansiya";
      req.io.emit("receiveNotification", {
        type: "vacancyApplication",
        title: "Yeni vakansiya müraciəti",
        message: `${appDoc.fullName} - ${title}`,
        data: {
          applicationId: appDoc._id,
          vacancyId: v._id,
          fullName: appDoc.fullName,
          email: appDoc.email,
        },
        createdAt: new Date(),
      });
    }

    // 1) CAVABI DƏRHAL QAYTAR
    res.status(201).json({ success: true, data: appDoc });

    // 2) MAILI ARXA PLANDA GÖNDƏR (await YOX!)
    const notifyTo =
      process.env.CONTACT_NOTIFY_TO ||
      process.env.EMAIL_USER ||
      process.env.SMTP_USER ||
      null;
    if (notifyTo) {
      const titleAz = toLocalized(v, "az").title || v.title || "Vakansiya";
      const subject = `Yeni müraciət • ${titleAz}`;
      const text = `Yeni vakansiya müraciəti

Vakansiya: ${titleAz}
Ad Soyad: ${appDoc.fullName}
Email: ${appDoc.email}
Telefon: ${appDoc.phone || "-"}

Cover Letter:
${appDoc.coverLetter || "-"}

CV: ${process.env.FRONTEND_URL ? process.env.FRONTEND_URL + "/" : ""}${
        appDoc.cvPath
      }
`;
      // fire-and-forget
      setImmediate(() => {
        sendMail(notifyTo, text, { subject }).catch((err) => {
          console.error("sendMail error:", err?.message || err);
        });
      });
    }
  } catch (e) {
    console.error("apply error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

// -------- Admin: applications list / status change
exports.listApplications = async (req, res) => {
  try {
    const { id } = req.params; // vacancy id
    const { page = 1, limit = 20, status, q = "" } = req.query;
    const filter = { vacancy: id };
    if (status) filter.status = status;
    if (q) {
      const r = new RegExp(q, "i");
      filter.$or = [{ fullName: r }, { email: r }, { phone: r }];
    }
    const p = Math.max(1, Number(page));
    const l = Math.min(100, Math.max(1, Number(limit)));
    const skip = (p - 1) * l;

    const [items, total] = await Promise.all([
      VacancyApplication.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l),
      VacancyApplication.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      meta: { total, page: p, limit: l },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.setApplicationStatus = async (req, res) => {
  try {
    const { appId } = req.params;
    const { status = "reviewed", notes = "" } = req.body || {};
    if (!["pending", "reviewed", "accepted", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }
    const updated = await VacancyApplication.findByIdAndUpdate(
      appId,
      { $set: { status, notes } },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ success: false, message: "Not found" });

    if (req.io) {
      req.io.emit("receiveNotification", {
        type: "vacancyApplication",
        title: "Müraciət yeniləndi",
        message: `${updated.fullName} • ${status}`,
        data: { applicationId: updated._id, status },
        createdAt: new Date(),
      });
    }
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
