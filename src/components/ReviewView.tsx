import React, { useState } from 'react';
import type { GeneratedOutput } from '../types';
import confetti from 'canvas-confetti';
import { UserCheck, CheckCircle2, Edit3, XCircle, ShieldCheck, AlertTriangle, Save, Clock, History } from 'lucide-react';

interface ReviewViewProps {
  outputs: GeneratedOutput[];
  onUpdateOutput: (updated: GeneratedOutput) => void;
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  outputs,
  onUpdateOutput
}) => {
  const [selectedOutputId, setSelectedOutputId] = useState<string>(outputs[0]?.id || '');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');

  const currentOutput = outputs.find(o => o.id === selectedOutputId) || outputs[0];

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Fallback
    }
  };

  const handleApprove = (output: GeneratedOutput) => {
    onUpdateOutput({
      ...output,
      humanStatus: 'approved',
      auditTrail: [
        ...output.auditTrail,
        { action: 'Human Approved by Chief Verifier', timestamp: new Date().toLocaleTimeString(), user: 'Hackathon Reviewer' }
      ]
    });
    triggerConfetti();
  };

  const handleReject = (output: GeneratedOutput) => {
    onUpdateOutput({
      ...output,
      humanStatus: 'rejected',
      auditTrail: [
        ...output.auditTrail,
        { action: 'Human Rejected for regeneration', timestamp: new Date().toLocaleTimeString(), user: 'Hackathon Reviewer' }
      ]
    });
  };

  const handleSaveEdit = (output: GeneratedOutput) => {
    onUpdateOutput({
      ...output,
      content: editContent,
      humanStatus: 'approved',
      auditTrail: [
        ...output.auditTrail,
        { action: 'Edited & Approved by Human Reviewer', timestamp: new Date().toLocaleTimeString(), user: 'Hackathon Reviewer' }
      ]
    });
    setEditingId(null);
    triggerConfetti();
  };

  if (!outputs || outputs.length === 0) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto space-y-4">
        <UserCheck className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">No Outputs Ready for Review</h3>
        <p className="text-xs text-slate-400">Please generate content first.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            Human Supervisor Review Dashboard
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Human-in-the-Loop decision hub. Inspect claims, source evidence, verify consistency, and approve, edit, or reject content.
          </p>
        </div>
      </div>

      {/* Grid: Left Select List | Right Review Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Outputs Review Queue */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
            Review Queue ({outputs.length})
          </h3>

          <div className="space-y-2.5">
            {outputs.map((out) => {
              const isSelected = currentOutput?.id === out.id;
              return (
                <div
                  key={out.id}
                  onClick={() => setSelectedOutputId(out.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-900/60 to-slate-900 border-indigo-500 shadow-md'
                      : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[170px]">{out.title}</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30 uppercase">
                      {out.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Audience: {out.audience}</span>

                    {out.humanStatus === 'approved' ? (
                      <span className="px-2 py-0.5 font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ✓ Approved
                      </span>
                    ) : out.humanStatus === 'rejected' ? (
                      <span className="px-2 py-0.5 font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-rose-400" />
                        ✕ Rejected
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (8 cols): Main Review Card & Decisions */}
        {currentOutput && (
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-panel p-6 rounded-2xl space-y-5 border border-slate-800">
              {/* Header inside Review Card */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {currentOutput.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Target: <span className="text-slate-200">{currentOutput.audience}</span> | Intent: <span className="text-slate-200">{currentOutput.intent}</span>
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex items-center space-x-2">
                  {currentOutput.verificationStatus === 'mismatch' ? (
                    <span className="px-3 py-1 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg flex items-center gap-1.5 animate-pulse">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Inconsistency Warning
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Grounded Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Editable or Display View */}
              {editingId === currentOutput.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={10}
                    className="w-full p-4 rounded-xl bg-slate-950 border border-indigo-500/60 text-xs font-mono text-slate-200 outline-none focus:ring-1 focus:ring-indigo-400"
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
                      <span>Save & Approve Content</span>
                    </button>
                  </div>
                </div>
              ) : (
                <pre className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed min-h-[200px]">
                  {currentOutput.content}
                </pre>
              )}

              {/* Decision Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <div className="flex items-center space-x-3">
                  {/* Approve */}
                  <button
                    onClick={() => handleApprove(currentOutput)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>[ APPROVE ]</span>
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => {
                      setEditingId(currentOutput.id);
                      setEditContent(currentOutput.content);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-2 transition cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 text-sky-400" />
                    <span>[ EDIT ]</span>
                  </button>

                  {/* Reject */}
                  <button
                    onClick={() => handleReject(currentOutput)}
                    className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center space-x-2 transition cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>[ REJECT ]</span>
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-400">Decision: </span>
                  <span className={`text-xs font-bold ${
                    currentOutput.humanStatus === 'approved' ? 'text-emerald-400' :
                    currentOutput.humanStatus === 'rejected' ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {currentOutput.humanStatus === 'approved' ? '✓ Human Approved' :
                     currentOutput.humanStatus === 'rejected' ? '✕ Rejected' : 'Pending Review'}
                  </span>
                </div>
              </div>

              {/* Audit Trail Log */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-indigo-400" />
                  Audit Trail & Version History
                </h4>
                <div className="space-y-1">
                  {currentOutput.auditTrail.map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>• {log.action}</span>
                      <span className="text-slate-400">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
