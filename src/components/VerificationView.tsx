import React, { useState } from 'react';
import type { GeneratedOutput, VerificationClaim } from '../types';
import { ShieldCheck, AlertTriangle, CheckCircle2, Search, FileText, ShieldAlert, Zap, Clock, Quote } from 'lucide-react';

interface VerificationViewProps {
  claims: VerificationClaim[];
  outputs: GeneratedOutput[];
  onProceedToReview: () => void;
  onInjectDemoMismatch: () => void;
}

export const VerificationView: React.FC<VerificationViewProps> = ({
  claims,
  outputs,
  onProceedToReview,
  onInjectDemoMismatch
}) => {
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(claims[0]?.id || null);

  const totalClaims = claims.length;
  const verifiedCount = claims.filter(c => c.status === 'verified').length;
  const mismatchCount = claims.filter(c => c.status === 'mismatch').length;
  const reviewNeededCount = claims.filter(c => c.status === 'needs_review').length;
  const groundingScore = totalClaims > 0 ? Math.round((verifiedCount / totalClaims) * 100) : 100;

  const selectedClaim = claims.find(c => c.id === selectedClaimId) || claims[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Review CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Consistency Verification & Source Grounding Matrix
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Agent 5 cross-checks generated numerical & factual claims against raw source evidence.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onInjectDemoMismatch}
            className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer"
            title="Inject hallucinated 500 students claim to test verification warning"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Inconsistency Detection</span>
          </button>

          <button
            onClick={onProceedToReview}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold shadow-lg transition flex items-center space-x-2 cursor-pointer"
          >
            <span>Proceed to Human Review →</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between border border-slate-800">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Claims Checked</p>
            <p className="text-xl font-bold text-white mt-0.5">{totalClaims}</p>
          </div>
          <Search className="w-5 h-5 text-slate-500" />
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center justify-between border border-emerald-500/30">
          <div>
            <p className="text-[10px] font-bold text-emerald-400 uppercase">Verified Claims</p>
            <p className="text-xl font-bold text-emerald-300 mt-0.5">{verifiedCount}</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>

        <div className={`glass-panel p-4 rounded-xl flex items-center justify-between border ${mismatchCount > 0 ? 'border-rose-500/40 bg-rose-950/20' : 'border-slate-800'}`}>
          <div>
            <p className={`text-[10px] font-bold uppercase ${mismatchCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>Potential Mismatches</p>
            <p className="text-xl font-bold text-white mt-0.5">{mismatchCount}</p>
          </div>
          <AlertTriangle className={`w-5 h-5 ${mismatchCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center justify-between border border-amber-500/30">
          <div>
            <p className="text-[10px] font-bold text-amber-400 uppercase">Requiring Review</p>
            <p className="text-xl font-bold text-amber-300 mt-0.5">{reviewNeededCount}</p>
          </div>
          <Clock className="w-5 h-5 text-amber-400" />
        </div>
      </div>

      {/* Grid: Left Verification Matrix Table | Right Traceable Evidence Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Claims Matrix */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-5 rounded-2xl space-y-4 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                Claim Verification Matrix
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Agent 5 Consistency Engine</span>
            </div>

            <div className="space-y-3">
              {claims.map((claim) => {
                const isSelected = selectedClaim?.id === claim.id;
                return (
                  <div
                    key={claim.id}
                    onClick={() => setSelectedClaimId(claim.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected ? 'ring-2 ring-indigo-500 bg-slate-900/80' : 'bg-slate-900/40 hover:bg-slate-900/60'
                    } ${
                      claim.status === 'verified'
                        ? 'border-emerald-500/30'
                        : claim.status === 'needs_review'
                        ? 'border-amber-500/40 bg-amber-950/20'
                        : 'border-rose-500/50 bg-rose-950/30'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        {claim.status === 'verified' && (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ✓ VERIFIED
                          </span>
                        )}
                        {claim.status === 'needs_review' && (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            ⚠ NEEDS REVIEW
                          </span>
                        )}
                        {claim.status === 'mismatch' && (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-rose-500/30 text-rose-300 border border-rose-500/60 rounded flex items-center gap-1 animate-pulse">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                            ✕ POSSIBLE MISMATCH
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-slate-300">{claim.outputTitle}</span>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">
                        Confidence: <span className="font-bold text-slate-200">{(claim.confidence * 100).toFixed(0)}%</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 font-medium">{claim.claimText}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Traceable Evidence Inspector */}
        {selectedClaim && (
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-panel p-5 rounded-2xl space-y-4 border border-indigo-500/30 sticky top-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Quote className="w-4 h-4 text-sky-400" />
                  Traceable Evidence Panel
                </h3>
                <span className="text-[10px] text-indigo-400 font-bold">Source Grounding</span>
              </div>

              {/* Selected Claim Box */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[9px] font-bold uppercase text-slate-400">Target Claim</span>
                <p className="text-xs font-semibold text-white">{selectedClaim.claimText}</p>
              </div>

              {/* Source Document Trace */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[9px] font-bold uppercase text-slate-400">Source Document Citation</span>
                <p className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  {selectedClaim.sourceDoc}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Location: {selectedClaim.page ? `Page ${selectedClaim.page}` : 'Source document evidence'}
                </p>
              </div>

              {/* Relevant Evidence Quote */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[9px] font-bold uppercase text-emerald-400">Verified Evidence Quote</span>
                <p className="text-xs text-slate-200 italic font-serif">"{selectedClaim.evidenceQuote}"</p>
              </div>

              {/* Value Comparison */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold">Generated Value</span>
                  <p className="font-mono text-slate-200 mt-0.5">{selectedClaim.generatedValue || 'N/A'}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold">Source Fact</span>
                  <p className="font-mono text-emerald-400 mt-0.5">{selectedClaim.sourceValue || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
