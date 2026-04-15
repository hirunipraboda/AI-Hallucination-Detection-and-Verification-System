const Explanation = require('../models/Explanation');
const Claim = require('../models/Claim');
const explanationService = require('../services/explanationService');
const { validationResult } = require('express-validator');

// @desc    Create explanation for a response
// @route   POST /api/explanations
// @access  Public
exports.createExplanation = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { responseId, originalText, claims, verificationResults, scores } = req.body;

    console.log(`📝 Creating explanation for response: ${responseId}`);

    // Start timer for processing time
    const startTime = Date.now();

    // Generate annotated text using service
    const annotatedText = explanationService.generateAnnotatedText(claims, verificationResults);
    
    // Format source references
    const sourceReferences = explanationService.formatSourceReferences(claims, verificationResults);
    
    // Calculate metadata
    const metadata = {
      totalSentences: annotatedText.length,
      verifiedCount: annotatedText.filter(s => s.highlightColor === 'green').length,
      contradictedCount: annotatedText.filter(s => s.highlightColor === 'red').length,
      unverifiableCount: annotatedText.filter(s => s.highlightColor === 'yellow' && !s.explanation).length,
      disputedCount: annotatedText.filter(s => s.highlightColor === 'yellow' && s.explanation).length,
      averageSourceCredibility: explanationService.calculateAverageCredibility(sourceReferences),
      processingTime: Date.now() - startTime
    };

    // Create explanation object
    const explanationData = {
      responseId,
      originalText,
      annotatedText,
      sourceReferences,
      scoreBreakdown: {
        confidenceScore: scores.confidence,
        hallucinationRisk: scores.risk,
        factorsBreakdown: explanationService.calculateFactorsBreakdown(scores.factors)
      },
      metadata,
      createdAt: new Date()
    };

    // Save to database
    const explanation = await Explanation.create(explanationData);

    res.status(201).json({
      success: true,
      data: explanation,
      message: 'Explanation created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating explanation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create explanation',
      message: error.message
    });
  }
};

// @desc    Get explanation by response ID
// @route   GET /api/explanations/:responseId
// @access  Public
exports.getExplanation = async (req, res) => {
  try {
    const { responseId } = req.params;

    const explanation = await Explanation.findOne({ 
      responseId,
      isArchived: false 
    });

    if (!explanation) {
      return res.status(404).json({
        success: false,
        error: 'Explanation not found'
      });
    }

    // Update last viewed timestamp
    explanation.userInteractions.lastViewed = new Date();
    await explanation.save();

    res.json({
      success: true,
      data: explanation
    });

  } catch (error) {
    console.error('❌ Error fetching explanation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch explanation',
      message: error.message
    });
  }
};

// @desc    Get all explanations (optionally filter by responseId)
// @route   GET /api/explanations
// @access  Public
exports.getUserExplanations = async (req, res) => {
  try {
    const { page = 1, limit = 10, risk, sort = 'desc' } = req.query;

    // Build query
    const query = { isArchived: false };
    if (risk) {
      query['scoreBreakdown.hallucinationRisk'] = risk;
    }

    // Get total count
    const total = await Explanation.countDocuments(query);

    // Get paginated results
    const explanations = await Explanation.find(query)
      .sort({ createdAt: sort === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('responseId createdAt scoreBreakdown metadata originalText');

    // Get summaries
    const summaries = explanations.map(exp => exp.getSummary());

    res.json({
      success: true,
      data: summaries,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error fetching explanations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch explanations',
      message: error.message
    });
  }
};

// @desc    Update explanation (when verification changes)
// @route   PUT /api/explanations/:responseId
// @access  Public
exports.updateExplanation = async (req, res) => {
  try {
    const { responseId } = req.params;
    const { claims, verificationResults, scores } = req.body;

    // Generate updated content
    const annotatedText = explanationService.generateAnnotatedText(claims, verificationResults);
    const sourceReferences = explanationService.formatSourceReferences(claims, verificationResults);
    
    // Update metadata
    const metadata = {
      totalSentences: annotatedText.length,
      verifiedCount: annotatedText.filter(s => s.highlightColor === 'green').length,
      contradictedCount: annotatedText.filter(s => s.highlightColor === 'red').length,
      unverifiableCount: annotatedText.filter(s => s.highlightColor === 'yellow' && !s.explanation).length,
      disputedCount: annotatedText.filter(s => s.highlightColor === 'yellow' && s.explanation).length,
      averageSourceCredibility: explanationService.calculateAverageCredibility(sourceReferences)
    };

    // Find and update
    const explanation = await Explanation.findOneAndUpdate(
      { responseId },
      {
        annotatedText,
        sourceReferences,
        scoreBreakdown: {
          confidenceScore: scores.confidence,
          hallucinationRisk: scores.risk,
          factorsBreakdown: explanationService.calculateFactorsBreakdown(scores.factors)
        },
        metadata,
        $inc: { version: 1 }
      },
      { new: true, runValidators: true }
    );

    if (!explanation) {
      return res.status(404).json({
        success: false,
        error: 'Explanation not found'
      });
    }

    res.json({
      success: true,
      data: explanation,
      message: 'Explanation updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating explanation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update explanation',
      message: error.message
    });
  }
};

// @desc    Delete explanation (soft delete)
// @route   DELETE /api/explanations/:responseId
// @access  Public
exports.deleteExplanation = async (req, res) => {
  try {
    const { responseId } = req.params;

    const explanation = await Explanation.findOneAndUpdate(
      { responseId },
      { isArchived: true },
      { new: true }
    );

    if (!explanation) {
      return res.status(404).json({
        success: false,
        error: 'Explanation not found'
      });
    }

    res.json({
      success: true,
      message: 'Explanation archived successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting explanation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete explanation',
      message: error.message
    });
  }
};

// @desc    Track user interaction (tapped sentence)
// @route   POST /api/explanations/:responseId/interaction
// @access  Public
exports.trackInteraction = async (req, res) => {
  try {
    const { responseId } = req.params;
    const { sentenceId, action, section, seconds } = req.body;

    const explanation = await Explanation.findOne({ responseId });

    if (!explanation) {
      return res.status(404).json({
        success: false,
        error: 'Explanation not found'
      });
    }

    // Track different types of interactions
    switch (action) {
      case 'tap':
        if (!explanation.userInteractions.tappedSentences.includes(sentenceId)) {
          explanation.userInteractions.tappedSentences.push(sentenceId);
        }
        break;
      
      case 'expand':
        if (!explanation.userInteractions.expandedSections.includes(section)) {
          explanation.userInteractions.expandedSections.push(section);
        }
        break;
      
      case 'export':
        explanation.userInteractions.exported = true;
        break;
      
      case 'time':
        explanation.userInteractions.timeSpent = (explanation.userInteractions.timeSpent || 0) + seconds;
        break;
    }

    await explanation.save();

    res.json({
      success: true,
      data: explanation.userInteractions
    });

  } catch (error) {
    console.error('❌ Error tracking interaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track interaction',
      message: error.message
    });
  }
};

// @desc    Export explanation as report
// @route   GET /api/explanations/:responseId/export
// @access  Public
exports.exportExplanation = async (req, res) => {
  try {
    const { responseId } = req.params;
    const { format = 'json' } = req.query;

    const explanation = await Explanation.findOne({ responseId });

    if (!explanation) {
      return res.status(404).json({
        success: false,
        error: 'Explanation not found'
      });
    }

    // Track export
    explanation.userInteractions.exported = true;
    await explanation.save();

    if (format === 'json') {
      return res.json({
        success: true,
        data: explanation
      });
    }

    // For other formats (PDF, etc.), you'd implement here
    res.json({
      success: true,
      message: 'Export functionality for other formats coming soon',
      data: explanation
    });

  } catch (error) {
    console.error('❌ Error exporting explanation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export explanation',
      message: error.message
    });
  }
};