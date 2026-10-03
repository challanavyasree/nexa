import React from 'react';
import type { DocumentItem, GeneratedOutput, PageType, VerificationClaim } from '../types';
import { FileText, Sparkles, ShieldCheck, AlertTriangle, ArrowRight, Zap, Play, CheckCircle2, Clock } from 'lucide-react';

interface DashboardViewProps {
  documents: DocumentItem[];
  outputs: GeneratedOutput[];
  claims: VerificationClaim[];
  onStartNewAnalysis: () => void;
  onLoadDemoDoc: () => void;
  onNavigatePage: (page: PageType) => void;
  onSelectDocument: (doc: DocumentItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  documents,
  outputs,
  claims,
  onStartNewAnalysis,
  onLoadDemoDoc,
  onNavigatePage,
  onSelectDocument
}) => {
  const verifiedClaimsCount = claims.filter(c => c.status === 'verified').length;
  const mismatchCount = claims.filter(c => c.status === 'mismatch').length;

  const workflowSequence = [
    { label: 'Understand', icon: FileText, page: 'documents' as PageType, desc: 'Extracted Entities' },
    { label: 'Analyze', icon: ArrowRight, page: 'generate' as PageType, desc: 'Audience & Intent' },
    { label: 'Retrieve', icon: Sparkles, page: 'generate' as PageType, desc: 'RAG Evidence' },
    { label: 'Generate', icon: Sparkles, page: 'outputs' as PageType, desc: '4 Output Formats' },
    { label: 'Verify', icon: ShieldCheck, page: 'verification' as PageType, desc: 'Claim Check' },
    { label: 'Review', icon: CheckCircle2, page: 'review' as PageType, desc: 'Human Approval' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-indigo-900/40 via-slate-900 to-sky-950/40 border border-indigo-500/20 p-6 overflow-hidden shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Multimodal Source-Grounded Multi-Agent RAG</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              AI Content Intelligence Dashboard
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
              Process multimodal inputs (PDF, text, image, video), analyze intent & target audience, retrieve source grounded evidence, generate 4 controlled formats, verify consistency, and present for human supervisor review.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onStartNewAnalysis}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start New Analysis</span>
            </button>

            <button
              onClick={onLoadDemoDoc}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Load Demo Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Metric Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigatePage('documents')}
          className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Documents Processed</span>
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{documents.length}</span>
            <span className="text-xs text-sky-400 font-medium">Multimodal</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">PDF, Text, Image OCR, Video</p>
        </div>

        <div
          onClick={() => onNavigatePage('outputs')}
          className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Content Generated</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{outputs.length}</span>
            <span className="text-xs text-indigo-400 font-medium">4 Formats</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Briefings, Social, PPT & Scripts</p>
        </div>

        <div
          onClick={() => onNavigatePage('verification')}
          className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Claims Verified</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{verifiedClaimsCount}</span>
            <span className="text-xs text-emerald-400 font-medium">Source Grounded</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Cross-checked vs source text</p>
        </div>

        <div
          onClick={() => onNavigatePage('verification')}
          className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Issues Detected</span>
            <div className={`p-2.5 rounded-xl border ${mismatchCount > 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{mismatchCount}</span>
            <span className={`text-xs font-medium ${mismatchCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {mismatchCount > 0 ? 'Needs Verification' : 'Clean'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">{mismatchCount > 0 ? 'Potential factual mismatches' : 'No hallucination detected'}</p>
        </div>
      </div>

      {/* Main Visual Workflow Pipeline Sequence */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              Complete Core Workflow Sequence
            </h3>
            <p className="text-xs text-slate-400">Understand → Analyze → Retrieve → Generate → Verify → Review</p>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg">
            Multi-Agent Active
          </span>
        </div>

        {/* Workflow Diagram */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {workflowSequence.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.label}
                onClick={() => onNavigatePage(step.page)}
                className="group relative flex flex-col items-center text-center p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-300 mb-2 group-hover:scale-110 group-hover:border-indigo-400 transition-all">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-white tracking-wider">{step.label}</span>
                <span className="text-[10px] text-slate-400 mt-1">{step.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Recent Documents & Recent Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents Card */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              Source Documents ({documents.length})
            </h3>
            <button
              onClick={() => onNavigatePage('documents')}
              className="text-xs text-sky-400 hover:underline font-medium cursor-pointer"
            >
              View All Documents →
            </button>
          </div>

          <div className="space-y-2.5">
            {documents.slice(0, 4).map((doc) => (
              <div
                key={doc.id}
                onClick={() => {
                  onSelectDocument(doc);
                  onNavigatePage('documents');
                }}
                className="p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800/80 flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-950 text-sky-400 border border-sky-800/50 flex items-center justify-center font-bold text-[10px] uppercase">
                    {doc.fileType}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      {doc.name}
                      {doc.isDemo && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                          Demo Data
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400">{doc.extractedInfo.topic}</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                  ✓ Grounded
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Generated Outputs Card */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Recent Outputs ({outputs.length})
            </h3>
            <button
              onClick={() => onNavigatePage('outputs')}
              className="text-xs text-indigo-400 hover:underline font-medium cursor-pointer"
            >
              View Outputs →
            </button>
          </div>

          <div className="space-y-2.5">
            {outputs.slice(0, 4).map((out) => (
              <div
                key={out.id}
                onClick={() => onNavigatePage('review')}
                className="p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800/80 flex items-center justify-between cursor-pointer transition-all"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-200">{out.title}</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-900/60 text-indigo-300 rounded border border-indigo-700/50 uppercase">
                      {out.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Target: {out.audience} | Intent: {out.intent}
                  </p>
                </div>

                <div>
                  {out.humanStatus === 'approved' ? (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Approved
                    </span>
                  ) : out.humanStatus === 'rejected' ? (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-md">
                      ✕ Rejected
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
