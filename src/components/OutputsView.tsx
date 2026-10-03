import React, { useState } from 'react';
import type { GeneratedOutput, OutputType } from '../types';
import { Layers, Copy, Check, Edit3, Save, RefreshCw, ShieldCheck, AlertTriangle, AlertCircle, Quote } from 'lucide-react';

interface OutputsViewProps {
  outputs: GeneratedOutput[];
  onUpdateOutput: (updated: GeneratedOutput) => void;
  onProceedToVerification: () => void;
  onRegenerateOutput: (outputId: string) => void;
}

export const OutputsView: React.FC<OutputsViewProps> = ({
  outputs,
  onUpdateOutput,
  onProceedToVerification,
  onRegenerateOutput
}) => {
  const [activeTab, setActiveTab] = React.useState<OutputType>(() => outputs[0]?.type || 'briefing');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');

  React.useEffect(() => {
    if (outputs && outputs.length > 0) {
      setActiveTab(outputs[0].type);
    }
  }, [outputs]);

  const currentOutput = outputs.find(o => o.type === activeTab) || outputs[0];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartEdit = (output: GeneratedOutput) => {
    setEditingId(output.id);
    setEditContent(output.content);
  };

  const handleSaveEdit = (output: GeneratedOutput) => {
    onUpdateOutput({
      ...output,
      content: editContent,
      humanStatus: 'edited',
      auditTrail: [
        ...output.auditTrail,
        { action: 'Edited by user', timestamp: new Date().toLocaleTimeString() }
      ]
    });
    setEditingId(null);
  };

  const handleInjectInconsistency = (output: GeneratedOutput) => {
    const isAlreadyInjected = output.inconsistencyFlag;
    let modifiedContent = output.content;

    if (!isAlreadyInjected) {
      modifiedContent = output.content.replace(/300 students/gi, '500 students');
      onUpdateOutput({
        ...output,
        content: modifiedContent,
        verificationStatus: 'mismatch',
        inconsistencyFlag: true,
        inconsistencyDetail: {
          sourceValue: '300 students',
          generatedValue: '500 students',
          description: 'Document states 300 students, but content generated 500 students.'
        },
        auditTrail: [
          ...output.auditTrail,
          { action: 'Demo: Inconsistency Hallucination Injected (500 students)', timestamp: new Date().toLocaleTimeString() }
        ]
      });
    } else {
      modifiedContent = output.content.replace(/500 students/gi, '300 students');
      onUpdateOutput({
        ...output,
        content: modifiedContent,
        verificationStatus: 'verified',
        inconsistencyFlag: false,
        inconsistencyDetail: undefined,
        auditTrail: [
          ...output.auditTrail,
          { action: 'Demo: Restored exact factual value (300 students)', timestamp: new Date().toLocaleTimeString() }
        ]
      });
    }
  };

  const tabs: { id: OutputType; label: string; icon: string }[] = [
    { id: 'briefing', label: '1. Briefing', icon: '📄' },
    { id: 'social', label: '2. Social Media Post', icon: '📱' },
    { id: 'ppt', label: '3. PPT Outline', icon: '📊' },
    { id: 'script', label: '4. Video Script', icon: '🎬' }
  ];

  if (!outputs || outputs.length === 0) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto space-y-4">
        <Layers className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">No Generated Outputs Yet</h3>
        <p className="text-xs text-slate-400">Please run the generation pipeline from the Generate tab.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Controlled Content Outputs (4 Formats)
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Review, edit, copy, or regenerate your Briefing, Social Media Post, PPT Outline, and Video Script.
          </p>
        </div>

        <button
          onClick={onProceedToVerification}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Run Consistency Verification →</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const outputForTab = outputs.find(o => o.type === tab.id);
          const isActive = activeTab === tab.id;
          const isMismatch = outputForTab?.verificationStatus === 'mismatch';

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {isMismatch && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Active Format Card */}
      {currentOutput && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Main Output Area (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800 relative">
              {/* Header inside Card */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">{currentOutput.title}</h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded uppercase">
                      {currentOutput.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Target: <span className="text-slate-200 font-semibold">{currentOutput.audience}</span> | Platform/Channel: <span className="text-slate-200 font-semibold">{currentOutput.platform}</span> | Tone: <span className="text-slate-200 font-semibold">{currentOutput.tone}</span> | Intent: <span className="text-slate-200 font-semibold">{currentOutput.intent}</span>
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex items-center space-x-2">
                  {currentOutput.verificationStatus === 'mismatch' ? (
                    <span className="px-2.5 py-1 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      Inconsistency Detected
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Verified Source Grounding
                    </span>
                  )}
                </div>
              </div>

              {/* Inconsistency Warning Alert (If Injected) */}
              {currentOutput.inconsistencyFlag && (
                <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-xs text-amber-200 flex items-start space-x-3">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-300">⚠️ Hackathon Demo: Hallucination Flagged</p>
                    <p className="text-[11px] text-amber-200/90 mt-0.5">
                      Source document states <span className="underline font-bold">300 students</span>, but generated claim modified value to <span className="underline font-bold">500 students</span>. Verification agent caught this error.
                    </p>
                  </div>
                </div>
              )}

              {/* Content Body Editor or Display */}
              {editingId === currentOutput.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={12}
                    className="w-full p-4 rounded-xl bg-slate-950 border border-indigo-500/50 text-xs font-mono text-slate-200 outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(currentOutput)}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Content</span>
                    </button>
                  </div>
                </div>
              ) : (
                <pre className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed min-h-[220px]">
                  {currentOutput.content}
                </pre>
              )}

              {/* Action Toolbar Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <div className="flex items-center space-x-2">
                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopy(currentOutput.id, currentOutput.content)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    {copiedId === currentOutput.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleStartEdit(currentOutput)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Inline</span>
                  </button>

                  {/* Regenerate Button */}
                  <button
                    onClick={() => onRegenerateOutput(currentOutput.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                  </button>
                </div>

                {/* Demo Feature: Inconsistency Injection Toggle */}
                <button
                  onClick={() => handleInjectInconsistency(currentOutput)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center space-x-1.5 cursor-pointer ${
                    currentOutput.inconsistencyFlag
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-amber-300 hover:border-amber-500/30'
                  }`}
                  title="Test Verification Agent by injecting a false claim (500 students)"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>{currentOutput.inconsistencyFlag ? 'Restore Original Fact' : 'Simulate Hallucination'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Traceable Evidence Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel p-5 rounded-2xl space-y-4 border border-slate-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Quote className="w-4 h-4 text-sky-400" />
                Traceable Source Evidence
              </h4>

              <div className="space-y-3">
                {currentOutput.sourceEvidence.map((ev, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="text-sky-300 font-semibold">{ev.sourceDoc}</span>
                      <span>Page {ev.page || 1}</span>
                    </div>
                    <p className="text-slate-200 italic font-serif">"{ev.evidenceText}"</p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px]">
                      <span className="text-emerald-400 font-bold">✓ Grounded</span>
                      <span className="text-slate-400 font-mono">{(ev.confidence * 100).toFixed(0)}% Confidence</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
