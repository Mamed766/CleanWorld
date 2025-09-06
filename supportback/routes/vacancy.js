const express = require("express");
const router = express.Router();
const vacancyController = require("../controllers/vacancyController");
const multerPdf = require("../utils/multerPdf");
const { adminMiddleware } = require("../middleware/adminMiddleware");

// -------- Public --------
router.get("/", vacancyController.publicList); // GET /api/v3/vacancies
router.get("/:id", vacancyController.publicGet); // GET /api/v3/vacancies/:id

// Apply with PDF
router.post(
  "/:id/apply", // POST /api/v3/vacancies/:id/apply
  multerPdf.single("cv"),
  vacancyController.apply
);

// -------- Admin --------
router.post(
  "/",
  adminMiddleware({ permissions: ["application_editor"] }),
  vacancyController.createVacancy
); // POST /api/v3/vacancies
router.put(
  "/:id",
  adminMiddleware({ permissions: ["application_editor"] }),
  vacancyController.updateVacancy
); // PUT /api/v3/vacancies/:id
router.delete(
  "/:id",
  adminMiddleware({ permissions: ["application_editor"] }),
  vacancyController.removeVacancy
); // DELETE /api/v3/vacancies/:id

// Applications
router.get(
  "/:id/applications",
  adminMiddleware({ permissions: ["application_editor"] }),
  vacancyController.listApplications
); // GET /api/v3/vacancies/:id/applications

router.patch(
  "/applications/:appId",
  adminMiddleware({ permissions: ["application_editor"] }),
  vacancyController.setApplicationStatus
); // PATCH /api/v3/vacancies/applications/:appId

module.exports = router;
