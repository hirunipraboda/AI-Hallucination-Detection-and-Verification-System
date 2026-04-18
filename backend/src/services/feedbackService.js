const Review = require('../models/Review');

// ── Create ─────────────────────────────────────────────────────────────────
const createFeedback = async (data) => {
  const { reportId, userId, voteRating, rating, category, observation, correction } = data;

  const review = await Review.create({
    reportId: reportId || undefined,
    userId,
    voteRating,
    rating,
    category: category || 'accuracy',
    observation: observation || '',
    correction: voteRating <= 2 ? correction || '' : '',
  });

  return review;
};

// ── Get All (with filters + pagination) ───────────────────────────────────
const getAllFeedback = async (query) => {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.max(1, parseInt(query.limit) || 100);
  const skip  = (page - 1) * limit;

  const filter = {};

  if (query.reportId) filter.reportId = query.reportId;
  if (query.category) filter.category = query.category;
  if (query.status)   filter.status   = query.status;
  if (query.rating)   filter.rating   = parseInt(query.rating);
  if (query.userId)   filter.userId   = query.userId;

  if (query.search) {
    const regex = new RegExp(query.search, 'i');
    filter.$or = [{ observation: regex }, { correction: regex }];
  }

  const [items, total] = await Promise.all([
    Review.find(filter)
      .populate('userId', 'email name')
      .populate('reportId', 'originalResponse score confidenceLevel')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  return { items, total, page, limit };
};

// ── Get By ID ──────────────────────────────────────────────────────────────
const getFeedbackById = async (id) => {
  const review = await Review.findById(id)
    .populate('userId', 'email name')
    .populate('reportId', 'originalResponse score confidenceLevel');
  if (!review) throw new Error('Feedback not found');
  return review;
};

// ── Update ─────────────────────────────────────────────────────────────────
const updateFeedback = async (id, data) => {
  const existing = await Review.findById(id);
  if (!existing) throw new Error('Feedback not found');

  if (existing.status !== 'pending') {
    throw new Error('Cannot edit feedback that has already been processed');
  }

  const { voteRating, rating, category, observation, correction } = data;
  const resolvedVote = voteRating ?? existing.voteRating;

  const updated = await Review.findByIdAndUpdate(
    id,
    {
      voteRating:  resolvedVote,
      rating:      rating      ?? existing.rating,
      category:    category    ?? existing.category,
      observation: observation ?? existing.observation,
      correction:  resolvedVote <= 2 ? correction ?? existing.correction : '',
    },
    { new: true, runValidators: true }
  );

  return updated;
};

// ── Delete ─────────────────────────────────────────────────────────────────
const deleteFeedback = async (id) => {
  const existing = await Review.findById(id);
  if (!existing) throw new Error('Feedback not found');

  if (existing.status !== 'pending') {
    throw new Error('Cannot delete feedback that has already been processed');
  }

  await Review.findByIdAndDelete(id);
  return { message: 'Review deleted successfully' };
};

// ── Update Status ──────────────────────────────────────────────────────────
const updateStatus = async (id, status) => {
  const validStatuses = ['pending', 'applied', 'rejected'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status value');
  }

  const review = await Review.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!review) throw new Error('Feedback not found');
  return review;
};

// ── Batch Apply ────────────────────────────────────────────────────────────
const batchApply = async () => {
  const result = await Review.updateMany(
    { status: 'pending' },
    { $set: { status: 'applied' } }
  );

  return {
    message: `${result.modifiedCount} reviews marked as applied`,
    modifiedCount: result.modifiedCount,
  };
};

// ── Analytics ──────────────────────────────────────────────────────────────
const getFeedbackAnalytics = async () => {
  const stats = await Review.aggregate([
    {
      $facet: {
        monthly: [
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
              },
              avgRating: { $avg: '$rating' },
              avgHelpfulness: { $avg: '$voteRating' },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 12 },
        ],
        yearly: [
          {
            $group: {
              _id: { year: { $year: '$createdAt' } },
              avgRating: { $avg: '$rating' },
              avgHelpfulness: { $avg: '$voteRating' },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.year': -1 } },
        ],
        byCategory: [
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              avgRating: { $avg: '$rating' },
            },
          },
        ],
      },
    },
  ]);

  return stats[0];
};

module.exports = {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  updateStatus,
  batchApply,
  getFeedbackAnalytics,
};
