import React, { useState } from 'react';
import type { AgentStatus, ApiSettings, AudienceContext, ContentContext, CreatorContext, DocumentItem, GeneratedOutput, PageType, TemporarySession } from '../types';
import { DEFAULT_AUDIENCE_CONTEXT, DEFAULT_CONTENT_CONTEXT, DEFAULT_CREATOR_CONTEXT } from '../services/sampleData';
import { processUploadedFile, extractStructuredInfoFromText } from '../services/documentProcessor';
import { runMultiAgentGeneration } from '../services/aiGenerator';
import { Clock, Upload, Sparkles, Save, ArrowRight, User, Users, Layers, FileText, CheckCircle2, AlertCircle, Play, X, ShieldCheck } from 'lucide-react';

interface TemporaryViewProps {
  temporarySession: TemporarySession | null;
  onUpdateTemporarySession: (session: TemporarySession) => void;
  onSaveAsProject: (tempSession: TemporarySession, projName: string, projDesc: string) => void;
  onContinueWithoutSaving: () => void;
  onNavigatePage: (page: PageType) => void;
  apiSettings: ApiSettings;
  agents: AgentStatus[];
  setAgents: React.Dispatch<React.SetStateAction<AgentStatus[]>>;
}

export const TemporaryView: React.FC<TemporaryViewProps> = ({
  temporarySession,
  onUpdateTemporarySession,
  onSaveAsProject,
  onContinueWithoutSaving,
  onNavigatePage,
  apiSettings,
  agents,
  setAgents
}) => {
  // Form State
  const [creatorCtx, setCreatorCtx] = useState<CreatorContext>(temporarySession?.creatorContext || DEFAULT_CREATOR_CONTEXT);
  const [audienceCtx, setAudienceCtx] = useState<AudienceContext>(temporarySession?.audienceContext || DEFAULT_AUDIENCE_CONTEXT);
  const [contentCtx, setContentCtx] = useState<ContentContext>(temporarySession?.contentContext || DEFAULT_CONTENT_CONTEXT);

  const [document, setDocument] = useState<DocumentItem | null>(temporarySession?.document || null);
  const [outputs, setOutputs] = useState<GeneratedOutput[]>(temporarySession?.outputs || []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Save Modal State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveProjName, setSaveProjName] = useState('');
  const [saveProjDesc, setSaveProjDesc] = useState('');

  // 24-hour expiration calculation
  const expiresAt = temporarySession?.expiresAt || (Date.now() + 24 * 60 * 60 * 1000);
  const hoursRemaining = Math.max(0, Math.floor((expiresAt - Date.now()) / (1000 * 60 * 60)));

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsProcessing(true);

    try {
      const { text, fileType } = await processUploadedFile(file);
      const extractedInfo = extractStructuredInfoFromText(text, fileType);

      const newTempDoc: DocumentItem = {
        id: `doc-temp-${Date.now()}`,
        projectId: 'temp-session',
        name: file.name,
        fileType,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        uploadTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'processed',
        rawText: text,
        extractedInfo
      };

      setDocument(newTempDoc);

      // Run generation pipeline on temporary doc
      const updateAgentStep = (agentId: number, status: 'running' | 'completed' | 'error', log: string) => {
        setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status, lastLog: log } : a));
      };

      const generated = await runMultiAgentGeneration(
        newTempDoc,
        audienceCtx.audienceType === 'Other' ? (audienceCtx.customAudienceType || 'Target Audience') : (audienceCtx.audienceType as any),
        contentCtx.intent as any,
        apiSettings,
        updateAgentStep
      );

      setOutputs(generated);

      const updatedSession: TemporarySession = {
        id: temporarySession?.id || `temp-${Date.now()}`,
        createdAt: temporarySession?.createdAt || Date.now(),
        expiresAt: expiresAt,
        creatorContext: creatorCtx,
        audienceContext: audienceCtx,
        contentContext: contentCtx,
        document: newTempDoc,
        outputs: generated,
        claims: []
      };

      onUpdateTemporarySession(updatedSession);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveClick = () => {
    if (!document) return;
    setSaveProjName(`Project - ${document.extractedInfo.topic || 'Analysis'}`);
    setSaveProjDesc(`Converted from Temporary Analysis session created on ${new Date().toLocaleDateString()}`);
    setIsSaveModalOpen(true);
  };

  const handleConfirmSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveProjName.trim()) return;

    const sessionToSave: TemporarySession = {
      id: temporarySession?.id || `temp-${Date.now()}`,
      createdAt: temporarySession?.createdAt || Date.now(),
      expiresAt: expiresAt,
      creatorContext: creatorCtx,
      audienceContext: audienceCtx,
      contentContext: contentCtx,
      document,
      outputs,
      claims: []
    };

    onSaveAsProject(sessionToSave, saveProjName, saveProjDesc);
    setIsSaveModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 24-Hour Expiration Warning Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between gap-3 text-xs text-amber-200">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
          <div>
            <p className="font-bold text-amber-300">⏰ Temporary Analysis Session</p>
            <p className="text-[11px] text-amber-200/90 mt-0.5">
              This session and uploaded temporary files will automatically expire in <span className="font-bold underline">{hoursRemaining} hours</span> unless saved.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveClick}
          disabled={!document}
          className={`px-4 py-2 rounded-xl font-bold text-xs shadow-md transition flex items-center space-x-1.5 cursor-pointer ${
            !document ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save for Project</span>
        </button>
      </div>

      {/* Grid: Context & Upload Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Temporary Context Parameters */}
        <div className="lg:col-span-7 space-y-5">
          {/* Creator Context */}
          <div className="glass-panel p-5 rounded-2xl space-y-3 border border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-sky-400" />
              A. Creator / User Context
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">User Type</label>
                <select
                  value={creatorCtx.creatorType}
                  onChange={(e) => setCreatorCtx({ ...creatorCtx, creatorType: e.target.value as any })}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                >
                  <option value="Student">Student</option>
                  <option value="Working Professional">Working Professional</option>
                  <option value="Researcher">Researcher</option>
                  <option value="Faculty/Educator">Faculty / Educator</option>
                  <option value="Entrepreneur">Entrepreneur</option>
                  <option value="Organization/Team">Organization / Team</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Domain</label>
                <select
                  value={creatorCtx.domain}
                  onChange={(e) => setCreatorCtx({ ...creatorCtx, domain: e.target.value as any })}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="AI/ML">AI / ML</option>
                  <option value="Business">Business</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
            </div>
          </div>

          {/* Target Audience */}
          <div className="glass-panel p-5 rounded-2xl space-y-3 border border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              B. Target Audience Context
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Audience Type</label>
                <select
                  value={audienceCtx.audienceType}
                  onChange={(e) => setAudienceCtx({ ...audienceCtx, audienceType: e.target.value as any })}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                >
                  <option value="Students">Students</option>
                  <option value="Working Professionals">Working Professionals</option>
                  <option value="Management">Management</option>
                  <option value="Developers">Developers</option>
                  <option value="General Public">General Public</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Communication Style</label>
                <select
                  value={audienceCtx.communicationStyle}
                  onChange={(e) => setAudienceCtx({ ...audienceCtx, communicationStyle: e.target.value as any })}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                >
                  <option value="Simple">Simple</option>
                  <option value="Professional">Professional</option>
                  <option value="Technical">Technical</option>
                  <option value="Conversational">Conversational</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content Intent & Channel */}
          <div className="glass-panel p-5 rounded-2xl space-y-3 border border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              C. Content Intent & Output Context
            </h3>

            <div className="grid grid-cols-3 gap-3 text-xs">
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
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Channel / Platform</label>
                <select
                  value={contentCtx.platform}
                  onChange={(e) => setContentCtx({ ...contentCtx, platform: e.target.value as any })}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                >
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Presentation">Presentation</option>
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
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): File Upload & Analysis Preview */}
        <div className="lg:col-span-5 space-y-5">
          {/* Multimodal File Upload */}
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
              id="tempFileInput"
              accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg,.mp4"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            <label htmlFor="tempFileInput" className="cursor-pointer space-y-3 block">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  {isProcessing ? 'Processing temporary content...' : 'Upload Temporary Source File'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">PDF, DOCX, TXT, PNG/JPG, MP4</p>
              </div>
            </label>
          </div>

          {/* Document Preview if uploaded */}
          {document && (
            <div className="glass-panel p-4 rounded-2xl space-y-3 border border-indigo-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-sky-400" />
                  {document.name}
                </span>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded uppercase">
                  Temporary
                </span>
              </div>
              <p className="text-xs text-slate-300">Topic: {document.extractedInfo.topic}</p>
              <p className="text-[10px] text-slate-400">Turnout: {document.extractedInfo.participants} • Date: {document.extractedInfo.date}</p>
            </div>
          )}

          {/* Outputs Summary if generated */}
          {outputs.length > 0 && (
            <div className="glass-panel p-4 rounded-2xl space-y-2.5 border border-slate-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Generated Temporary Formats ({outputs.length})
              </h4>
              {outputs.map(out => (
                <div key={out.id} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{out.title}</span>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-400 rounded">
                    ✓ Grounded
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar: Save for Project OR Continue Without Saving */}
      <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">Temporary Session Decision</h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Save this analysis as a permanent project or continue without creating a project.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Non-destructive Option */}
          <button
            onClick={onContinueWithoutSaving}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            Okay, Continue Without Saving
          </button>

          {/* Primary Action */}
          <button
            onClick={handleSaveClick}
            disabled={!document}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition flex items-center space-x-2 cursor-pointer ${
              !document
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Save for Project</span>
          </button>
        </div>
      </div>

      {/* Save Project Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl space-y-5 border border-emerald-500/40 shadow-2xl relative">
            <button
              onClick={() => setIsSaveModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Save className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Save Temporary Session as Project</h3>
                <p className="text-xs text-slate-400">Convert current temporary files & outputs into a permanent project</p>
              </div>
            </div>

            <form onSubmit={handleConfirmSave} className="space-y-4 text-xs">
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
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
