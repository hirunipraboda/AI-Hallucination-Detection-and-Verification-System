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
const calculateDetailedConfidence = (text, issues) => {
  let score = 0.9;
  const reasons = [];
  const lowerText = text.toLowerCase();

  // Pattern Detection
  const uncertaintyPatterns = [
    "i think", "maybe", "i'm not sure", "it could be", "might", 
    "probably", "possibly", "uncertain", "it seems", "it appears", 
    "based on what i remember", "i believe"
  ];
  
  const vaguePatterns = ["some people", "many", "often", "generally", "commonly"];

  // 1. Uncertainty Penalty
  const foundUncertainty = uncertaintyPatterns.filter(p => lowerText.includes(p));
  if (foundUncertainty.length > 0) {
    const penalty = foundUncertainty.length >= 2 ? 0.5 : 0.3;
    score -= penalty;
    reasons.push(`Contains uncertainty phrases ("${foundUncertainty.join('", "')}")`);
  } else {
    reasons.push("Clear and assertive language used");
  }

  // 2. Missing Evidence Penalty
  const hasNumbers = /\d+/.test(text);
  const hasDates = /\b(19\d{2}|20\d{2})\b/.test(text);
  const hasCitations = issues.missingCitations === 0 && text.length > 50; // Simplified check

  if (!hasNumbers && !hasDates && issues.missingCitations > 0) {
    score -= 0.2;
    reasons.push("Lacks specific evidence (numbers, dates, or citations)");
  } else if (hasNumbers || hasDates) {
    reasons.push("Includes specific factual indicators (numbers or dates)");
  }

  // 3. Vague Language Penalty
  const foundVague = vaguePatterns.filter(p => lowerText.includes(p));
  if (foundVague.length > 0) {
    score -= 0.1;
    reasons.push(`Uses vague generalizations ("${foundVague.slice(0, 2).join('", "')}")`);
  }

  // 4. Contradiction Penalty
  if (issues.contradictions > 0) {
    score -= 0.4; // Heavy penalty for internal conflict
    reasons.push("Contains internal contradictions");
  }

  // Final Clamp
  const finalScore = Math.max(0.1, Math.min(score, 1.0));
  
  let level = 'LOW';
  if (finalScore >= 0.75) level = 'HIGH';
  else if (finalScore >= 0.45) level = 'MID';

  return { 
    scoreRaw: finalScore, 
    scorePercent: Math.round(finalScore * 100),
    level, 
    reasons 
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
    const { scoreRaw, scorePercent, level, reasons } = calculateDetailedConfidence(originalResponse, issues);

    const notes = flaggedSentences.length > 0
      ? `Detected ${flaggedSentences.length} suspicious statements with potential hallucination patterns.`
      : 'No obvious hallucination patterns detected.';

    console.log('[STEP 4] Saving to Database...');
    const analysisData = {
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
    const analysis = await Analysis.findById(req.params.id);
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

    const analysis = await Analysis.findById(id);

    if (!analysis) {
      console.warn('[API WARNING] Analysis ID does not exist in DB:', id);
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
    const { scoreRaw, scorePercent, level, reasons } = calculateDetailedConfidence(textToAnalyze, issues);

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
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) return res.status(404).json({ success: false, message: 'Analysis not found' });
    await analysis.deleteOne();
    res.status(200).json({ success: true, message: 'Analysis deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete analysis', error: error.message });
  }
};