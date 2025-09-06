// controllers/contactController.js
const ContactMessage = require("../models/ContactMessage");
const sendMail = require("../utils/sendMail");

// ENV uyarlamaları (fallback'lar)
const ADMIN_NOTIFY_TO =
  process.env.CONTACT_NOTIFY_TO ||
  process.env.EMAIL_USER ||
  process.env.SMTP_USER ||
  null;

// helpers
const isEmail = (s = "") => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
const isNonEmpty = (s = "") => !!String(s).trim();

// mail-i bloklamadan göndərmək üçün kiçik köməkçi
function queueMail(to, text, subject) {
  if (!to) return;
  setImmediate(() => {
    sendMail(to, text, { subject })
      .then(() => console.log("[contact] mail sent to:", to))
      .catch((err) =>
        console.error("[contact] sendMail error:", err?.message || err)
      );
  });
}

exports.createContactMessage = async (req, res) => {
  try {
    const body = req.body || {};
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const phone = String(body.phone || "").trim();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();
    const consent = !!body.consent;

    // server-side validation
    if (
      !isNonEmpty(fullName) ||
      !isEmail(email) ||
      !isNonEmpty(subject) ||
      !isNonEmpty(message)
    ) {
      return res
        .status(400)
        .json({ message: "Required fields missing or invalid." });
    }
    if (!consent) {
      return res.status(400).json({ message: "Privacy consent is required." });
    }

    const doc = await ContactMessage.create({
      fullName,
      email,
      phone,
      subject,
      message,
    });

    // 🔔 Socket: adminlərə bildiriş
    if (req.io) {
      req.io.emit("receiveNotification", {
        type: "contact",
        title: "Yeni əlaqə müraciəti",
        message: `${doc.fullName} mesaj göndərdi`,
        data: {
          _id: doc._id,
          fullName: doc.fullName,
          email: doc.email,
          phone: doc.phone,
          subject: doc.subject,
          createdAt: doc.createdAt,
        },
        createdAt: new Date(),
      });
    }

    // ✅ CAVABI DƏRHAL QAYTAR — UI donmasın
    res.status(201).json({ success: true, id: doc._id });

    // ✉️ Admin e-poçtunu ARXA PLANDA göndər
    if (ADMIN_NOTIFY_TO) {
      const adminSubject = `New contact: ${subject}`;
      const adminMsg = `New Contact Message

Name: ${fullName}
Email: ${email}
Phone: ${phone || "-"}

Subject: ${subject}

Message:
${message}${
        process.env.FRONTEND_URL
          ? `

Open Admin: ${process.env.FRONTEND_URL}/az/admin/admins/contact`
          : ""
      }`;
      queueMail(ADMIN_NOTIFY_TO, adminMsg, adminSubject);
    }
  } catch (err) {
    console.error("createContactMessage error:", err.message);
    return res
      .status(500)
      .json({ message: "Failed to create contact message." });
  }
};

exports.listContactMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, q = "", read, replied } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { fullName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { subject: { $regex: q, $options: "i" } },
        { message: { $regex: q, $options: "i" } },
      ];
    }
    if (read === "true") filter.read = true;
    if (read === "false") filter.read = false;
    if (replied === "true") filter.replied = true;
    if (replied === "false") filter.replied = false;

    const p = Math.max(1, Number(page));
    const l = Math.min(100, Math.max(1, Number(limit)));
    const skip = (p - 1) * l;

    const [items, total] = await Promise.all([
      ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l),
      ContactMessage.countDocuments(filter),
    ]);

    return res.json({ items, total, page: p, limit: l });
  } catch (err) {
    console.error("listContactMessages error:", err.message);
    return res.status(500).json({ message: "Failed to load messages." });
  }
};

exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await ContactMessage.findByIdAndUpdate(
      id,
      { $set: { read: true } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Not found." });

    if (req.io) {
      req.io.emit("receiveNotification", {
        type: "contact",
        title: "Mesaj oxundu kimi işarələndi",
        message: `${doc.fullName} (${doc.subject})`,
        data: { _id: doc._id, read: true },
        createdAt: new Date(),
      });
    }

    return res.json({ success: true, item: doc });
  } catch (err) {
    console.error("markRead error:", err.message);
    return res.status(500).json({ message: "Failed to mark as read." });
  }
};

exports.replyMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const replyTextRaw = (req.body && req.body.replyText) || "";
    const replyText = String(replyTextRaw).trim();
    const adminId = (req.user && req.user.id) || null;

    if (!isNonEmpty(replyText)) {
      return res.status(400).json({ message: "Reply text required." });
    }

    const doc = await ContactMessage.findById(id);
    if (!doc) return res.status(404).json({ message: "Not found." });

    // DB güncelle
    doc.replied = true;
    doc.replyText = replyText;
    doc.repliedAt = new Date();
    if (adminId) doc.repliedBy = adminId;
    await doc.save();

    // UI-yə cavabı DƏRHAL qaytar
    res.json({ success: true, item: doc });

    // İstifadəçiyə maili ARXA PLANDA göndər
    const userSubject = `Re: ${doc.subject}`;
    const userMsg = `Salam ${doc.fullName},

${replyText}

--------------------------------
Sizin müraciətiniz:
${doc.message}${
      process.env.FRONTEND_URL
        ? `

${process.env.FRONTEND_URL}`
        : ""
    }`;

    queueMail(doc.email, userMsg, userSubject);

    // Socket
    if (req.io) {
      req.io.emit("receiveNotification", {
        type: "contact",
        title: "Mesaj cavablandırıldı",
        message: `${doc.fullName} - ${doc.subject}`,
        data: { _id: doc._id, replied: true, repliedAt: doc.repliedAt },
        createdAt: new Date(),
      });
    }
  } catch (err) {
    console.error("replyMessage error:", err.message);
    return res.status(500).json({ message: "Failed to reply." });
  }
};
