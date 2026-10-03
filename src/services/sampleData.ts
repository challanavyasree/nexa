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

export const generateDynamicOutputs = (
  docItem: DocumentItem,
  creatorContext: CreatorContext,
  audienceContext: AudienceContext,
  contentContext: ContentContext
): GeneratedOutput[] => {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const audience = audienceContext.audienceType === 'Other' && audienceContext.customAudienceType
    ? audienceContext.customAudienceType
    : audienceContext.audienceType;
  
  const intent = contentContext.intent || 'Information';
  const platform = contentContext.platform || 'LinkedIn';
  const tone = contentContext.tone || 'Professional';
  const language = audienceContext.language || 'English';

  const isStudentAudience = audience.toLowerCase().includes('student');
  const isExecutiveAudience = audience.toLowerCase().includes('management') || audience.toLowerCase().includes('executive');
  
  const docTopic = docItem.extractedInfo?.topic || docItem.name.replace(/\.[^/.]+$/, '');
  const docDate = docItem.extractedInfo?.date || 'N/A';
  const docOrg = docItem.extractedInfo?.department || docItem.extractedInfo?.organizations?.[0] || 'Source Organization';
  const docTurnout = docItem.extractedInfo?.participants || '';
  const docKeyPoints = docItem.extractedInfo?.keyPoints || ['Extracted facts indexed from source document.'];

  // Audience & Tone vocabulary adaptors
  const audienceHeading = isStudentAudience
    ? `[STUDENT EDUCATIONAL EDITION — ACCESSIBLE CONTEXT]`
    : isExecutiveAudience
    ? `[EXECUTIVE BRIEFING EDITION — STRATEGIC CONTEXT]`
    : `[${audience.toUpperCase()} EDITION]`;

  const audienceIntro = isStudentAudience
    ? `Designed specifically for ${audience} in simple, easy-to-understand language. Focuses on foundational learning and clear concepts without complex jargon.`
    : isExecutiveAudience
    ? `Prepared for ${audience} leadership. Delivers high-level strategic intelligence, operational implications, and decision-making takeaways.`
    : `Tailored for ${audience} audience with ${audienceContext.communicationStyle.toLowerCase()} communication style.`;

  // 1. Briefing Memo
  const briefingText = `${audienceHeading}
${tone.toUpperCase()} BRIEFING: ${docTopic.toUpperCase()}
Target Audience: ${audience} (${audienceContext.knowledgeLevel} Knowledge) | Tone: ${tone} | Channel: ${platform}
Language: ${language} | Objective: ${intent} | Primary Goal: ${creatorContext.primaryGoal}
Prepared by: ${creatorContext.creatorType} (${creatorContext.domain} - ${creatorContext.experienceLevel})

1. OVERVIEW & PURPOSE:
${audienceIntro}
Source Document: "${docItem.name}". Organization: ${docOrg}.${docDate !== 'N/A' ? ` Date: ${docDate}.` : ''}${docTurnout ? ` Turnout: ${docTurnout}.` : ''}

2. KEY SOURCE FINDINGS:
${docKeyPoints.map((kp, i) => `• Takeaway ${i + 1}: ${kp}`).join('\n')}

3. TARGET AUDIENCE STRATEGY (${audience.toUpperCase()}):
• Vocabulary & Style: ${audienceContext.communicationStyle} style suited for ${audienceContext.knowledgeLevel} comprehension.
• Strategic Goal: Support creator objective to ${creatorContext.primaryGoal.toLowerCase()} via ${platform}.
• Strategic Intent: ${intent} (${tone} communication).`;

  // 2. Social Media Post
  const socialHook = isStudentAudience
    ? `🎓 Hey ${audience}! Ready to learn about ${docTopic}? Here is your fun and easy breakdown on ${platform}:`
    : isExecutiveAudience
    ? `💼 Strategic Update for ${audience}: Key leadership insights from "${docItem.name}" on ${platform}:`
    : `📌 ${docTopic} — ${intent} Update for ${audience} on ${platform}:`;

  const socialText = `${socialHook}

${docKeyPoints.slice(0, 3).map(kp => `► ${kp}`).join('\n')}

${docTurnout ? `⚡ Scope/Participants: ${docTurnout}\n` : ''}🏛️ Source Entity: ${docOrg}
📅 Event/Reference Date: ${docDate}

Tone: ${tone} | Intent: ${intent} | Created by: ${creatorContext.creatorType} (${creatorContext.domain})
#${docTopic.replace(/\s+/g, '')} #${platform} #${tone} #${audience.replace(/\s+/g, '')}`;

  // 3. Presentation Deck Outline
  const pptText = `PRESENTATION DECK OUTLINE: ${docTopic.toUpperCase()}
Target Audience: ${audience} | Tone: ${tone} | Channel: ${platform} | Language: ${language}
Presenter: ${creatorContext.creatorType} (${creatorContext.domain}) | Objective: ${intent}

SLIDE 1: Title & Audience Purpose
• Topic: ${docTopic} (${audienceHeading})
• Target Audience: ${audience} (${audienceContext.knowledgeLevel} Level)
• Source Material: ${docItem.name}

SLIDE 2: Key Source Evidence & Scope
• Host / Organization: ${docOrg}
• Reference Details: ${docDate} ${docTurnout ? `| Scale: ${docTurnout}` : ''}
• Intent & Tone: ${intent} (${tone})

SLIDE 3: Core Findings
${docKeyPoints.slice(0, 4).map((kp, idx) => `• Point ${idx + 1}: ${kp}`).join('\n')}

SLIDE 4: Action Items & Communication Strategy
• Platform Channel: ${platform}
• Primary Goal: ${creatorContext.primaryGoal}`;

  // 4. Video Script
  const videoText = `VIDEO SCRIPT (${platform.toUpperCase()} FORMAT)
Target Audience: ${audience} | Tone: ${tone} | Language: ${language} | Intent: ${intent}

[00:00 - 00:15] INTRO HOOK:
[Visual: Graphic text displaying "${docTopic}" tailored for ${audience}]
[Voiceover]: "${isStudentAudience ? `Welcome students! Here is what you need to know about ${docTopic}!` : `Executive summary: Here is your brief on ${docTopic} from ${docOrg}.`}"

[00:15 - 00:40] CORE EVIDENCE & FACTS:
[Visual: Key highlights from source document ${docItem.name}]
[Voiceover]: "${docKeyPoints[0] || docTopic}. ${docKeyPoints[1] || ''}"

[00:40 - 00:60] OUTRO & CALL TO ACTION:
[Visual: Call to action banner for ${audience} on ${platform}]
[Voiceover]: "That's your breakdown for ${audience} on ${platform}. Follow for more ${creatorContext.domain} updates!"`;

  // Build dynamic RAG source evidence directly from document's facts
  const evidenceBase = docKeyPoints.slice(0, 3).map((kp, idx) => ({
    sourceDoc: docItem.name,
    page: idx + 1,
    evidenceText: kp,
    confidence: 0.95 + (idx * 0.01)
  }));

  if (evidenceBase.length === 0) {
    evidenceBase.push({
      sourceDoc: docItem.name,
      page: 1,
      evidenceText: docItem.rawText.slice(0, 150),
      confidence: 0.98
    });
  }

  const briefingObj: GeneratedOutput = {
    id: `out-briefing-${Date.now()}`,
    docId: docItem.id,
    projectId: docItem.projectId || 'proj-001',
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
    auditTrail: [{ action: 'Generated by Multi-Agent RAG Engine', timestamp }]
  };

  const socialObj: GeneratedOutput = {
    id: `out-social-${Date.now() + 1}`,
    docId: docItem.id,
    projectId: docItem.projectId || 'proj-001',
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
    auditTrail: [{ action: 'Generated by Multi-Agent RAG Engine', timestamp }]
  };

  const pptObj: GeneratedOutput = {
    id: `out-ppt-${Date.now() + 2}`,
    docId: docItem.id,
    projectId: docItem.projectId || 'proj-001',
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
    auditTrail: [{ action: 'Generated by Multi-Agent RAG Engine', timestamp }]
  };

  const scriptObj: GeneratedOutput = {
    id: `out-script-${Date.now() + 3}`,
    docId: docItem.id,
    projectId: docItem.projectId || 'proj-001',
    title: `1-Min Video Script (${platform})`,
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
    auditTrail: [{ action: 'Generated by Multi-Agent RAG Engine', timestamp }]
  };

  const allOutputs = [briefingObj, socialObj, pptObj, scriptObj];
  const requestedFormat = contentContext.outputType || 'briefing';

  // Step 3 & Step 10: Prioritize the user's selected format as the FIRST item
  const sortedOutputs = [
    ...allOutputs.filter(o => o.type === requestedFormat),
    ...allOutputs.filter(o => o.type !== requestedFormat)
  ];

  return sortedOutputs;
};

export const generateSampleOutputs = (
  docId: string,
  projectId: string,
  docName: string,
  creatorContext: CreatorContext,
  audienceContext: AudienceContext,
  contentContext: ContentContext,
  documentItem?: DocumentItem
): GeneratedOutput[] => {
  const doc: DocumentItem = documentItem || {
    id: docId,
    projectId: projectId,
    name: docName,
    fileType: 'pdf',
    size: '1.4 MB',
    uploadTime: 'Just now',
    status: 'processed',
    rawText: `Document: ${docName}\nAnalysis for ${projectId}`,
    extractedInfo: {
      topic: docName.replace(/\.[^/.]+$/, ''),
      type: 'Document Intelligence',
      date: new Date().toLocaleDateString(),
      location: 'Source Repository',
      participants: 'Target Audience',
      department: 'Content Intelligence Engine',
      purpose: 'Source grounded content generation',
      organizations: ['Content Intelligence Platform'],
      people: ['Author'],
      keyPoints: [
        `Source document indexed: ${docName}`,
        `Objective: ${contentContext.intent} for ${audienceContext.audienceType}`,
        `Platform Channel: ${contentContext.platform}`
      ],
      importantFacts: [`Doc: ${docName}`]
    }
  };

  return generateDynamicOutputs(doc, creatorContext, audienceContext, contentContext);
};

export const INITIAL_VERIFICATION_CLAIMS: VerificationClaim[] = [
  {
    id: 'claim-1',
    outputId: 'out-briefing-1',
    outputTitle: 'Briefing Memo',
    claimText: 'Content verified against uploaded source material.',
    sourceFact: 'Source document indexed into memory.',
    status: 'verified',
    sourceValue: 'Source Document',
    generatedValue: 'Briefing Memo',
    evidenceQuote: 'Source document evidence quote',
    sourceDoc: 'Global_Tech_Summit_Report.pdf',
    page: 1,
    confidence: 0.99
  }
];
