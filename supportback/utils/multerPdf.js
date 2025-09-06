// utils/multerPdf.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// uploads/pdfs klasörü (yoksa oluştur)
const pdfDir = path.join(__dirname, "../uploads/pdfs");
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pdfDir);
  },
  filename: (req, file, cb) => {
    // sadece pdf kabul
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    const filename = `${Date.now()}-${base}${ext || ".pdf"}`;
    cb(null, filename);
  },
});

function pdfFileFilter(req, file, cb) {
  const mimeOk =
    file.mimetype === "application/pdf" ||
    // bazı tarayıcılar pdf'leri octet-stream gibi yollar
    (file.mimetype === "application/octet-stream" &&
      path.extname(file.originalname).toLowerCase() === ".pdf");
  if (!mimeOk) return cb(new Error("Only PDF files are allowed"), false);
  cb(null, true);
}

module.exports = multer({
  storage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});
