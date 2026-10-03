import React from 'react';
import type { DocumentItem, GeneratedOutput, PageType, Project, VerificationClaim } from '../types';
import { FileText, Sparkles, ShieldCheck, AlertTriangle, ArrowRight, Play, CheckCircle2, FolderGit2, Plus } from 'lucide-react';

interface DashboardViewProps {
  documents: DocumentItem[];
  outputs: GeneratedOutput[];
  claims: VerificationClaim[];
  projects: Project[];
  onStartNewProject: () => void;
  onOpenTemporaryAnalysis: () => void;
  onNavigatePage: (page: PageType) => void;
  onSelectProject: (proj: Project) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  documents,
  outputs,
  claims,
  projects,
  onStartNewProject,
  onOpenTemporaryAnalysis,
  onNavigatePage,
  onSelectProject
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

  // Get last 2 projects
  const recentProjects = projects.slice(0, 2);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Row with Start New Project button in top-right */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Dashboard Workspace
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Content intelligence metrics, core workflow sequence, and active project management.
          </p>
        </div>

        {/* Top-Right Prominent Primary Action: Start New Project */}
        <button
          onClick={onStartNewProject}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Start New Project</span>
        </button>
      </div>

      {/* Four Statistic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Documents Processed (Entry point to Temporary Analysis Workflow) */}
        <div
          onClick={onOpenTemporaryAnalysis}
          className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer border-indigo-500/30 group relative overflow-hidden"
          title="Click to launch Temporary Analysis Workflow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Documents Processed</span>
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-110 transition-all">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{documents.length}</span>
            <span className="text-xs text-sky-400 font-medium">Multimodal</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">PDF, Text, Image, Video</span>
            <span className="text-indigo-400 font-bold group-hover:underline flex items-center gap-1">
              Quick Analysis →
            </span>
          </div>
        </div>

        {/* Card 2: Content Generated */}
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

        {/* Card 3: Claims Verified */}
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

        {/* Card 4: Issues Detected */}
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

      {/* Main Core Workflow Sequence Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              Core Workflow Sequence
            </h3>
            <p className="text-xs text-slate-400">Understand → Analyze → Retrieve → Generate → Verify → Review</p>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg">
            Multi-Agent Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {workflowSequence.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.label}
                onClick={() => onNavigatePage(step.page)}
                className="group flex flex-col items-center text-center p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all duration-200"
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

      {/* Recent Projects Section (Replaces Source Documents & Recent Outputs) */}
      <div className="glass-panel p-5 rounded-2xl space-y-4 border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
            Recent Projects
          </h3>
          <button
            onClick={() => onNavigatePage('projects')}
            className="text-xs text-indigo-400 hover:underline font-medium cursor-pointer"
          >
            View All Projects →
          </button>
        </div>

        {recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentProjects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => {
                  onSelectProject(proj);
                  onNavigatePage('projects');
                }}
                className="p-4 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800/80 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                    {proj.name}
                  </h4>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                    {proj.creatorContext.domain}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2">{proj.description}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                  <span>Created: {proj.createdAt}</span>
                  <span className="text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition">
                    Open Project →
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400 space-y-2">
            <p className="font-semibold text-slate-300">No projects yet</p>
            <p>Create your first project to get started.</p>
            <button
              onClick={onStartNewProject}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center space-x-1.5 cursor-pointer mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Project</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
