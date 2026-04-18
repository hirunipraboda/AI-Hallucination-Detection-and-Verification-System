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
  getAnalytics,
} = require("../controllers/feedbackController");
const { protect } = require('../middleware/authMiddleware');

router.post("/", protect, createFeedback);
router.get("/", protect, getAllFeedback);
router.get("/analytics", protect, getAnalytics);
router.post("/batch-apply", protect, batchApply);
router.get("/:id", protect, getFeedbackById);
router.put("/:id", protect, updateFeedback);
router.delete("/:id", protect, deleteFeedback);
router.patch("/:id/status", protect, updateStatus);

module.exports = router;
