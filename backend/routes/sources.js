const express = require('express');
const router = express.Router();
const { EvidenceSource, SourceCredibility } = require('../models/Source');

const {
  clampScore,
  calculateOverallScore,
  deriveStatus,
  isValidHttpUrl,
} = require('../utils/sourceCredibility');

// 💡 GET all sources
router.get('/', async (req, res) => {
  try {
    const sources = await SourceCredibility.find().sort({ updatedAt: -1 });
    res.json(sources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 💡 GET one source by ID
router.get('/:id', async (req, res) => {
  try {
    const source = await SourceCredibility.findById(req.params.id);
    if (!source) return res.status(404).json({ message: 'Source not found' });
    res.json(source);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 💡 POST create a new source
router.post('/', async (req, res) => {
  try {
    const { sourceName, authorityScore, accuracyScore, recencyScore, sourceURL, sourceCategory } = req.body;
    if (!sourceName || !sourceCategory || !sourceURL) {
      return res.status(400).json({ message: 'sourceName, sourceCategory and sourceURL are required.' });
    }
    if (!isValidHttpUrl(sourceURL)) {
      return res.status(400).json({ message: 'Please provide a valid URL starting with http:// or https://.' });
    }

    const normalizedName = String(sourceName).trim();
    const normalizedUrl = String(sourceURL).trim();
    const normalizedCategory = String(sourceCategory).trim();
    const normalizedScores = {
      authorityScore: clampScore(authorityScore),
      accuracyScore: clampScore(accuracyScore),
      recencyScore: clampScore(recencyScore),
    };
    const overallScore = calculateOverallScore(normalizedScores);
    const status = deriveStatus(overallScore);

    // Save to source_credibility
    const sourceCredibility = new SourceCredibility({
      sourceName: normalizedName,
      sourceURL: normalizedUrl,
      sourceCategory: normalizedCategory,
      authorityScore: normalizedScores.authorityScore,
      accuracyScore: normalizedScores.accuracyScore,
      recencyScore: normalizedScores.recencyScore,
      overallScore,
      status,
    });
    const savedCredibility = await sourceCredibility.save();

    // Save to evidence_sources
    const evidenceSource = new EvidenceSource({
      sourceTitle: normalizedName,
      sourceURL: normalizedUrl,
      sourceCategory: normalizedCategory,
      credibilityScore: overallScore,
    });
    await evidenceSource.save();

    res.status(201).json(savedCredibility);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 💡 PUT update scores
router.put('/:id', async (req, res) => {
  try {
    const existing = await SourceCredibility.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Source not found' });
    }

    const updatedData = {
      sourceName: req.body.sourceName ?? existing.sourceName,
      sourceURL: req.body.sourceURL ?? existing.sourceURL,
      sourceCategory: req.body.sourceCategory ?? existing.sourceCategory,
      authorityScore: clampScore(req.body.authorityScore ?? existing.authorityScore),
      accuracyScore: clampScore(req.body.accuracyScore ?? existing.accuracyScore),
      recencyScore: clampScore(req.body.recencyScore ?? existing.recencyScore),
    };
    if (!isValidHttpUrl(updatedData.sourceURL)) {
      return res.status(400).json({ message: 'Please provide a valid URL starting with http:// or https://.' });
    }
    const overallScore = calculateOverallScore(updatedData);
    updatedData.overallScore = overallScore;
    updatedData.status = deriveStatus(overallScore);

    const source = await SourceCredibility.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    await EvidenceSource.findOneAndUpdate(
      { sourceTitle: existing.sourceName, sourceURL: existing.sourceURL },
      {
        sourceTitle: source.sourceName,
        sourceURL: source.sourceURL,
        sourceCategory: source.sourceCategory,
        credibilityScore: source.overallScore,
        lastUpdated: new Date(),
      }
    );

    res.json(source);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 💡 DELETE a source
router.delete('/:id', async (req, res) => {
  try {
    const existing = await SourceCredibility.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Source not found' });
    }

    // Per assignment rubric: delete unreliable sources.
    if (existing.status !== 'unreliable') {
      return res.status(400).json({ message: 'Only unreliable sources can be deleted.' });
    }

    const deleted = await SourceCredibility.findByIdAndDelete(req.params.id);
    await EvidenceSource.deleteMany({ sourceTitle: deleted.sourceName, sourceURL: deleted.sourceURL });
    res.json({ message: 'Source deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;