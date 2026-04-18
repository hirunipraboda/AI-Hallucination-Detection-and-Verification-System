const Feedback = require("../models/Feedback");

// ── Create ─────────────────────────────────────────────────────────────────
const createFeedback = async (data) => {
  const { vote, rating, category, observation, correction } = data;

  const feedback = await Feedback.create({
    vote,
    rating,
    category: category || "accuracy",
    observation: observation || "",
    correction: vote === "incorrect" ? correction || "" : "",
  });

  return feedback;
};

// ── Get All (with filters + pagination) ───────────────────────────────────
const getAllFeedback = async (query) => {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.max(1, parseInt(query.limit) || 5);
  const skip  = (page - 1) * limit;

  const filter = {};

  if (query.category) filter.category = query.category;
  if (query.status)   filter.status   = query.status;
  if (query.rating)   filter.rating   = parseInt(query.rating);

  if (query.search) {
    const regex = new RegExp(query.search, "i");
    filter.$or = [{ observation: regex }, { correction: regex }];
  }

  const [items, total] = await Promise.all([
    Feedback.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Feedback.countDocuments(filter),
  ]);

  return { items, total, page, limit };
};

// ── Get By ID ──────────────────────────────────────────────────────────────
const getFeedbackById = async (id) => {
  const feedback = await Feedback.findById(id);
  if (!feedback) throw new Error("Feedback not found");
  return feedback;
};

// ── Update ─────────────────────────────────────────────────────────────────
const updateFeedback = async (id, data) => {
  const existing = await Feedback.findById(id);
  if (!existing) throw new Error("Feedback not found");

  if (existing.status !== "pending") {
    throw new Error("Cannot edit feedback that has already been processed");
  }

  const { vote, rating, category, observation, correction } = data;

  const resolvedVote = vote ?? existing.vote;

  const updated = await Feedback.findByIdAndUpdate(
    id,
    {
      vote:        resolvedVote,
      rating:      rating      ?? existing.rating,
      category:    category    ?? existing.category,
      observation: observation ?? existing.observation,
      correction:  resolvedVote === "incorrect"
        ? correction ?? existing.correction
        : "",
    },
    { new: true, runValidators: true }
  );

  return updated;
};

// ── Delete ─────────────────────────────────────────────────────────────────
const deleteFeedback = async (id) => {
  const existing = await Feedback.findById(id);
  if (!existing) throw new Error("Feedback not found");

  if (existing.status !== "pending") {
    throw new Error("Cannot delete feedback that has already been processed");
  }

  await Feedback.findByIdAndDelete(id);
  return { message: "Feedback deleted successfully" };
};

// ── Update Status ──────────────────────────────────────────────────────────
const updateStatus = async (id, status) => {
  const validStatuses = ["pending", "applied", "rejected"];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status value");
  }

  const feedback = await Feedback.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!feedback) throw new Error("Feedback not found");
  return feedback;
};

// ── Batch Apply ────────────────────────────────────────────────────────────
const batchApply = async () => {
  const result = await Feedback.updateMany(
    { status: "pending" },
    { $set: { status: "applied" } }
  );

  return {
    message: `${result.modifiedCount} feedback entries marked as applied`,
    modifiedCount: result.modifiedCount,
  };
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