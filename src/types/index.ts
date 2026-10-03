export type PageType = 'dashboard' | 'projects' | 'documents' | 'generate' | 'outputs' | 'verification' | 'review' | 'temporary';

export type CreatorType = 'Student' | 'Working Professional' | 'Researcher' | 'Faculty/Educator' | 'Entrepreneur' | 'Organization/Team' | 'Other' | string;

export type CreatorDomain = 'Artificial Intelligence' | 'Computer Science' | 'AI/ML' | 'Business' | 'Healthcare' | 'Education' | 'Marketing' | 'Finance' | 'Other' | string;

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | string;

export type PrimaryGoal = 'Learn' | 'Inform' | 'Promote' | 'Educate' | 'Summarize' | 'Present' | 'Explain' | 'Announce' | 'Persuade' | string;

export interface CreatorContext {
  creatorType: CreatorType;
  domain: CreatorDomain;
  customDomain?: string;
  experienceLevel: ExperienceLevel;
  primaryGoal: PrimaryGoal;
}

export type TargetAudienceType = 'School Students' | 'Students' | 'Working Professionals' | 'Recruiters' | 'Researchers' | 'Faculty' | 'Customers' | 'Management' | 'Developers' | 'General Public' | 'Other' | string;
export type TargetAudience = TargetAudienceType;
export type IntentType = string;

export type AudienceKnowledge = 'Beginner' | 'Intermediate' | 'Advanced';

export type CommunicationStyle = 'Simple' | 'Professional' | 'Technical' | 'Formal' | 'Conversational' | 'Promotional';

export interface AudienceContext {
  audienceType: TargetAudienceType;
  customAudienceType?: string;
  knowledgeLevel: AudienceKnowledge;
  communicationStyle: CommunicationStyle;
  language: string;
}

export type OutputType = 'briefing' | 'social' | 'ppt' | 'script';

export type TargetChannel = 'LinkedIn' | 'Instagram' | 'Presentation' | 'Internal Report' | 'Website' | 'YouTube';

export type ContentTone = 'Professional' | 'Educational' | 'Engaging' | 'Formal' | 'Concise' | 'Promotional';

export interface ContentContext {
  outputType: OutputType;
  platform: TargetChannel;
  tone: ContentTone;
  intent: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  creatorContext: CreatorContext;
  audienceContext: AudienceContext;
  contentContext: ContentContext;
  documentIds: string[];
  outputIds: string[];
}

export type ProcessingStatus = 'uploaded' | 'processing' | 'processed' | 'failed';

export type VerificationStatus = 'verified' | 'needs_review' | 'mismatch';

export type HumanReviewStatus = 'pending' | 'approved' | 'edited' | 'rejected';

export interface ExtractedInfo {
  topic: string;
  type: string;
  date: string;
  location: string;
  participants: string;
  department: string;
  purpose: string;
  organizations: string[];
  people: string[];
  keyPoints: string[];
  importantFacts: string[];
  mediaType?: 'pdf' | 'docx' | 'txt' | 'image' | 'video';
  transcriptText?: string;
}

export interface DocumentItem {
  id: string;
  projectId: string;
  name: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'image' | 'video';
  size: string;
  uploadTime: string;
  status: ProcessingStatus;
  rawText: string;
  extractedInfo: ExtractedInfo;
  isDemo?: boolean;
  _rawFile?: File;
}

export interface SourceEvidence {
  sourceDoc: string;
  page?: number;
  evidenceText: string;
  confidence: number;
}

export interface GeneratedOutput {
  id: string;
  docId: string;
  projectId: string;
  title: string;
  type: OutputType;
  audience: string;
  intent: string;
  platform: TargetChannel;
  tone: ContentTone;
  content: string;
  sourceEvidence: SourceEvidence[];
  verificationStatus: VerificationStatus;
  humanStatus: HumanReviewStatus;
  createdAt: string;
  inconsistencyFlag?: boolean;
  inconsistencyDetail?: {
    sourceValue: string;
    generatedValue: string;
    description: string;
  };
  auditTrail: {
    action: string;
    timestamp: string;
    user?: string;
  }[];
}

export interface VerificationClaim {
  id: string;
  outputId: string;
  outputTitle: string;
  claimText: string;
  sourceFact: string;
  status: VerificationStatus;
  sourceValue?: string;
  generatedValue?: string;
  evidenceQuote: string;
  sourceDoc: string;
  page?: number;
  confidence: number;
}

export interface AgentStatus {
  id: number;
  codeName: string;
  name: string;
  role: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  lastLog?: string;
  durationMs?: number;
}

export interface ApiSettings {
  apiKey: string;
  provider: 'mock' | 'openai' | 'gemini' | 'anthropic';
  modelName: string;
  apiUrl?: string;
}

export interface TemporarySession {
  id: string;
  createdAt: number;
  expiresAt: number;
  creatorContext: CreatorContext;
  audienceContext: AudienceContext;
  contentContext: ContentContext;
  document: DocumentItem | null;
  outputs: GeneratedOutput[];
  claims: VerificationClaim[];
}
