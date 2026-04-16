const Joi = require('joi');
const ScoringRecord = require('../models/ScoringRecord');
const {
  buildScoringRecordPayload,
  calculateConfidenceScore,
  mapRiskLevel,
} = require('../services/scoringService');

const baseScoresSchema = {
  responseId: Joi.string().trim().required(),
  verificationScore: Joi.number().min(0).max(100).required(),
  credibilityScore: Joi.number().min(0).max(100).required(),
  consensusScore: Joi.number().min(0).max(100).required(),
  weights: Joi.object({
    verification: Joi.number().positive(),
    credibility: Joi.number().positive(),
    consensus: Joi.number().positive(),
  }).optional(),
};

const createScoringSchema = Joi.object(baseScoresSchema);

const recalcSchema = Joi.object({
  verificationScore: Joi.number().min(0).max(100),
  credibilityScore: Joi.number().min(0).max(100),
  consensusScore: Joi.number().min(0).max(100),
  weights: Joi.object({
    verification: Joi.number().positive(),
    credibility: Joi.number().positive(),
    consensus: Joi.number().positive(),
  }).optional(),
});

function handleError(res, error, statusCode = 400) {
  return res.status(statusCode).json({
    data: null,
    error: error.message || error,
  });
}

async function createScoringRecord(req, res) {
  try {
    const { error, value } = createScoringSchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
    });

    if (error) {
      return handleError(res, new Error(error.details.map((d) => d.message).join(', ')));
    }

    const payload = buildScoringRecordPayload(value);

    const record = await ScoringRecord.create(payload);

    return res.status(201).json({
      data: record,
      error: null,
    });
  } catch (err) {
    return handleError(res, err, 500);
  }
}

async function getScoringByResponseId(req, res) {
  try {
    const { responseId } = req.params;

    const record = await ScoringRecord.findOne({
      responseId,
      isDeleted: false,
    }).lean();

    if (!record) {
      return handleError(res, new Error('Scoring record not found'), 404);
    }

    return res.json({
      data: record,
      error: null,
    });
  } catch (err) {
    return handleError(res, err, 500);
  }
}

async function searchScoringRecords(req, res) {
  try {
    const {
      responseId,
      minConfidence,
      maxConfidence,
      riskLevel,
      from,
      to,
      page = 1,
      limit = 20,
      sortBy = 'calculatedAt',
      order = 'desc',
    } = req.query;

    const query = { isDeleted: false };

    if (responseId) {
      query.responseId = { $regex: responseId, $options: 'i' };
    }

    if (minConfidence || maxConfidence) {
      query.confidenceScore = {};
      if (minConfidence) query.confidenceScore.$gte = Number(minConfidence);
      if (maxConfidence) query.confidenceScore.$lte = Number(maxConfidence);
    }

    if (riskLevel) {
      query.hallucinationRiskLevel = riskLevel;
    }

    if (from || to) {
      query.calculatedAt = {};
      if (from) query.calculatedAt.$gte = new Date(from);
      if (to) query.calculatedAt.$lte = new Date(to);
    }

    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const numericLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const skip = (numericPage - 1) * numericLimit;
    const sortDirection = order === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      ScoringRecord.find(query)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(numericLimit)
        .lean(),
      ScoringRecord.countDocuments(query),
    ]);

    return res.json({
      data: items,
      meta: {
        page: numericPage,
        limit: numericLimit,
        total,
        totalPages: Math.ceil(total / numericLimit) || 1,
      },
      error: null,
    });
  } catch (err) {
    return handleError(res, err, 500);
  }
}

async function recalculateScore(req, res) {
  try {
    const { id } = req.params;

    const { error, value } = recalcSchema.validate(req.body ?? {}, {
      abortEarly: false,
      allowUnknown: false,
    });

    if (error) {
      return handleError(res, new Error(error.details.map((d) => d.message).join(', ')));
    }

    const existing = await ScoringRecord.findById(id);

    if (!existing || existing.isDeleted) {
      return handleError(res, new Error('Scoring record not found'), 404);
    }

    const verificationScore =
      value.verificationScore ?? existing.scoringFactors.verificationScore;
    const credibilityScore =
      value.credibilityScore ?? existing.scoringFactors.credibilityScore;
    const consensusScore =
      value.consensusScore ?? existing.scoringFactors.consensusScore;

    const weights = value.weights || {
      verification: existing.scoringFactors.weightDistribution.verificationWeight,
      credibility: existing.scoringFactors.weightDistribution.credibilityWeight,
      consensus: existing.scoringFactors.weightDistribution.consensusWeight,
    };

    const confidenceScore = calculateConfidenceScore({
      verificationScore,
      credibilityScore,
      consensusScore,
      weights,
    });

    const hallucinationRiskLevel = mapRiskLevel(confidenceScore);
    const calculatedAt = new Date();

    existing.confidenceScore = confidenceScore;
    existing.hallucinationRiskLevel = hallucinationRiskLevel;
    existing.scoringFactors.verificationScore = verificationScore;
    existing.scoringFactors.credibilityScore = credibilityScore;
    existing.scoringFactors.consensusScore = consensusScore;
    existing.scoringFactors.weightDistribution.verificationWeight = weights.verification;
    existing.scoringFactors.weightDistribution.credibilityWeight = weights.credibility;
    existing.scoringFactors.weightDistribution.consensusWeight = weights.consensus;
    existing.calculatedAt = calculatedAt;

    await existing.save();

    return res.json({
      data: existing,
      error: null,
    });
  } catch (err) {
    return handleError(res, err, 500);
  }
}

async function softDeleteScoringRecord(req, res) {
  try {
    const { id } = req.params;

    const record = await ScoringRecord.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!record) {
      return handleError(res, new Error('Scoring record not found'), 404);
    }

    return res.json({
      data: record,
      error: null,
    });
  } catch (err) {
    return handleError(res, err, 500);
  }
}

module.exports = {
  createScoringRecord,
  getScoringByResponseId,
  searchScoringRecords,
  recalculateScore,
  softDeleteScoringRecord,
};

