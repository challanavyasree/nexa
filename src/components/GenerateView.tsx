import React, { useState } from 'react';
import type { AgentStatus, ApiSettings, AudienceContext, ContentContext, CreatorContext, DocumentItem, GeneratedOutput, IntentType, PageType, Project, TargetAudience } from '../types';
import { DEFAULT_AUDIENCE_CONTEXT, DEFAULT_CONTENT_CONTEXT, DEFAULT_CREATOR_CONTEXT } from '../services/sampleData';
import { runMultiAgentGeneration } from '../services/aiGenerator';
import { processUploadedFile, extractStructuredInfoFromText } from '../services/documentProcessor';
import { Sparkles, Upload, User, Users, Layers, FileText, CheckCircle2, Play, Cpu, Save, X, AlertCircle, RefreshCw } from 'lucide-react';

interface GenerateViewProps {
  activeDocument: DocumentItem | null;
  targetAudience: TargetAudience;
  setTargetAudience: (aud: TargetAudience) => void;
  customAudienceText: string;
  setCustomAudienceText: (txt: string) => void;
  intent: IntentType;
  setIntent: (intent: IntentType) => void;
  customIntentText: string;
  setCustomIntentText: (txt: string) => void;
  agents: AgentStatus[];
  setAgents: React.Dispatch<React.SetStateAction<AgentStatus[]>>;
  onOutputsGenerated: (outputs: GeneratedOutput[]) => void;
  onProceedToOutputs: () => void;
  apiSettings: ApiSettings;
  onAddDocument?: (doc: DocumentItem) => void;
  onSelectDocument?: (doc: DocumentItem) => void;
  onCreateProject?: (proj: Project) => void;
  onNavigatePage?: (page: PageType) => void;
  onOpenSettings?: () => void;
}

export const GenerateView: React.FC<GenerateViewProps> = ({
  activeDocument,
  targetAudience,
  setTargetAudience,
  customAudienceText,
  setCustomAudienceText,
  intent,
  setIntent,
  customIntentText,
  setCustomIntentText,
  agents,
  setAgents,
  onOutputsGenerated,
  onProceedToOutputs,
  apiSettings,
  onAddDocument,
  onSelectDocument,
  onCreateProject,
  onNavigatePage,
  onOpenSettings
}) => {
  // Creator, Audience & Content Context Forms
  const [creatorCtx, setCreatorCtx] = useState<CreatorContext>(DEFAULT_CREATOR_CONTEXT);
  const [audienceCtx, setAudienceCtx] = useState<AudienceContext>({
    ...DEFAULT_AUDIENCE_CONTEXT,
    audienceType: targetAudience === 'Custom Audience' ? 'Other' : (targetAudience as any) || 'Management'
  });
  const [contentCtx, setContentCtx] = useState<ContentContext>({
    ...DEFAULT_CONTENT_CONTEXT,
    intent: intent === 'Custom Intent' ? customIntentText || 'Information' : intent || 'Information'
  });

  // Local document, output & error state
  const [uploadedDoc, setUploadedDoc] = useState<DocumentItem | null>(activeDocument);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [generatedOutputs, setGeneratedOutputs] = useState<GeneratedOutput[]>([]);

  // Project Creation Modal State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveProjName, setSaveProjName] = useState('');
  const [saveProjDesc, setSaveProjDesc] = useState('');

  // Handle Multimodal Source File Upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsProcessing(true);
    setGenerationError(null);

    try {
      const { text, fileType } = await processUploadedFile(file, apiSettings);
      const extractedInfo = extractStructuredInfoFromText(text, fileType, file.name);

      const isVisionFailed = fileType === 'image' && (
        text.includes('Visual understanding unavailable') ||
        extractedInfo.topic === 'Visual Analysis Unavailable'
      );

      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        projectId: activeDocument?.projectId || `proj-${Date.now()}`,
        name: file.name,
        fileType,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        uploadTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: isVisionFailed ? 'failed' : 'processed',
        rawText: text,
        extractedInfo,
        _rawFile: file
      };

      setUploadedDoc(newDoc);
      if (onAddDocument) onAddDocument(newDoc);
      if (onSelectDocument) onSelectDocument(newDoc);
    } catch (err: any) {
      console.error(err);
      setGenerationError(err?.message || 'Failed to process uploaded file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const currentDoc = uploadedDoc || activeDocument;
  const isImageUnavail = currentDoc?.fileType === 'image' && (
    currentDoc.status === 'failed' ||
    currentDoc.rawText.includes('Visual understanding unavailable') ||
    currentDoc.extractedInfo?.topic === 'Visual Analysis Unavailable'
  );

  // Run AI Multi-Agent Generation
  const handleStartGeneration = async () => {
    const docToUse = uploadedDoc || activeDocument;
    if (!docToUse) {
      setGenerationError('No source document available for generation. Please upload a source document.');
      return;
    }

    if (docToUse.fileType === 'image' && (docToUse.rawText.includes('Visual understanding unavailable') || docToUse.extractedInfo?.topic === 'Visual Analysis Unavailable')) {
      setGenerationError('Image understanding is unavailable. Please configure a vision-capable AI API in API Config.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    const updateAgentStep = (agentId: number, status: 'running' | 'completed' | 'error', log: string) => {
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status, lastLog: log } : a));
    };

    console.log('GENERATE_REQUEST_PAYLOAD', {
      documentId: docToUse.id,
      documentName: docToUse.name,
      creatorContext: creatorCtx,
      audienceContext: audienceCtx,
      contentContext: contentCtx
    });

    try {
      const newOutputs = await runMultiAgentGeneration(
        docToUse,
        audienceCtx.audienceType === 'Other' ? (audienceCtx.customAudienceType || 'Target Audience') : (audienceCtx.audienceType as any),
        contentCtx.intent as any,
        apiSettings,
        updateAgentStep,
        creatorCtx,
        audienceCtx,
        contentCtx
      );
      setGeneratedOutputs(newOutputs);
      onOutputsGenerated(newOutputs);
    } catch (err: any) {
      console.error(err);
      setGenerationError(err?.message || 'Generation pipeline failed. Please check API Configuration.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save Permanent Project
  const handleConfirmSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveProjName.trim()) return;

    const docToUse = uploadedDoc || activeDocument;
    const newProjId = `proj-${Date.now()}`;

    const newProject: Project = {
      id: newProjId,
      name: saveProjName,
      description: saveProjDesc || 'Permanent Content Intelligence Project.',
      createdAt: new Date().toISOString().split('T')[0],
      creatorContext: creatorCtx,
      audienceContext: audienceCtx,
      contentContext: contentCtx,
      documentIds: docToUse ? [docToUse.id] : [],
      outputIds: generatedOutputs.map(o => o.id)
    };

    if (onCreateProject) onCreateProject(newProject);
    setIsSaveModalOpen(false);

    if (onNavigatePage) {
      onNavigatePage('projects');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            New Project Workflow & Content Generation Engine
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Define Creator Context, Target Audience, Content Intent, upload source files, and run the 6-Agent RAG pipeline.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {generatedOutputs.length > 0 && (
            <button
              onClick={() => {
                setSaveProjName(`Project - ${currentDoc?.extractedInfo.topic || 'Campaign'}`);
                setSaveProjDesc(`Permanent AI Content Intelligence project generated on ${new Date().toLocaleDateString()}`);
                setIsSaveModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save as Permanent Project</span>
            </button>
          )}

          <button
            onClick={handleStartGeneration}
            disabled={isGenerating || !currentDoc || isImageUnavail}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center space-x-2 cursor-pointer ${
              isGenerating || !currentDoc || isImageUnavail
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white shadow-indigo-500/25'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                <span>Generating Formats...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run Generation Pipeline</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visual Analysis Unavailable Warning Banner */}
      {isImageUnavail && (
        <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-xs text-amber-200 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-amber-300">Image Visual Understanding Unavailable</p>
              <p className="text-[11px] text-amber-200/90 mt-0.5">
                Image visual analysis requires an active vision-capable API key. Please configure your API key in API Config.
              </p>
            </div>
          </div>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center space-x-1.5 cursor-pointer shrink-0"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Configure API Config</span>
            </button>
          )}
        </div>
      )}

      {/* Grid Layout: Section Controls | File Upload & Pipeline Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Workflow Context Sections */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section A: Creator / User Context */}
          <div className="glass-panel p-5 rounded-2xl space-y-3 border border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-sky-400" />
              A. Creator / User Context
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">User Type</label>
                <select
                  value={creatorCtx.creatorType}
                  onChange={(e) => setCreatorCtx({ ...creatorCtx, creatorType: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                >
                  <option value="Student">Student</option>
                  <option value="Working Professional">Working Professional</option>
                  <option value="Researcher">Researcher</option>
                  <option value="Faculty/Educator">Faculty / Educator</option>
                  <option value="Entrepreneur">Entrepreneur</option>
                  <option value="Organization/Team">Organization / Team</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Domain</label>
                <select
                  value={creatorCtx.domain}
                  onChange={(e) => setCreatorCtx({ ...creatorCtx, domain: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                >
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="AI/ML">AI / ML</option>
                  <option value="Business">Business</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="Other">Other Domain</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Experience Level</label>
                <select
                  value={creatorCtx.experienceLevel}
                  onChange={(e) => setCreatorCtx({ ...creatorCtx, experienceLevel: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Primary Goal</label>
                <select
                  value={creatorCtx.primaryGoal}
                  onChange={(e) => setCreatorCtx({ ...creatorCtx, primaryGoal: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                >
                  <option value="Learn">Learn</option>
                  <option value="Inform">Inform</option>
                  <option value="Promote">Promote</option>
                  <option value="Educate">Educate</option>
                  <option value="Summarize">Summarize</option>
                  <option value="Present">Present</option>
                  <option value="Explain">Explain</option>
                  <option value="Announce">Announce</option>
                  <option value="Persuade">Persuade</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section B: Target Audience Context */}
          <div className="glass-panel p-5 rounded-2xl space-y-3 border border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              B. Target Audience Context
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Audience Type</label>
                <select
                  value={audienceCtx.audienceType}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setAudienceCtx({ ...audienceCtx, audienceType: val });
                    setTargetAudience(val === 'Other' ? 'Custom Audience' : val);
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                >
                  <option value="School Students">School Students</option>
                  <option value="Students">Students</option>
                  <option value="Working Professionals">Working Professionals</option>
                  <option value="Recruiters">Recruiters</option>
                  <option value="Researchers">Researchers</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Customers">Customers</option>
                  <option value="Management">Management</option>
                  <option value="Developers">Developers</option>
                  <option value="General Public">General Public</option>
                  <option value="Other">Custom Persona</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Audience Knowledge</label>
                <select
                  value={audienceCtx.knowledgeLevel}
                  onChange={(e) => setAudienceCtx({ ...audienceCtx, knowledgeLevel: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Communication Style</label>
                <select
                  value={audienceCtx.communicationStyle}
                  onChange={(e) => setAudienceCtx({ ...audienceCtx, communicationStyle: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                >
                  <option value="Simple">Simple</option>
                  <option value="Professional">Professional</option>
                  <option value="Technical">Technical</option>
                  <option value="Formal">Formal</option>
                  <option value="Conversational">Conversational</option>
                  <option value="Promotional">Promotional</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Language</label>
                <input
                  type="text"
                  value={audienceCtx.language}
                  onChange={(e) => setAudienceCtx({ ...audienceCtx, language: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section C: Content Intent & Output Context */}
          <div className="glass-panel p-5 rounded-2xl space-y-3 border border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              C. Content Intent & Output Context
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Output Format</label>
                <select
                  value={contentCtx.outputType}
                  onChange={(e) => setContentCtx({ ...contentCtx, outputType: e.target.value as any })}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                >
                  <option value="briefing">Briefing Memo</option>
                  <option value="social">Social Media Post</option>
                  <option value="ppt">Presentation Outline</option>
                  <option value="script">Video Script</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Target Platform</label>
                <select
                  value={contentCtx.platform}
                  onChange={(e) => setContentCtx({ ...contentCtx, platform: e.target.value as any })}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                >
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Presentation">Presentation</option>
                  <option value="Internal Report">Internal Report</option>
                  <option value="Website">Website</option>
                  <option value="YouTube">YouTube</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Content Tone</label>
                <select
                  value={contentCtx.tone}
                  onChange={(e) => setContentCtx({ ...contentCtx, tone: e.target.value as any })}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                >
                  <option value="Professional">Professional</option>
                  <option value="Educational">Educational</option>
                  <option value="Engaging">Engaging</option>
                  <option value="Formal">Formal</option>
                  <option value="Concise">Concise</option>
                  <option value="Promotional">Promotional</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Content Intent</label>
                <select
                  value={intent === 'Custom Intent' ? 'Custom Intent' : contentCtx.intent}
                  onChange={(e) => {
                    const val = e.target.value;
                    setContentCtx({ ...contentCtx, intent: val });
                    setIntent(val as any);
                  }}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                >
                  <option value="Information">Information</option>
                  <option value="Promotion">Promotion</option>
                  <option value="Summary">Summary</option>
                  <option value="Presentation">Presentation</option>
                  <option value="Awareness">Awareness</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Section D File Upload & Pipeline Status */}
        <div className="lg:col-span-5 space-y-5">
          {/* Section D: Source Content / Multimodal File Upload */}
          <div className="glass-panel p-5 rounded-2xl space-y-3 border border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-sky-400" />
              D. Source Content / File Upload
            </h3>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                handleFileUpload(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                dragActive
                  ? 'border-indigo-400 bg-indigo-500/10'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
              }`}
            >
              <input
                type="file"
                id="generateFileInput"
                accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg,.mp4"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <label htmlFor="generateFileInput" className="cursor-pointer space-y-3 block">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">
                    {isProcessing ? 'Extracting multimodal content...' : 'Upload Project Source Content'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">PDF, DOCX, TXT, PNG, JPG, MP4</p>
                </div>
              </label>
            </div>

            {/* Document Active Preview */}
            {currentDoc ? (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-indigo-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5 truncate">
                    <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="truncate">{currentDoc.name}</span>
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase shrink-0 ${
                    currentDoc.status === 'processed'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {currentDoc.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Topic: {currentDoc.extractedInfo?.topic || 'Extracted Document'}</p>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 text-center py-1">No document uploaded yet. Upload a file above to activate generation.</p>
            )}
          </div>

          {/* Multi-Agent Progress Status */}
          <div className="glass-panel p-5 rounded-2xl space-y-4 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                E. Multi-Agent Progress
              </h3>
              <span className="text-[10px] font-mono text-slate-400">6 Modular Agents</span>
            </div>

            <div className="space-y-2">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                    agent.status === 'completed'
                      ? 'bg-slate-900/60 border-emerald-500/30'
                      : agent.status === 'running'
                      ? 'bg-indigo-950/60 border-indigo-500/60 animate-pulse'
                      : agent.status === 'error'
                      ? 'bg-rose-950/60 border-rose-500/60'
                      : 'bg-slate-900/30 border-slate-800 opacity-70'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    {agent.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : agent.status === 'running' ? (
                      <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : agent.status === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{agent.name}</p>
                      <p className="text-[10px] text-slate-400">{agent.lastLog || agent.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {generatedOutputs.length > 0 && (
              <button
                onClick={onProceedToOutputs}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Proceed to View Formats ({generatedOutputs.length}) →</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Save Project Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl space-y-5 border border-indigo-500/40 shadow-2xl relative">
            <button
              onClick={() => setIsSaveModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Save className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Save Permanent Project</h3>
                <p className="text-xs text-slate-400">Save current workflow parameters & outputs to Projects workspace</p>
              </div>
            </div>

            <form onSubmit={handleConfirmSaveProject} className="space-y-4 text-xs">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={saveProjName}
                  onChange={(e) => setSaveProjName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={saveProjDesc}
                  onChange={(e) => setSaveProjDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
                >
                  Confirm & Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
