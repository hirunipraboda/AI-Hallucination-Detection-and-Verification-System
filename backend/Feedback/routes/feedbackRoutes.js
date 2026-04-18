const express = require("express");
const router = express.Router();
const {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  updateStatus,
  batchApply,
} = require("../controllers/feedbackController");

// ── Batch (must be before /:id to avoid conflict) ─────────────────────────
router.post("/batch-apply", batchApply);

// ── CRUD ───────────────────────────────────────────────────────────────────
router.post("/",   createFeedback);
router.get("/",    getAllFeedback);
router.get("/:id", getFeedbackById);
router.put("/:id", updateFeedback);
router.delete("/:id", deleteFeedback);

// ── Status ─────────────────────────────────────────────────────────────────
router.patch("/:id/status", updateStatus);

module.exports = router;