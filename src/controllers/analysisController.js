const Analysis = require('../models/Analysis');

/**
 * Cleanly split text into sentences using regex
 */
const splitIntoSentences = (text) => {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);
};

/**
 * Extract verifiable claims from text
 * Returns [{ text, sentence, type, confidence }]
 */
const extractClaimsStructured = (text) => {
  const sentences = splitIntoSentences(text);
  const claims = [];

  sentences.forEach((sentence) => {
    let type = 'general';
    let confidence = 0.5;

    // Detect Factual/Statistical claims
    if (/\d+/.test(sentence) || /%/.test(sentence) || /\b(million|billion|percent)\b/i.test(sentence)) {
      type = 'statistical';
      confidence = 0.7;
    } else if (/\b(January|February|March|April|May|June|July|August|September|October|November|December|19\d{2}|20\d{2})\b/i.test(sentence)) {
      type = 'historical';
      confidence = 0.65;
    } else if (/\b(is|are|was|were|states|found|located in|capital of)\b/i.test(sentence)) {
      type = 'factual';
      confidence = 0.6;
    }

    // Only store if it looks like a verifiable claim
    if (sentence.length > 25 || type !== 'general') {
      claims.push({
        text: sentence, // In a real NLP app, we'd extract the specific claim fragment
        sentence: sentence,
        type,
        confidence,
      });
    }
  });

  return claims;
};

/**
 * Detect issues and provide reasons for each flagged sentence
 */
const detectIssuesEnhanced = (text) => {
  const sentences = splitIntoSentences(text);
  const flaggedSentences = [];
  
  const stats = {
    unsupportedClaims: 0,
    overconfidentStatements: 0,
    missingCitations: 0,
    contradictions: 0,
  };

  const rules = [
    {
      name: 'Overconfident Wording',
      keywords: ['definitely', 'certainly', 'always', 'never', 'proven', 'guaranteed', 'undeniably', 'without doubt'],
      category: 'overconfidentStatements',
    },
    {
      name: 'Vague Generalization',
      keywords: ['many people say', 'it is widely believed', 'experts say', 'studies show' /* without specific ref */],
      category: 'unsupportedClaims',
    },
    {
      name: 'Absolute Statement',
      keywords: ['all', 'none', 'every', 'everyone', 'nobody'],
      category: 'unsupportedClaims',
    },
  ];

  const citationIndicators = ['according to', 'source', 'study', 'report', '[', 'http', 'www', 'ref:'];

  sentences.forEach((sentence) => {
    const lower = sentence.toLowerCase();
    const reasons = [];

    // Check basic rules
    rules.forEach((rule) => {
      if (rule.keywords.some((word) => lower.includes(word))) {
        reasons.push(rule.name);
        stats[rule.category]++;
      }
    });

    // Check for missing citations on factual-sounding claims
    const hasCitation = citationIndicators.some((indicator) => lower.includes(indicator));
    const looksFactual = /\b(is|are|was|were|has|have|will|states|shows|indicates)\b/i.test(sentence);
    
    if (looksFactual && !hasCitation && sentence.length > 40) {
      reasons.push('Missing Citation');
      stats.missingCitations++;
    }

    // Unverifiable Statistics
    if (/\d+/.test(sentence) && !hasCitation && !lower.includes('page') && !lower.includes('version')) {
      reasons.push('Unverifiable Statistic');
      stats.unsupportedClaims++;
    }

    if (reasons.length > 0) {
      flaggedSentences.push({
        text: sentence,
        reasons: [...new Set(reasons)],
      });
    }
  });

  // Contradiction Detection (Simple context-free check)
  const lowerText = text.toLowerCase();
  if (
    (lowerText.includes('is true') && lowerText.includes('is false')) ||
    (lowerText.includes('always') && lowerText.includes('never')) ||
    (lowerText.includes('recommend') && lowerText.includes('do not recommend'))
  ) {
    stats.contradictions = 1;
    // We'd ideally flag the specific sentences here
  }

  return { flaggedSentences, issues: stats };
};

/**
 * Calculate detailed confidence score with penalties for uncertainty and vague language
 * Returns { score, level, reasons }
 */
const calculateDetailedConfidence = (text, issues, flaggedCount = 0) => {
  // Start with a slightly lower base for rule-based engine
  let score = 0.85;
  const reasons = [];
  const lowerText = text.toLowerCase();

  // Pattern Detection
  const uncertaintyPatterns = [
    "i think", "maybe", "i'm not sure", "it could be", "might", 
    "probably", "possibly", "uncertain", "it seems", "it appears", 
    "based on what i remember", "i believe", "could potentially"
  ];
  
  const vaguePatterns = ["some people", "many", "often", "generally", "commonly", "it is said"];

  // 1. Uncertainty Penalty (Up to 0.45)
  const foundUncertainty = uncertaintyPatterns.filter(p => lowerText.includes(p));
  if (foundUncertainty.length > 0) {
    const penalty = foundUncertainty.length >= 3 ? 0.45 : (foundUncertainty.length >= 1 ? 0.25 : 0);
    score -= penalty;
    reasons.push(`Contains multiple uncertainty phrases ("${foundUncertainty.slice(0, 3).join('", "')}")`);
  } else {
    reasons.push("Assertive language style");
  }

  // 2. Missing Evidence & Citation Penalty (Up to 0.3)
  const hasNumbers = /\d+/.test(text);
  const hasDates = /\b(19\d{2}|20\d{2})\b/.test(text);
  
  if (issues.missingCitations > 0) {
    const citationPenalty = Math.min(0.3, issues.missingCitations * 0.15);
    score -= citationPenalty;
    reasons.push(`Lacks citations for ${issues.missingCitations} factual-sounding statement(s)`);
  } else if (hasNumbers || hasDates) {
    reasons.push("Includes specific factual indicators (numbers or dates)");
  }

  // 3. Vague Language & Generalization Penalty (Up to 0.2)
  const foundVague = vaguePatterns.filter(p => lowerText.includes(p));
  if (foundVague.length > 0 || issues.unsupportedClaims > 0) {
    const vaguePenalty = Math.min(0.2, (foundVague.length * 0.05) + (issues.unsupportedClaims * 0.05));
    score -= vaguePenalty;
    reasons.push("Uses vague generalizations or unsupported claims");
  }

  // 4. Overconfidence Penalty (Up to 0.25)
  // Hallucinations are often overconfident. If we flagged overconfident wording, penalize it.
  if (issues.overconfidentStatements > 0) {
    const overconfPenalty = Math.min(0.25, issues.overconfidentStatements * 0.1);
    score -= overconfPenalty;
    reasons.push("Uses absolute/overconfident wording without source validation");
  }

  // 5. Total Flagged Sentences Penalty (Penalty per suspicion)
  if (flaggedCount > 0) {
    const suspicionPenalty = Math.min(0.4, flaggedCount * 0.1);
    score -= suspicionPenalty;
    reasons.push(`Detected ${flaggedCount} suspicious sentence(s) with hallucination patterns`);
  }

  // 6. Contradiction Penalty (HEAVY)
  if (issues.contradictions > 0) {
    score -= 0.5; // Heavy penalty for internal conflict
    reasons.push("Contains critical internal contradictions");
  }

  // Final Clamp
  const finalScore = Math.max(0.05, Math.min(score, 1.0));
  
  let level = 'LOW';
  if (finalScore >= 0.8) level = 'HIGH'; // Stricter threshold for HIGH
  else if (finalScore >= 0.4) level = 'MID';

  return { 
    scoreRaw: finalScore, 
    scorePercent: Math.round(finalScore * 100),
    level, 
    reasons: [...new Set(reasons)] // Unique reasons
  };
};

const getConfidenceLevel = (score) => {
  if (score >= 75) return 'HIGH';
  if (score >= 45) return 'MID';
  return 'LOW';
};

/**
 * CREATE Analysis
 */
exports.createAnalysis = async (req, res) => {
  try {
    console.log('--- NEW ANALYSIS REQUEST ---');
    console.log('POST /api/analysis/analyze body:', JSON.stringify(req.body, null, 2));
    
    console.log('[API] Processing response:', req.body.originalResponse.substring(0, 50));
    
    if (!req.body.originalResponse || req.body.originalResponse.trim().length < 10) {
      return res.status(400).json({
        message: "Response is too short"
      });
    }

    const originalResponse = req.body.originalResponse.trim();

    if (originalResponse.length > 2000) {
      return res.status(400).json({
        message: "Response too long"
      });
    }

    const existing = await Analysis.findOne({ originalResponse });

    if (existing) {
      console.warn('[VALIDATION] Duplicate response detected');
      return res.status(409).json({
        success: false,
        message: "Duplicate response"
      });
    }

    console.log('[STEP 1] Extracting claims...');
    const extractedClaims = extractClaimsStructured(originalResponse);
    console.log('[STEP 2] Detecting issues...');
    const { flaggedSentences, issues } = detectIssuesEnhanced(originalResponse);
    
    console.log('[STEP 3] Calculating confidence...');
    // NEW Detailed Confidence Scoring
    const { scoreRaw, scorePercent, level, reasons } = calculateDetailedConfidence(originalResponse, issues, flaggedSentences.length);

    const notes = flaggedSentences.length > 0
      ? `Detected ${flaggedSentences.length} suspicious statements with potential hallucination patterns.`
      : 'No obvious hallucination patterns detected.';

    console.log('[STEP 4] Saving to Database...');
    const analysisData = {
      user: req.user._id,
      originalResponse,
      extractedClaims,
      flaggedSentences,
      issues,
      score: scorePercent,
      confidenceScoreRaw: scoreRaw,
      confidenceLevel: level,
      confidenceReasons: reasons,
      notes,
      metadata: {
        responseLength: originalResponse.length,
        claimCount: extractedClaims.length,
        sourceType: 'rule-based-engine',
        userIP: req.ip
      },
      suspiciousSentences: flaggedSentences.map(s => s.text)
    };

    const analysis = await Analysis.create(analysisData);

    console.log('[DB] Analysis record created successfully:', analysis._id);

    res.status(201).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('[CRITICAL ERROR] createAnalysis failed:', error);
    
    // Handle MongoDB duplicate key error (11000)
    if (error.code === 11000) {
      console.warn('[VALIDATION] MongoDB Duplicate Key Error (11000)');
      return res.status(409).json({
        success: false,
        message: "Duplicate response"
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Failed to create analysis', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * READ ALL
 */
exports.getAllAnalyses = async (req, res) => {
  try {
    const { search = '', confidenceLevel } = req.query;
    const query = {};

    if (search) query.originalResponse = { $regex: search, $options: 'i' };
    if (confidenceLevel) query.confidenceLevel = confidenceLevel.toUpperCase();

    // Ensure users only see their own history
    query.user = req.user._id;

    const analyses = await Analysis.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: analyses.length, data: analyses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch analyses', error: error.message });
  }
};

/**
 * READ ONE
 */
exports.getAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!analysis) return res.status(404).json({ success: false, message: 'Analysis not found' });
    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch analysis', error: error.message });
  }
};

/**
 * UPDATE / RE-ANALYZE
 */
exports.updateAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const { originalResponse, notes } = req.body;

    console.log('[API] updateAnalysis ID:', id);

    // Validate ID format (avoid crashing with non-ObjectId such as local-preview)
    if (!id || id === 'local-preview' || (id.length !== 24 && id.length !== 12)) {
      console.warn('[API WARNING] Invalid or temporary ID for update:', id);
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    const analysis = await Analysis.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!analysis) {
      console.warn('[API WARNING] Analysis ID does not exist or unauthoized:', id);
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    // RE-ANALYZE fallback to originalText if originalResponse is missing in old records
    const textToAnalyze = originalResponse || analysis.originalResponse || analysis.get('originalText');
    
    if (!textToAnalyze) {
      return res.status(400).json({ success: false, message: 'No content found to re-analyze' });
    }

    const extractedClaims = extractClaimsStructured(textToAnalyze);
    const { flaggedSentences, issues } = detectIssuesEnhanced(textToAnalyze);
    
    // NEW Detailed Confidence Scoring
    const { scoreRaw, scorePercent, level, reasons } = calculateDetailedConfidence(textToAnalyze, issues, flaggedSentences.length);

    analysis.originalResponse = textToAnalyze;
    analysis.extractedClaims = extractedClaims;
    analysis.flaggedSentences = flaggedSentences;
    analysis.suspiciousSentences = flaggedSentences.map(s => s.text);
    analysis.issues = issues;
    analysis.score = scorePercent;
    analysis.confidenceScoreRaw = scoreRaw;
    analysis.confidenceLevel = level;
    analysis.confidenceReasons = reasons;
    
    if (notes) analysis.notes = notes;

    await analysis.save();
    res.status(200).json({ success: true, message: 'Analysis updated and re-processed successfully', data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update analysis', error: error.message });
  }
};

/**
 * DELETE
 */
exports.deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!analysis) return res.status(404).json({ success: false, message: 'Analysis not found' });
    await analysis.deleteOne();
    res.status(200).json({ success: true, message: 'Analysis deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete analysis', error: error.message });
  }
};