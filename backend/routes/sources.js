const express = require('express');
const router = express.Router();
const { EvidenceSource, SourceCredibility } = require('../models/Source');

// 💡 GET all sources
router.get('/', async (req, res) => {
  try {
    const sources = await SourceCredibility.find();
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
    // Calculate overall score from the three scores
    const { sourceName, authorityScore, accuracyScore, recencyScore, sourceURL, sourceCategory } = req.body;
    
    const overallScore = Math.round((authorityScore + accuracyScore + recencyScore) / 3);

    // Save to source_credibility
    const sourceCredibility = new SourceCredibility({
  sourceName,
  sourceCategory,
  authorityScore,
  accuracyScore,
  recencyScore,
  overallScore,
  status: overallScore >= 70 ? 'verified' : 'unverified',
});
    const savedCredibility = await sourceCredibility.save();
    // Save to evidence_sources
    const evidenceSource = new EvidenceSource({
      sourceTitle: sourceName,
      sourceURL,
      sourceCategory,
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
    const { authorityScore, accuracyScore, recencyScore } = req.body;
    const overallScore = Math.round((authorityScore + accuracyScore + recencyScore) / 3);

    const source = await SourceCredibility.findByIdAndUpdate(
      req.params.id,
      { ...req.body, overallScore, status: overallScore >= 70 ? 'verified' : 'unverified' },
      { new: true }
    );
    res.json(source);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 💡 DELETE a source
router.delete('/:id', async (req, res) => {
  try {
    await SourceCredibility.findByIdAndDelete(req.params.id);
    res.json({ message: 'Source deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;