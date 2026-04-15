const FACTOR_WEIGHTS = {
  verificationRate: 40,
  sourceCredibility: 30,
  sourceConsensus: 20,
  claimSpecificity: 10
};

exports.getFactorWeight = (factorName) => {
  return FACTOR_WEIGHTS[factorName] || 0;
};

exports.generateAnnotatedText = (claims, verificationResults) => {
  if (!claims || !Array.isArray(claims)) return [];

  return claims.map((claim, index) => {
    const claimIdStr =
      claim._id != null ? String(claim._id) : claim.claimId != null ? String(claim.claimId) : undefined;
    const verification = verificationResults?.find(v => String(v.claimId) === String(claimIdStr));

    let highlightColor = 'yellow';
    let explanation = '';

    if (verification) {
      switch (verification.status) {
        case 'verified':
          highlightColor = 'green';
          explanation = `Verified by ${verification.sources?.length || 0} credible sources`;
          break;
        case 'contradicted':
          highlightColor = 'red';
          explanation = 'Contradicted by reliable evidence';
          break;
        case 'disputed':
          highlightColor = 'yellow';
          explanation = 'Sources disagree on this claim';
          break;
        case 'unverifiable':
          highlightColor = 'yellow';
          explanation = 'No sufficient data available to verify';
          break;
      }
    }

    return {
      sentenceId: index + 1,
      text: claim.claimText || claim.text,
      highlightColor,
      explanation,
      hasDetails: !!verification,
      claimId: claimIdStr,
      startIndex: claim.startIndex,
      endIndex: claim.endIndex
    };
  });
};

exports.formatSourceReferences = (claims, verificationResults) => {
  if (!verificationResults || !Array.isArray(verificationResults)) return [];

  return verificationResults.map(verification => {
    const claimIdStr = String(verification.claimId);
    const claim = claims?.find(c => String(c._id ?? c.claimId) === claimIdStr);

    return {
      claimId: verification.claimId,
      claimText: claim?.claimText || claim?.text || 'Unknown claim',
      verificationStatus: verification.status,
      summary: verification.summary || '',
      sources: (verification.sources || []).map(source => ({
        sourceId: source.sourceId,
        name: source.name,
        credibility: source.credibility ?? 0,
        url: source.url,
        evidence: source.evidence,
        publicationDate: source.publicationDate,
        category: source.category
      }))
    };
  });
};

const factorNames = {
  verificationRate: 'Verification Rate',
  sourceCredibility: 'Source Credibility',
  sourceConsensus: 'Source Consensus',
  claimSpecificity: 'Claim Specificity'
};

exports.calculateFactorsBreakdown = (factors) => {
  if (!factors || typeof factors !== 'object') return [];

  return Object.entries(factors).map(([key, value]) => {
    const weight = FACTOR_WEIGHTS[key] || 0;
    const numVal = typeof value === 'number' ? value : 0;
    const contribution = (numVal * weight) / 100;

    let description = '';
    switch (key) {
      case 'verificationRate':
        description = `${numVal}% of claims are verified`;
        break;
      case 'sourceCredibility':
        description = `Average source credibility: ${numVal}%`;
        break;
      case 'sourceConsensus':
        description = `${numVal}% agreement among sources`;
        break;
      case 'claimSpecificity':
        description = numVal > 70 ? 'Highly specific claims' : 'Vague claims detected';
        break;
      default:
        description = `${key}: ${numVal}`;
    }

    return {
      factorName: factorNames[key] || key,
      weight,
      value: numVal,
      contribution: Math.round(contribution * 10) / 10,
      description
    };
  });
};

exports.calculateAverageCredibility = (sourceReferences) => {
  if (!sourceReferences || sourceReferences.length === 0) return 0;
  let totalCredibility = 0;
  let sourceCount = 0;
  sourceReferences.forEach(ref => {
    (ref.sources || []).forEach(source => {
      totalCredibility += source.credibility ?? 0;
      sourceCount++;
    });
  });
  return sourceCount > 0 ? Math.round(totalCredibility / sourceCount) : 0;
};

exports.generatePlainLanguageSummary = (explanation) => {
  const { confidenceScore, hallucinationRisk } = explanation.scoreBreakdown || {};
  const meta = explanation.metadata || {};
  const verifiedCount = meta.verifiedCount ?? 0;
  const totalSentences = meta.totalSentences ?? 0;
  const contradictedCount = meta.contradictedCount ?? 0;

  let summary = `This response has a ${confidenceScore}% confidence score with ${(hallucinationRisk || 'Medium').toLowerCase()} risk of hallucination. `;
  if (verifiedCount === totalSentences && totalSentences > 0) {
    summary += 'All claims could be verified. ';
  } else if (verifiedCount > totalSentences / 2) {
    summary += `Most claims (${verifiedCount} out of ${totalSentences}) are verified. `;
  } else {
    summary += `Only ${verifiedCount} out of ${totalSentences} claims could be verified. `;
  }
  if (contradictedCount > 0) {
    summary += `${contradictedCount} claim(s) were contradicted by evidence. `;
  }
  return summary;
};

exports.getHighlightColorHex = (color) => {
  const colors = { green: '#4CAF50', yellow: '#FFC107', red: '#F44336' };
  return colors[color] || '#9E9E9E';
};
