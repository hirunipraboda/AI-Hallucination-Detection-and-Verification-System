const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

// Explanation Schema (matching the model)
const explanationSchema = new mongoose.Schema({
  responseId: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
  originalText: { type: String, required: true },
  claimsInput: { type: Array, default: [] },
  verificationResultsInput: { type: Array, default: [] },
  scoresInput: { type: Object, default: {} },
  annotatedText: [{
    sentenceId: { type: Number, required: true },
    text: { type: String, required: true },
    highlightColor: { type: String, enum: ['green', 'yellow', 'red'], default: 'yellow', required: true },
    explanation: { type: String, default: '' },
    hasDetails: { type: Boolean, default: false },
    claimId: { type: String },
    startIndex: Number,
    endIndex: Number
  }],
  sourceReferences: [{
    claimId: { type: String },
    claimText: { type: String, required: true },
    verificationStatus: { type: String, enum: ['verified', 'contradicted', 'unverifiable', 'disputed'], required: true },
    summary: String,
    sources: [{
      sourceId: { type: String },
      name: { type: String, required: true },
      credibility: { type: Number, min: 0, max: 100, required: true },
      url: String,
      evidence: String,
      publicationDate: Date,
      accessedDate: { type: Date, default: Date.now },
      category: String
    }]
  }],
  scoreBreakdown: {
    confidenceScore: { type: Number, min: 0, max: 100, required: true },
    hallucinationRisk: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    factorsBreakdown: [{
      factorName: { type: String, enum: ['Verification Rate', 'Source Credibility', 'Source Consensus', 'Claim Specificity'], required: true },
      weight: { type: Number, required: true },
      value: { type: Number, required: true },
      contribution: { type: Number, required: true },
      description: String
    }]
  },
  userInteractions: {
    expandedSections: { type: [String], default: [] },
    tappedSentences: { type: [Number], default: [] },
    exported: { type: Boolean, default: false },
    lastViewed: Date,
    timeSpent: Number
  },
  metadata: {
    totalSentences: Number,
    verifiedCount: Number,
    contradictedCount: Number,
    unverifiableCount: Number,
    disputedCount: Number,
    averageSourceCredibility: Number,
    processingTime: Number
  },
  version: { type: Number, default: 1 },
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

const Explanation = mongoose.model('Explanation', explanationSchema);

// Transform payload to match model structure
function transformPayload(payload) {
  const { responseId, originalText, claims, verificationResults, scores } = payload;
  
  // Build annotatedText from claims
  const annotatedText = claims.map((claim, index) => {
    const vr = verificationResults.find(v => v.claimId === claim._id);
    let highlightColor = 'yellow';
    if (vr) {
      if (vr.status === 'verified') highlightColor = 'green';
      else if (vr.status === 'contradicted') highlightColor = 'red';
    }
    
    return {
      sentenceId: index,
      text: claim.claimText,
      highlightColor,
      explanation: vr?.summary || '',
      hasDetails: !!vr?.sources?.length,
      claimId: claim._id,
      startIndex: claim.startIndex,
      endIndex: claim.endIndex
    };
  });

  // Build sourceReferences from verificationResults
  const sourceReferences = verificationResults.map(vr => {
    const claim = claims.find(c => c._id === vr.claimId);
    return {
      claimId: vr.claimId,
      claimText: claim?.claimText || '',
      verificationStatus: vr.status,
      summary: vr.summary || '',
      sources: vr.sources.map((s, i) => ({
        sourceId: `s${i}`,
        name: s.name,
        credibility: s.credibility,
        url: s.url,
        evidence: s.evidence,
        category: s.category
      }))
    };
  });

  // Build factors breakdown
  const factorsMap = {
    'verificationRate': 'Verification Rate',
    'sourceCredibility': 'Source Credibility',
    'sourceConsensus': 'Source Consensus',
    'claimSpecificity': 'Claim Specificity'
  };
  
  const weights = { 'verificationRate': 30, 'sourceCredibility': 30, 'sourceConsensus': 20, 'claimSpecificity': 20 };
  const factorsBreakdown = Object.entries(scores.factors).map(([key, value]) => ({
    factorName: factorsMap[key],
    weight: weights[key],
    value,
    contribution: (weights[key] * value / 100),
    description: `${factorsMap[key]}: ${value}%`
  }));

  return {
    responseId,
    originalText,
    claimsInput: claims,
    verificationResultsInput: verificationResults,
    scoresInput: scores,
    annotatedText,
    sourceReferences,
    scoreBreakdown: {
      confidenceScore: scores.confidence,
      hallucinationRisk: scores.risk,
      factorsBreakdown
    },
    metadata: {
      totalSentences: claims.length,
      verifiedCount: verificationResults.filter(v => v.status === 'verified').length,
      contradictedCount: verificationResults.filter(v => v.status === 'contradicted').length,
      unverifiableCount: verificationResults.filter(v => v.status === 'unverifiable').length,
      disputedCount: verificationResults.filter(v => v.status === 'disputed').length,
      averageSourceCredibility: scores.factors.sourceCredibility,
      processingTime: 0
    }
  };
}

// Test payloads
const payloads = [
  {
    responseId: "test-report-001",
    originalText: "In the latest fiscal update, the company reported that revenue grew by 12% year-over-year, meeting most analyst expectations. However, the report also suggested that operating margins increased to 45% despite rising labor costs. Furthermore, the CEO's claim that over 500 new patents were filed in Q3 seems inconsistent with public filings which show a slower R&D pace.",
    claims: [
      { _id: "c1", claimText: "revenue grew by 12% year-over-year", startIndex: 50, endIndex: 90 },
      { _id: "c2", claimText: "operating margins increased to 45%", startIndex: 130, endIndex: 165 },
      { _id: "c3", claimText: "over 500 new patents were filed in Q3", startIndex: 210, endIndex: 255 }
    ],
    verificationResults: [
      {
        claimId: "c1",
        status: "verified",
        sources: [{ name: "SEC Form 10-Q (Q3)", credibility: 95, url: "https://www.sec.gov/example", evidence: "Revenue increased by 12.3% YoY as reported in filing.", category: "government" }]
      },
      {
        claimId: "c2",
        status: "contradicted",
        sources: [{ name: "Quarterly Report", credibility: 90, url: "https://example.com/report", evidence: "Operating margins actually decreased to 28.5% due to labor costs.", category: "corporate" }],
        summary: "The claim contradicts official financial statements."
      },
      {
        claimId: "c3",
        status: "disputed",
        sources: [
          { name: "Patent Office Database", credibility: 98, url: "https://uspto.gov", evidence: "Only 320 patents were filed in Q3.", category: "government" },
          { name: "Company Press Release", credibility: 70, url: "https://company.com/news", evidence: "CEO mentioned aggressive patent filing, but numbers not specified.", category: "news" }
        ]
      }
    ],
    scores: { confidence: 74, risk: "Medium", factors: { verificationRate: 33, sourceCredibility: 88, sourceConsensus: 60, claimSpecificity: 75 } }
  },
  {
    responseId: "med-report-001",
    originalText: "A recent meta-analysis claims that a daily intake of 2000 IU of vitamin D reduces the risk of type 2 diabetes by 30%. It also states that more than 70% of adults are currently deficient in vitamin D and that supplementation completely eliminates seasonal flu.",
    claims: [
      { _id: "m1", claimText: "2000 IU of vitamin D reduces risk of type 2 diabetes by 30%", startIndex: 30, endIndex: 111 },
      { _id: "m2", claimText: "more than 70% of adults are currently deficient in vitamin D", startIndex: 126, endIndex: 199 },
      { _id: "m3", claimText: "supplementation completely eliminates seasonal flu", startIndex: 214, endIndex: 266 }
    ],
    verificationResults: [
      {
        claimId: "m1",
        status: "verified",
        sources: [{ name: "New England Journal of Medicine", credibility: 96, url: "https://nejm.org/example-vitd-diabetes", evidence: "Large RCT shows 26–32% relative risk reduction in high-risk groups.", category: "academic" }]
      },
      {
        claimId: "m2",
        status: "unverifiable",
        sources: [{ name: "Global Nutrition Report", credibility: 89, url: "https://globalnutritionreport.org", evidence: "Vitamin D deficiency prevalence varies widely by region and age.", category: "international" }]
      },
      {
        claimId: "m3",
        status: "contradicted",
        sources: [{ name: "CDC Seasonal Flu Guidelines", credibility: 97, url: "https://cdc.gov/flu", evidence: "Supplementation may support immunity but does not eliminate flu risk.", category: "government" }],
        summary: "Overstates the benefits of supplementation beyond available evidence."
      }
    ],
    scores: { confidence: 68, risk: "Medium", factors: { verificationRate: 40, sourceCredibility: 93, sourceConsensus: 55, claimSpecificity: 80 } }
  },
  {
    responseId: "climate-report-001",
    originalText: "The article states that global CO2 emissions dropped by 25% in 2023 compared to 2019 levels. It also claims that 90% of this reduction came from the aviation sector alone, and that the Arctic sea ice fully recovered to levels observed in the 1980s.",
    claims: [
      { _id: "cl1", claimText: "global CO2 emissions dropped by 25% in 2023 compared to 2019 levels", startIndex: 22, endIndex: 111 },
      { _id: "cl2", claimText: "90% of this reduction came from the aviation sector alone", startIndex: 127, endIndex: 189 },
      { _id: "cl3", claimText: "Arctic sea ice fully recovered to levels observed in the 1980s", startIndex: 203, endIndex: 268 }
    ],
    verificationResults: [
      {
        claimId: "cl1",
        status: "disputed",
        sources: [
          { name: "IEA Emissions Report 2023", credibility: 94, url: "https://iea.org/emissions2023", evidence: "Reports a smaller reduction concentrated in specific sectors.", category: "international" },
          { name: "News Blog", credibility: 60, url: "https://example.com/climate-blog", evidence: "Claims dramatic 25% drop without citing underlying data.", category: "news" }
        ],
        summary: "Magnitude of global reduction is exaggerated and not consistently reported."
      },
      {
        claimId: "cl2",
        status: "contradicted",
        sources: [{ name: "ICAO Aviation Emissions Factsheet", credibility: 92, url: "https://icao.int/emissions", evidence: "Aviation accounts for a much smaller share of global CO2 reduction.", category: "international" }]
      },
      {
        claimId: "cl3",
        status: "contradicted",
        sources: [{ name: "NSIDC Arctic Sea Ice Data", credibility: 98, url: "https://nsidc.org/arcticseaice", evidence: "No evidence of full recovery to 1980s ice extent.", category: "academic" }]
      }
    ],
    scores: { confidence: 40, risk: "High", factors: { verificationRate: 20, sourceCredibility: 85, sourceConsensus: 35, claimSpecificity: 65 } }
  },
  {
    responseId: "edu-report-001",
    originalText: "The summary claims that our university is ranked number one in Asia for computer science, that 98% of graduates receive job offers within one month, and that tuition fees have decreased by 15% over the last two years.",
    claims: [
      { _id: "e1", claimText: "ranked number one in Asia for computer science", startIndex: 32, endIndex: 83 },
      { _id: "e2", claimText: "98% of graduates receive job offers within one month", startIndex: 90, endIndex: 152 },
      { _id: "e3", claimText: "tuition fees have decreased by 15% over the last two years", startIndex: 162, endIndex: 226 }
    ],
    verificationResults: [
      {
        claimId: "e1",
        status: "disputed",
        sources: [
          { name: "QS World University Rankings", credibility: 90, url: "https://topuniversities.com", evidence: "Lists the university in the top 10, not number one.", category: "academic" },
          { name: "Marketing Brochure", credibility: 60, url: "https://university.com/brochure", evidence: "Uses phrasing 'leading in Asia' without exact rank.", category: "news" }
        ]
      },
      {
        claimId: "e2",
        status: "verified",
        sources: [{ name: "Graduate Outcomes Survey 2024", credibility: 88, url: "https://university.com/outcomes", evidence: "97.6% of graduates employed or in further study within four weeks.", category: "corporate" }]
      },
      {
        claimId: "e3",
        status: "unverifiable",
        sources: [{ name: "Fee Schedule Archive", credibility: 80, url: "https://university.com/fees", evidence: "Public records show minor adjustments but not a clear 15% decrease.", category: "corporate" }]
      }
    ],
    scores: { confidence: 62, risk: "Medium", factors: { verificationRate: 33, sourceCredibility: 84, sourceConsensus: 55, claimSpecificity: 72 } }
  },
  {
    responseId: "policy-report-001",
    originalText: "The briefing asserts that the new infrastructure plan will create 1 million jobs within the next year, cut average commute times by 40%, and be fully funded without increasing taxes or public debt.",
    claims: [
      { _id: "p1", claimText: "create 1 million jobs within the next year", startIndex: 44, endIndex: 92 },
      { _id: "p2", claimText: "cut average commute times by 40%", startIndex: 98, endIndex: 136 },
      { _id: "p3", claimText: "fully funded without increasing taxes or public debt", startIndex: 146, endIndex: 204 }
    ],
    verificationResults: [
      {
        claimId: "p1",
        status: "unverifiable",
        sources: [{ name: "Ministry of Labor Forecast", credibility: 88, url: "https://gov.example/labor-forecast", evidence: "Projects job creation but with wide uncertainty intervals.", category: "government" }]
      },
      {
        claimId: "p2",
        status: "contradicted",
        sources: [{ name: "Transport Modeling Report", credibility: 92, url: "https://transport.example/modeling", evidence: "Estimated commute reduction between 8–15% in major cities.", category: "academic" }],
        summary: "Impact on commute times is overstated relative to official modeling."
      },
      {
        claimId: "p3",
        status: "disputed",
        sources: [
          { name: "Budget Office Analysis", credibility: 95, url: "https://budget.example/analysis", evidence: "Financing mix includes new bond issuance and reallocated taxes.", category: "government" },
          { name: "Policy Fact-Check", credibility: 80, url: "https://factcheck.example/infrastructure", evidence: "Experts disagree on long-term debt impact.", category: "fact-checker" }
        ]
      }
    ],
    scores: { confidence: 52, risk: "Medium", factors: { verificationRate: 20, sourceCredibility: 90, sourceConsensus: 45, claimSpecificity: 78 } }
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Explanation.deleteMany({});
    console.log('🗑️  Cleared existing explanations');

    // Insert new data
    for (const payload of payloads) {
      const transformed = transformPayload(payload);
      const explanation = new Explanation(transformed);
      await explanation.save();
      console.log(`✅ Inserted: ${payload.responseId}`);
    }

    console.log('\n🎉 All 5 test payloads seeded successfully!');
    console.log('\nYou can now:');
    console.log('  - GET /api/explanations → list all 5');
    console.log('  - GET /api/explanations/:responseId → get specific report');
    console.log('  - PUT /api/explanations/:responseId → update a report');
    console.log('  - DELETE /api/explanations/:responseId → delete (archive) a report');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seed();
