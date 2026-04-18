const { EvidenceSource, SourceCredibility } = require('../models/Source');
const {
  clampScore,
  calculateOverallScore,
  deriveStatus,
  isValidHttpUrl,
} = require('../utils/sourceCredibility');

const autoVetSource = (url) => {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    if (domain.endsWith('.gov') || domain.endsWith('.gov.lk') || domain.endsWith('.gov.uk')) {
      return { authorityScore: 95, accuracyScore: 90, recencyScore: 85,
               vetNote: 'Government domain - High trust' };
    }
    if (domain.endsWith('.edu') || domain.endsWith('.ac.lk') || domain.endsWith('.ac.uk') ||
        domain.includes('pubmed') || domain.includes('scholar')) {
      return { authorityScore: 90, accuracyScore: 88, recencyScore: 80,
               vetNote: 'Academic domain - High trust' };
    }
    if (domain.includes('reuters') || domain.includes('bbc') || domain.includes('who.int') ||
        domain.includes('un.org') || domain.includes('nature.com')) {
      return { authorityScore: 88, accuracyScore: 85, recencyScore: 82,
               vetNote: 'Trusted web source - High trust' };
    }
    if (domain.endsWith('.org')) {
      return { authorityScore: 75, accuracyScore: 70, recencyScore: 70,
               vetNote: 'Organisation domain - Medium trust' };
    }
    return { authorityScore: null, accuracyScore: null, recencyScore: null,
             vetNote: 'Unknown domain - Manual review recommended' };
  } catch (e) {
    return { authorityScore: null, accuracyScore: null, recencyScore: null,
             vetNote: 'Invalid URL' };
  }
};

exports.getAllSources = async (req, res) => {
  try {
    const filter = {};
    if (req.user && req.user.role === 'user') {
      filter.isOfficial = true;
    }
    const sources = await SourceCredibility.find(filter).sort({ updatedAt: -1 });
    res.json(sources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSourceById = async (req, res) => {
  try {
    const source = await SourceCredibility.findById(req.params.id);
    if (!source) return res.status(404).json({ message: 'Source not found' });
    res.json(source);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSource = async (req, res) => {
  try {
    const { sourceName, authorityScore, accuracyScore, recencyScore, sourceURL, sourceCategory } = req.body;
    
    // Basic validation
    if (!sourceName || !sourceCategory || !sourceURL) {
      return res.status(400).json({ message: 'sourceName, sourceCategory and sourceURL are required.' });
    }
    if (!isValidHttpUrl(sourceURL)) {
      return res.status(400).json({ message: 'Please provide a valid URL starting with http:// or https://.' });
    }

    const normalizedName = String(sourceName).trim();
    const normalizedUrl = String(sourceURL).trim();
    const normalizedCategory = String(sourceCategory).trim();
    
    // Run auto-vetting on the URL
    const vetResult = autoVetSource(normalizedUrl);

    // Fallback to provided scores if auto-vetting is inconclusive
    const normalizedScores = {
        authorityScore: clampScore(vetResult.authorityScore ?? authorityScore),
        accuracyScore: clampScore(vetResult.accuracyScore ?? accuracyScore),
        recencyScore: clampScore(vetResult.recencyScore ?? recencyScore),
    };
    
    const overallScore = calculateOverallScore(normalizedScores);
    const status = deriveStatus(overallScore);
    const vetNote = vetResult.vetNote;

    // Create Main Source record
    const sourceCredibility = new SourceCredibility({
      sourceName: normalizedName,
      sourceURL: normalizedUrl,
      sourceCategory: normalizedCategory,
      authorityScore: normalizedScores.authorityScore,
      accuracyScore: normalizedScores.accuracyScore,
      recencyScore: normalizedScores.recencyScore,
      overallScore,
      status,
      vetNote,
      isOfficial: req.user && req.user.role === 'admin' ? true : false,
     });

    const savedCredibility = await sourceCredibility.save();

    // Create Evidence Source record (for analysis engine)
    const evidenceSource = new EvidenceSource({
      sourceTitle: normalizedName,
      sourceURL: normalizedUrl,
      sourceCategory: normalizedCategory,
      credibilityScore: overallScore,
    });
    
    await evidenceSource.save();

    res.status(201).json(savedCredibility);
  } catch (error) {
    console.error('Source Creation Error:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateSource = async (req, res) => {
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
};

exports.deleteSource = async (req, res) => {
  try {
    // Only admins can delete sources
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only administrators can delete sources.' });
    }

    const existing = await SourceCredibility.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Source not found' });
    }

    await SourceCredibility.findByIdAndDelete(req.params.id);
    await EvidenceSource.deleteMany({ sourceURL: existing.sourceURL });
    res.json({ message: 'Source deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkSourceCredibility = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ message: 'URL parameter is required.' });
    }

    const existing = await SourceCredibility.findOne({ 
      sourceURL: { $regex: new RegExp(url, 'i') } 
    });

    if (existing) {
      return res.json({
        url: existing.sourceURL,
        sourceName: existing.sourceName,
        credibilityScore: existing.overallScore,
        status: existing.status,
        category: existing.sourceCategory,
        source: 'database',
      });
    }

    const vetResult = autoVetSource(url);
    const scores = {
      authorityScore: vetResult.authorityScore || 50,
      accuracyScore: vetResult.accuracyScore || 50,
      recencyScore: vetResult.recencyScore || 50,
    };
    const overallScore = calculateOverallScore(scores);

    return res.json({
      url,
      sourceName: 'Auto Vetted',
      credibilityScore: overallScore,
      status: deriveStatus(overallScore),
      category: 'Unknown',
      source: 'auto-vetted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
