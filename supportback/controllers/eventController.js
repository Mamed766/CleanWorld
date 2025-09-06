const path = require("path");
const fs = require("fs");
const Event = require("../models/Event");
const { ErrorHandler } = require("../utils/ErrorHandler");

// Yardımcı: güvenli Date parse
const parseDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

// GET ALL (search + pagination + date range + status + upcoming)
const getAllEvents = async (req, res, next) => {
  try {
    const { page, limit, q, status, upcoming, from, to } = req.query;

    const hasPagination =
      typeof limit !== "undefined" && String(limit).trim() !== "";

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 0, 0);

    const filter = {};

    // metin arama
    if (q && String(q).trim()) {
      const regex = new RegExp(String(q).trim(), "i");
      filter.$or = [
        { titleAZ: regex },
        { titleEN: regex },
        { descriptionAZ: regex },
        { descriptionEN: regex },
        { location: regex },
      ];
    }

    // durum filtresi
    if (status && ["draft", "published"].includes(status)) {
      filter.status = status;
    }

    // tarih aralığı
    const fromDate = parseDate(from);
    const toDate = parseDate(to);
    if (fromDate || toDate) {
      filter.startDate = {};
      if (fromDate) filter.startDate.$gte = fromDate;
      if (toDate) filter.startDate.$lte = toDate;
    }

    // sadece gelecek etkinlikler
    if (String(upcoming) === "true") {
      filter.startDate = { ...(filter.startDate || {}), $gte: new Date() };
      // published olmayanları gizlemek istersen:
      if (!filter.status) filter.status = "published";
    }

    // sıralama: en yakın etkinlikler önce
    const sort = { startDate: 1, createdAt: -1 };

    if (hasPagination && limitNum > 0) {
      const total = await Event.countDocuments(filter);
      const events = await Event.find(filter)
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      if (!events.length) {
        return next(new ErrorHandler("No events found", 404));
      }

      return res.status(200).json({
        success: true,
        events,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } else {
      const events = await Event.find(filter).sort(sort);
      if (!events.length) {
        return next(new ErrorHandler("No events found", 404));
      }
      return res.status(200).json({ success: true, events });
    }
  } catch (error) {
    next(error);
  }
};

// GET BY ID
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return next(new ErrorHandler("Event not found", 404));
    res.status(200).json({ success: true, event });
  } catch (error) {
    next(new ErrorHandler("Invalid event ID", 400));
  }
};

// CREATE
const createEvent = async (req, res, next) => {
  try {
    const {
      titleAZ,
      titleEN,
      descriptionAZ,
      descriptionEN,
      startDate,
      endDate,
      location,
      status,
      isFeatured,
    } = req.body;

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (!start) {
      return next(new ErrorHandler("startDate is required/invalid", 400));
    }
    if (end && end < start) {
      return next(new ErrorHandler("endDate cannot be before startDate", 400));
    }

    const image = req.file?.path;
    if (!image) {
      return next(new ErrorHandler("Image is required", 400));
    }

    const newEvent = await Event.create({
      titleAZ,
      titleEN,
      descriptionAZ,
      descriptionEN,
      image,
      startDate: start,
      endDate: end || undefined,
      location,
      status: status || "draft",
      isFeatured: Boolean(isFeatured),
    });

    res.status(201).json({ success: true, newEvent });
  } catch (error) {
    console.log("💥 Event create error:", error);
    next(new ErrorHandler(error.message || "Create failed", 500));
  }
};

// UPDATE
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return next(new ErrorHandler("Event not found", 404));

    const start = parseDate(req.body.startDate) || event.startDate;
    const end = req.body.endDate ? parseDate(req.body.endDate) : event.endDate;

    if (end && end < start) {
      return next(new ErrorHandler("endDate cannot be before startDate", 400));
    }

    const updatedData = {
      titleAZ: req.body.titleAZ ?? event.titleAZ,
      titleEN: req.body.titleEN ?? event.titleEN,
      descriptionAZ: req.body.descriptionAZ ?? event.descriptionAZ,
      descriptionEN: req.body.descriptionEN ?? event.descriptionEN,
      image: req.file?.path || event.image,
      startDate: start,
      endDate: end,
      location: req.body.location ?? event.location,
      status: req.body.status ?? event.status,
      isFeatured:
        typeof req.body.isFeatured !== "undefined"
          ? Boolean(req.body.isFeatured)
          : event.isFeatured,
    };

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, updatedEvent });
  } catch (error) {
    next(new ErrorHandler("Invalid event ID", 400));
  }
};

// DELETE
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return next(new ErrorHandler("Event not found", 404));

    // image temizliği (multer uploads klasörü mantığına göre)
    const imagePath = event.image
      ? path.join(__dirname, "..", "uploads", path.basename(event.image))
      : null;

    if (imagePath) {
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Image delete error:", err.message);
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    next(new ErrorHandler("Invalid event ID", 400));
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
