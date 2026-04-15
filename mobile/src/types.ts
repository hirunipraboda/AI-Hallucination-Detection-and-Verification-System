export type RiskLevel = 'Low' | 'Medium' | 'High';
export type VerificationStatus = 'verified' | 'contradicted' | 'unverifiable' | 'disputed';
export type HighlightColor = 'green' | 'yellow' | 'red';

export interface ExplanationSummary {
  id: string;
  responseId: string;
  date: string;
  originalPreview: string;
  confidenceScore: number;
  riskLevel: RiskLevel;
  totalSentences: number;
  verifiedCount: number;
  needsContextCount: number;
  contradictedCount: number;
}

export interface FactorBreakdown {
  factorName: 'Verification Rate' | 'Source Credibility' | 'Source Consensus' | 'Claim Specificity';
  weight: number;
  value: number;
  contribution: number;
  description?: string;
}

export interface AnnotatedSentence {
  sentenceId: number;
  text: string;
  highlightColor: HighlightColor;
  explanation?: string;
  hasDetails?: boolean;
  claimId?: string;
  startIndex?: number;
  endIndex?: number;
}

export interface SourceInfo {
  sourceId?: string;
  name: string;
  credibility: number;
  url?: string;
  evidence?: string;
  publicationDate?: string;
  category?: string;
}

export interface SourceReference {
  claimId?: string;
  claimText: string;
  verificationStatus: VerificationStatus;
  summary?: string;
  sources: SourceInfo[];
}

export interface ExplanationDetail {
  _id: string;
  responseId: string;
  createdAt: string;
  originalText: string;
  annotatedText: AnnotatedSentence[];
  sourceReferences: SourceReference[];
  scoreBreakdown: {
    confidenceScore: number;
    hallucinationRisk: RiskLevel;
    factorsBreakdown: FactorBreakdown[];
  };
  metadata?: {
    totalSentences?: number;
    verifiedCount?: number;
    contradictedCount?: number;
    unverifiableCount?: number;
    disputedCount?: number;
    averageSourceCredibility?: number;
    processingTime?: number;
  };
  version?: number;
  isArchived?: boolean;

  // Stored inputs (optional)
  claimsInput?: any[];
  verificationResultsInput?: any[];
  scoresInput?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    pages: number;
  };
}

