import type { AudienceContext, ContentContext, CreatorContext, DocumentItem, ExtractedInfo, GeneratedOutput, Project, VerificationClaim } from '../types';

export const DEFAULT_CREATOR_CONTEXT: CreatorContext = {
  creatorType: 'Working Professional',
  domain: 'Computer Science',
  experienceLevel: 'Advanced',
  primaryGoal: 'Inform'
};

export const DEFAULT_AUDIENCE_CONTEXT: AudienceContext = {
  audienceType: 'Management',
  knowledgeLevel: 'Advanced',
  communicationStyle: 'Professional',
  language: 'English'
};

export const DEFAULT_CONTENT_CONTEXT: ContentContext = {
  outputType: 'briefing',
  platform: 'LinkedIn',
  tone: 'Professional',
  intent: 'Information'
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    name: 'Global Tech Innovation Campaign 2026',
    description: 'Source-grounded content campaign for the annual Global Tech Innovation Summit.',
    createdAt: new Date().toISOString().split('T')[0],
    creatorContext: DEFAULT_CREATOR_CONTEXT,
    audienceContext: DEFAULT_AUDIENCE_CONTEXT,
    contentContext: DEFAULT_CONTENT_CONTEXT,
    documentIds: ['doc-generic-demo-001'],
    outputIds: []
  },
  {
    id: 'proj-002',
    name: 'CSE Department Hackathon Briefing',
    description: '24-hour innovation challenge media kit and student outreach.',
    createdAt: new Date().toISOString().split('T')[0],
    creatorContext: {
      creatorType: 'Faculty/Educator',
      domain: 'Computer Science',
      experienceLevel: 'Expert',
      primaryGoal: 'Promote'
    },
    audienceContext: {
      audienceType: 'Students',
      knowledgeLevel: 'Intermediate',
      communicationStyle: 'Conversational',
      language: 'English'
    },
    contentContext: {
      outputType: 'social',
      platform: 'Instagram',
      tone: 'Engaging',
      intent: 'Promotion'
    },
    documentIds: [],
    outputIds: []
  }
];

export const GENERIC_SAMPLE_RAW_TEXT = `GLOBAL TECH INNOVATION SUMMIT

The Global Tech Innovation Summit is an annual technology conference organized by the Global Technology Foundation.
500 participants attended the summit.
Event Date: November 15.
The summit focuses on artificial intelligence, sustainable technology, and digital transformation.
The primary objective is to facilitate knowledge sharing and collaborate on groundbreaking solutions.
The Global Technology Foundation hosted the event.`;

export const GENERIC_SAMPLE_EXTRACTED: ExtractedInfo = {
  topic: 'Global Tech Innovation Summit',
  type: 'Multimodal Document Intelligence',
  date: 'November 15',
  location: 'International Convention Center & Virtual Stream',
  participants: '500 participants',
  department: 'Global Technology Foundation',
  purpose: 'Facilitate knowledge sharing and collaborate on sustainable technology solutions',
  organizations: ['Global Technology Foundation', 'AI Ethics Council', 'Digital Innovation Forum'],
  people: ['Keynote Speakers', 'Panel Moderators', '500 Technology Delegates'],
  keyPoints: [
    'Annual Global Tech Innovation Summit bringing together industry leaders.',
    'Total of 500 delegates and participants attended.',
    'Official Event Date: November 15.',
    'Core themes: Artificial Intelligence, Sustainable Tech, and Enterprise Digital Transformation.',
    'Hosted and managed by the Global Technology Foundation.'
  ],
  importantFacts: [
    'Summit Name: Global Tech Innovation Summit',
    'Attendance: Exactly 500 participants',
    'Host Organization: Global Technology Foundation',
    'Official Date: November 15'
  ],
  mediaType: 'pdf'
};

export const INITIAL_DEMO_DOCUMENT: DocumentItem = {
  id: 'doc-generic-demo-001',
  projectId: 'proj-001',
  name: 'Global_Tech_Summit_Report.pdf',
  fileType: 'pdf',
  size: '1.4 MB',
  uploadTime: 'Just now',
  status: 'processed',
  rawText: GENERIC_SAMPLE_RAW_TEXT,
  extractedInfo: GENERIC_SAMPLE_EXTRACTED,
  isDemo: true
};

export const generateSampleOutputs = (
  docId: string,
  projectId: string,
  docName: string,
  creatorContext: CreatorContext,
  audienceContext: AudienceContext,
  contentContext: ContentContext
): GeneratedOutput[] => {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const audience = audienceContext.audienceType === 'Other' && audienceContext.customAudienceType
    ? audienceContext.customAudienceType
    : audienceContext.audienceType;
  const intent = contentContext.intent;
  const platform = contentContext.platform;
  const tone = contentContext.tone;

  // Scenario A vs B customization based on Audience + Intent + Tone
  let briefingText = '';
  let socialText = '';
  let pptText = '';
  let videoText = '';

  if (audience === 'Students' || tone === 'Engaging' || tone === 'Promotional') {
    briefingText = `STUDENT & INNOVATOR BRIEFING: GLOBAL TECH SUMMIT 🚀
Target Audience: ${audience} | Tone: ${tone} | Channel: ${platform}
Date: November 15 | Host: Global Technology Foundation

WHAT HAPPENED:
500 enthusiastic participants gathered for the Global Tech Innovation Summit on November 15!

KEY TAKEAWAYS:
• Massive Turnout: 500 delegates and tech enthusiasts.
• Core Topics: AI architectures, sustainable clean tech, and digital leadership.
• Goal: Empowering delegates to build groundbreaking tech solutions.`;

    socialText = `🔥 500 Delegates, 1 Global Summit! 🔥

Highlights from the Global Tech Innovation Summit hosted by the Global Technology Foundation on November 15!

From artificial intelligence to sustainable clean tech, 500 minds collaborated to redefine innovation.

Platform: ${platform} | Prepared by: ${creatorContext.creatorType} (${creatorContext.domain})
#GlobalTechSummit #TechInnovation #AI #Sustainability #FutureTech`;

    pptText = `SLIDE DECK OUTLINE: GLOBAL TECH SUMMIT (STUDENT & COMMUNITY EDITION)
Audience: ${audience} | Tone: ${tone} | Channel: ${platform}

SLIDE 1: Title & Energy Hook
• Global Tech Innovation Summit 2026
• Hosted by Global Technology Foundation on November 15

SLIDE 2: Participation & Scale
• 500 delegates under one roof
• Keynote talks, workshops & real-time hackathons

SLIDE 3: Key Tech Breakthroughs
• Artificial Intelligence & Deep Learning
• Sustainable Clean Technologies

SLIDE 4: Call to Action & Join Movement
• Build real-world solutions with 500 innovators`;

    videoText = `VIDEO SCRIPT (1-MINUTE HIGH-ENERGY PROMO)
[Visual: Fast-paced drone shot of conference hall filled with 500 cheering delegates]
[Audio / Voiceover]: "What happens when 500 tech delegates assemble on November 15?"

[Visual: Speaker presenting AI neural network charts on stage]
[Audio / Voiceover]: "Welcome to the Global Tech Innovation Summit, hosted by the Global Technology Foundation!"

[Visual: Attendees high-fiving and collaborating over laptops]
[Audio / Voiceover]: "From AI models to sustainable tech, 500 delegates created solutions for tomorrow."

[Visual: Screen text displaying call to action]
[Audio / Voiceover]: "Global Tech Summit — powering the future!"`;

  } else {
    // Executive / Management Scenario B
    briefingText = `EXECUTIVE BRIEFING: GLOBAL TECH INNOVATION SUMMIT
Target Audience: ${audience} | Tone: ${tone} | Channel: ${platform}
Prepared by: ${creatorContext.creatorType} (${creatorContext.domain}) | Date: November 15

EXECUTIVE SUMMARY:
The Global Technology Foundation successfully convened the Global Tech Innovation Summit on November 15. The event brought together 500 industry leaders and technical delegates.

STRATEGIC HIGHLIGHTS:
• Executive Turnout: Exactly 500 registered delegates.
• Core Domains: Enterprise AI, Sustainable Clean Tech, and Digital Transformation.
• Strategic Value: High departmental engagement, key alliance formations, and tech policy alignment.`;

    socialText = `We are proud to summarize the outcomes of the Global Tech Innovation Summit hosted by the Global Technology Foundation on November 15.

With 500 delegates actively participating, the summit reinforced key initiatives in enterprise AI and sustainable technology leadership.

Platform: ${platform} | Prepared for ${audience}
#GlobalTechnologyFoundation #ExecutiveBriefing #TechLeadership #AI`;

    pptText = `SLIDE DECK OUTLINE: GLOBAL TECH INNOVATION SUMMIT (EXECUTIVE EDITION)
Target Audience: ${audience} | Tone: ${tone} | Channel: ${platform}

SLIDE 1: Executive Context & Overview
• Global Tech Innovation Summit 2026
• Hosted by Global Technology Foundation
• Event Date: November 15

SLIDE 2: Scale & Stakeholder Metrics
• Total Attendance: 500 delegates
• Cross-industry representation & executive workshops

SLIDE 3: Strategic Priorities & Directives
• Enterprise AI Architecture & Governance
• Sustainable Technology & Carbon Reduction
• Accelerating Digital Transformation Roadmap

SLIDE 4: Strategic Recommendations & Next Steps
• Implement policy frameworks agreed by 500 delegates`;

    videoText = `VIDEO SCRIPT (1-MINUTE EXECUTIVE BRIEFING)
[Visual: Professional conference hall, executive delegates seated at roundtable discussions]
[Audio / Voiceover]: "On November 15, 500 technology leaders convened for the Global Tech Innovation Summit."

[Visual: Keynote speaker presenting strategic roadmap on large LED screen]
[Audio / Voiceover]: "Organized by the Global Technology Foundation, the summit addressed enterprise AI and sustainable technology."

[Visual: Delegates shaking hands and exchanging strategic documents]
[Audio / Voiceover]: "500 delegates. 1 shared vision for digital transformation."`;
  }

  const evidenceBase = [
    {
      sourceDoc: docName,
      page: 1,
      evidenceText: '500 participants attended the summit.',
      confidence: 0.98
    },
    {
      sourceDoc: docName,
      page: 1,
      evidenceText: 'The Global Tech Innovation Summit is an annual technology conference organized by the Global Technology Foundation.',
      confidence: 0.96
    },
    {
      sourceDoc: docName,
      page: 1,
      evidenceText: 'Event Date: November 15.',
      confidence: 0.99
    }
  ];

  return [
    {
      id: `out-briefing-${Date.now()}`,
      docId,
      projectId,
      title: `Briefing Memo (${audience} - ${intent})`,
      type: 'briefing',
      audience,
      intent,
      platform,
      tone,
      content: briefingText,
      sourceEvidence: evidenceBase,
      verificationStatus: 'verified',
      humanStatus: 'pending',
      createdAt: timestamp,
      auditTrail: [
        { action: 'Generated by Multi-Agent RAG Engine', timestamp }
      ]
    },
    {
      id: `out-social-${Date.now() + 1}`,
      docId,
      projectId,
      title: `Social Media Post (${platform} - ${tone})`,
      type: 'social',
      audience,
      intent,
      platform,
      tone,
      content: socialText,
      sourceEvidence: evidenceBase,
      verificationStatus: 'verified',
      humanStatus: 'pending',
      createdAt: timestamp,
      auditTrail: [
        { action: 'Generated by Multi-Agent RAG Engine', timestamp }
      ]
    },
    {
      id: `out-ppt-${Date.now() + 2}`,
      docId,
      projectId,
      title: `Presentation Deck Outline (${audience})`,
      type: 'ppt',
      audience,
      intent,
      platform,
      tone,
      content: pptText,
      sourceEvidence: evidenceBase,
      verificationStatus: 'verified',
      humanStatus: 'pending',
      createdAt: timestamp,
      auditTrail: [
        { action: 'Generated by Multi-Agent RAG Engine', timestamp }
      ]
    },
    {
      id: `out-script-${Date.now() + 3}`,
      docId,
      projectId,
      title: `1-Min Video Promo Script (${platform})`,
      type: 'script',
      audience,
      intent,
      platform,
      tone,
      content: videoText,
      sourceEvidence: evidenceBase,
      verificationStatus: 'verified',
      humanStatus: 'pending',
      createdAt: timestamp,
      auditTrail: [
        { action: 'Generated by Multi-Agent RAG Engine', timestamp }
      ]
    }
  ];
};

export const INITIAL_VERIFICATION_CLAIMS: VerificationClaim[] = [
  {
    id: 'claim-1',
    outputId: 'out-briefing-1',
    outputTitle: 'Briefing Memo',
    claimText: '500 participants attended the Global Tech Innovation Summit.',
    sourceFact: '500 participants attended the summit.',
    status: 'verified',
    sourceValue: '500 participants',
    generatedValue: '500 participants',
    evidenceQuote: '500 participants attended the summit.',
    sourceDoc: 'Global_Tech_Summit_Report.pdf',
    page: 1,
    confidence: 0.99
  },
  {
    id: 'claim-2',
    outputId: 'out-briefing-1',
    outputTitle: 'Briefing Memo',
    claimText: 'The summit date is November 15.',
    sourceFact: 'Event Date: November 15.',
    status: 'verified',
    sourceValue: 'November 15',
    generatedValue: 'November 15',
    evidenceQuote: 'Event Date: November 15.',
    sourceDoc: 'Global_Tech_Summit_Report.pdf',
    page: 1,
    confidence: 0.98
  },
  {
    id: 'claim-3',
    outputId: 'out-briefing-1',
    outputTitle: 'Briefing Memo',
    claimText: 'Organized by the Global Technology Foundation.',
    sourceFact: 'The Global Technology Foundation hosted the event.',
    status: 'verified',
    sourceValue: 'Global Technology Foundation',
    generatedValue: 'Global Technology Foundation',
    evidenceQuote: 'The Global Technology Foundation hosted the event.',
    sourceDoc: 'Global_Tech_Summit_Report.pdf',
    page: 1,
    confidence: 0.99
  },
  {
    id: 'claim-4',
    outputId: 'out-briefing-1',
    outputTitle: 'Briefing Memo',
    claimText: 'Focuses on AI, sustainable technology, and digital transformation.',
    sourceFact: 'The summit focuses on artificial intelligence, sustainable technology, and digital transformation.',
    status: 'verified',
    sourceValue: 'AI, sustainable tech & digital transformation',
    generatedValue: 'AI, sustainable tech & digital transformation',
    evidenceQuote: 'The summit focuses on artificial intelligence, sustainable technology, and digital transformation.',
    sourceDoc: 'Global_Tech_Summit_Report.pdf',
    page: 1,
    confidence: 0.97
  }
];
