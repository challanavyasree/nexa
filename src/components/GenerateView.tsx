import React, { useState } from 'react';
import type { AgentStatus, ApiSettings, DocumentItem, GeneratedOutput, IntentType, TargetAudience } from '../types';
import { runMultiAgentGeneration } from '../services/aiGenerator';
import { retrieveRelevantEvidence, splitDocumentIntoChunks } from '../services/ragEngine';
import { Sparkles, Users, Target, CheckCircle2, Play, Cpu, Quote, Edit3 } from 'lucide-react';

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
  apiSettings
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const audiences: { id: TargetAudience; label: string; desc: string; icon: string }[] = [
    { id: 'Students', label: 'Students', desc: 'Energetic, relatable & action-oriented', icon: '🎓' },
    { id: 'Management', label: 'Management', desc: 'Strategic, concise & ROI focused', icon: '💼' },
    { id: 'Professionals', label: 'Professionals', desc: 'Industry tone, tech depth & metrics', icon: '👔' },
    { id: 'General Public', label: 'General Public', desc: 'Accessible, engaging & simple terms', icon: '🌐' },
    { id: 'Custom Audience', label: 'Custom Audience', desc: 'Define custom target persona', icon: '✏️' }
  ];

  const intents: { id: IntentType; label: string; desc: string; icon: string }[] = [
    { id: 'Promotion', label: 'Promotion', desc: 'Call to action, high energy & hype', icon: '🚀' },
    { id: 'Information', label: 'Information', desc: 'Factual & structured breakdown', icon: 'ℹ️' },
    { id: 'Summary', label: 'Summary', desc: 'High-level executive takeaways', icon: '📋' },
    { id: 'Presentation', label: 'Presentation', desc: 'Bullet points & slide deck structure', icon: '📊' },
    { id: 'Awareness', label: 'Awareness', desc: 'Educational & community outreach', icon: '📢' },
    { id: 'Custom Intent', label: 'Custom Intent', desc: 'Specify custom strategic goal', icon: '✨' }
  ];

  const chunks = activeDocument ? splitDocumentIntoChunks(activeDocument.rawText) : [];
  const effectiveQuery = `${targetAudience === 'Custom Audience' ? customAudienceText : targetAudience} ${intent === 'Custom Intent' ? customIntentText : intent}`;
  const retrievedEvidence = activeDocument
    ? retrieveRelevantEvidence(chunks, effectiveQuery, activeDocument.name)
    : [];

  const handleStartGeneration = async () => {
    if (!activeDocument) return;
    setIsGenerating(true);

    const updateAgentStep = (agentId: number, status: 'running' | 'completed' | 'error', log: string) => {
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status, lastLog: log } : a));
    };

    try {
      const newOutputs = await runMultiAgentGeneration(
        activeDocument,
        targetAudience,
        intent,
        apiSettings,
        updateAgentStep
      );
      onOutputsGenerated(newOutputs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!activeDocument) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto space-y-4">
        <Sparkles className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">No Active Document Selected</h3>
        <p className="text-xs text-slate-400">Please upload a document or click "Load Demo Data".</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Source-Grounded Generation & Multi-Agent Engine
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Select or enter custom target audience and intent. The 6-Agent RAG pipeline generates 4 controlled formats grounded in source evidence.
          </p>
        </div>

        <button
          onClick={handleStartGeneration}
          disabled={isGenerating}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center space-x-2 cursor-pointer ${
            isGenerating
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white shadow-indigo-500/25'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
              <span>Multi-Agent Engine Running...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Generate 4 Controlled Formats</span>
            </>
          )}
        </button>
      </div>

      {/* Grid: Left Controls (Audience & Intent) | Right RAG & Multi-Agent Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Audience & Intent Selector */}
        <div className="lg:col-span-7 space-y-6">
          {/* Target Audience Selector */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                Target Audience
              </h3>
              <span className="text-[10px] text-slate-400">Current: {targetAudience}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {audiences.map((aud) => {
                const isSelected = targetAudience === aud.id;
                return (
                  <div
                    key={aud.id}
                    onClick={() => setTargetAudience(aud.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-900/60 to-slate-900 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-lg">{aud.icon}</span>
                      <div>
                        <p className="text-xs font-bold">{aud.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{aud.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {targetAudience === 'Custom Audience' && (
              <div className="pt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Specify Custom Audience Persona</label>
                <div className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-xl border border-indigo-500/40">
                  <Edit3 className="w-4 h-4 text-indigo-400" />
                  <input
                    type="text"
                    value={customAudienceText}
                    onChange={(e) => setCustomAudienceText(e.target.value)}
                    placeholder="e.g. Angel Investors / Tech Journalists / High School Students"
                    className="bg-transparent text-xs text-slate-200 outline-none w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Intent Selector */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Content Intent
              </h3>
              <span className="text-[10px] text-slate-400">Current: {intent}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {intents.map((int) => {
                const isSelected = intent === int.id;
                return (
                  <div
                    key={int.id}
                    onClick={() => setIntent(int.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-sky-900/60 to-slate-900 border-sky-500 text-white shadow-md'
                        : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-base">{int.icon}</span>
                      <div>
                        <p className="text-xs font-bold">{int.label}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{int.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {intent === 'Custom Intent' && (
              <div className="pt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Specify Custom Content Goal</label>
                <div className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-xl border border-sky-500/40">
                  <Edit3 className="w-4 h-4 text-sky-400" />
                  <input
                    type="text"
                    value={customIntentText}
                    onChange={(e) => setCustomIntentText(e.target.value)}
                    placeholder="e.g. Drive registration sign-ups / Explain technical whitepaper"
                    className="bg-transparent text-xs text-slate-200 outline-none w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Multi-Agent & RAG Evidence */}
        <div className="lg:col-span-5 space-y-6">
          {/* Multi-Agent Execution Pipeline Status */}
          <div className="glass-panel p-5 rounded-2xl space-y-4 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Multi-Agent Progress
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
                      : 'bg-slate-900/30 border-slate-800 opacity-70'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    {agent.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : agent.status === 'running' ? (
                      <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0" />
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

            <button
              onClick={onProceedToOutputs}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>View Generated Outputs →</span>
            </button>
          </div>

          {/* RAG Source Evidence Chunks */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Quote className="w-4 h-4 text-sky-400" />
              Retrieved Source Evidence (RAG)
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {retrievedEvidence.map((ev, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Source: {ev.sourceDoc} (Page {ev.page || 1})</span>
                    <span className="text-emerald-400 font-bold">{(ev.confidence * 100).toFixed(0)}% Match</span>
                  </div>
                  <p className="text-slate-300 italic">"{ev.evidenceText}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
