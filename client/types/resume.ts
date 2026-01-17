export interface ResumeAnalysis {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  atsScore: number;
  sections: {
    skills: SectionAnalysis;
    experience: SectionAnalysis;
    education: SectionAnalysis;
    keywords: SectionAnalysis;
    formatting: SectionAnalysis;
  };
  missingItems: string[];
  suggestions: string[];
  resumeContent: string;
}

export interface SectionAnalysis {
  present: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
}

export interface JDMatchResult {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  keywordGaps: string[];
  recommendations: string[];
}

export interface ImprovedResume {
  originalPoints: string[];
  improvedPoints: string[];
  summary: string;
  downloadReady: boolean;
}

export interface InterviewQuestion {
  category: 'hr' | 'technical' | 'situational';
  question: string;
  hint?: string;
}

export interface CoverLetter {
  content: string;
  generatedAt: string;
}

export interface UserSubscription {
  tier: 'free' | 'premium';
  scansRemaining: number;
  scansUsed: number;
  maxFreeScans: number;
}

export interface ScanHistoryItem {
  id: string;
  fileName: string;
  score: number;
  scannedAt: string;
  resumeContent?: string;
}
