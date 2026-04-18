const feedbackService = require("../services/feedbackService");

// ── POST /api/feedback ─────────────────────────────────────────────────────
const createFeedback = async (req, res) => {
  try {
    const { vote, rating } = req.body;

    if (!vote || !["helpful", "incorrect"].includes(vote)) {
      return res.status(400).json({ error: "Invalid or missing vote. Must be 'helpful' or 'incorrect'." });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating is required and must be between 1 and 5." });
    }

    const feedback = await feedbackService.createFeedback(req.body);
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /api/feedback ──────────────────────────────────────────────────────
const getAllFeedback = async (req, res) => {
  try {
    const result = await feedbackService.getAllFeedback(req.query);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /api/feedback/:id ──────────────────────────────────────────────────
const getFeedbackById = async (req, res) => {
  try {
    const feedback = await feedbackService.getFeedbackById(req.params.id);
    res.status(200).json(feedback);
  } catch (err) {
    const status = err.message === "Feedback not found" ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
};

// ── PUT /api/feedback/:id ──────────────────────────────────────────────────
const updateFeedback = async (req, res) => {
  try {
    const { vote, rating } = req.body;

    if (vote && !["helpful", "incorrect"].includes(vote)) {
      return res.status(400).json({ error: "Invalid vote value." });
    }
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: "Rating must be between 1 and 5." });
    }

    const updated = await feedbackService.updateFeedback(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    const status =
      err.message === "Feedback not found" ? 404 :
      err.message.includes("Cannot edit") ? 403 : 500;
    res.status(status).json({ error: err.message });
  }
};

// ── DELETE /api/feedback/:id ───────────────────────────────────────────────
const deleteFeedback = async (req, res) => {
  try {
    const result = await feedbackService.deleteFeedback(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    const status =
      err.message === "Feedback not found" ? 404 :
      err.message.includes("Cannot delete") ? 403 : 500;
    res.status(status).json({ error: err.message });
  }
};

// ── PATCH /api/feedback/:id/status ────────────────────────────────────────
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required." });
    }

    const feedback = await feedbackService.updateStatus(req.params.id, status);
    res.status(200).json(feedback);
  } catch (err) {
    const status =
      err.message === "Feedback not found" ? 404 :
      err.message === "Invalid status value" ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
};

// ── POST /api/feedback/batch-apply ────────────────────────────────────────
const batchApply = async (req, res) => {
  try {
    const result = await feedbackService.batchApply();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  updateStatus,
  batchApply,
};