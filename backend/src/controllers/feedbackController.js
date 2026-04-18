const feedbackService = require("../services/feedbackService");

exports.createFeedback = async (req, res) => {
  try {
    const { voteRating, rating, reportId } = req.body;

    if (!voteRating || voteRating < 1 || voteRating > 5) {
      return res.status(400).json({ error: "Helpfulness rating is required and must be between 1 and 5." });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating is required and must be between 1 and 5." });
    }

    const feedback = await feedbackService.createFeedback({
      ...req.body,
      userId: req.user.id
    });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const query = { ...req.query };
    if (req.user && req.user.role === 'user') {
      query.userId = req.user.id;
    }
    const result = await feedbackService.getAllFeedback(query);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await feedbackService.getFeedbackById(req.params.id);
    res.status(200).json(feedback);
  } catch (err) {
    const status = err.message === "Feedback not found" ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
};

exports.updateFeedback = async (req, res) => {
  try {
    const { voteRating, rating } = req.body;

    if (voteRating && (voteRating < 1 || voteRating > 5)) {
      return res.status(400).json({ error: "Helpfulness rating must be between 1 and 5." });
    }
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: "Accuracy rating must be between 1 and 5." });
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

exports.deleteFeedback = async (req, res) => {
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

exports.updateStatus = async (req, res) => {
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

exports.batchApply = async (req, res) => {
  try {
    const result = await feedbackService.batchApply();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized access to analytics." });
    }
    const stats = await feedbackService.getFeedbackAnalytics();
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
