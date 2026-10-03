import React, { useState } from 'react';
import type { AudienceContext, ContentContext, CreatorContext, DocumentItem, GeneratedOutput, PageType, Project, VerificationClaim } from '../types';
import { DEFAULT_AUDIENCE_CONTEXT, DEFAULT_CONTENT_CONTEXT, DEFAULT_CREATOR_CONTEXT } from '../services/sampleData';
import { FolderGit2, Plus, User, Users, Layers, FileText, CheckCircle2, ArrowLeft, Sparkles, ShieldCheck, AlertTriangle, Clock, Calendar } from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (proj: Project) => void;
  onCreateProject: (proj: Project) => void;
  onUpdateProjectContext: (
    projId: string,
    creatorCtx: CreatorContext,
    audienceCtx: AudienceContext,
    contentCtx: ContentContext
  ) => void;
  onNavigatePage: (page: PageType) => void;
  documents: DocumentItem[];
  outputs: GeneratedOutput[];
  claims?: VerificationClaim[];
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onCreateProject,
  onNavigatePage,
  documents,
  outputs,
  claims = []
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');

  // Selected project object for report view (shown only when selectedProjectId is explicitly set)
  const selectedProject = selectedProjectId ? (projects.find(p => p.id === selectedProjectId) || null) : null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: newProjName,
      description: newProjDesc || 'Source-grounded AI content campaign.',
      createdAt: new Date().toISOString().split('T')[0],
      creatorContext: DEFAULT_CREATOR_CONTEXT,
      audienceContext: DEFAULT_AUDIENCE_CONTEXT,
      contentContext: DEFAULT_CONTENT_CONTEXT,
      documentIds: [],
      outputIds: []
    };

    onCreateProject(newProj);
    onSelectProject(newProj);
    setSelectedProjectId(newProj.id);
    setIsCreateModalOpen(false);
    setNewProjName('');
    setNewProjDesc('');
  };

  // Filter project-specific documents, outputs, and claims
  const projectDocs = selectedProject
    ? documents.filter(d => d.projectId === selectedProject.id || selectedProject.documentIds?.includes(d.id))
    : [];

  const projectOutputs = selectedProject
    ? outputs.filter(o => o.projectId === selectedProject.id || selectedProject.outputIds?.includes(o.id))
    : [];

  const projectClaims = selectedProject
    ? claims.filter(c => projectOutputs.some(o => o.id === c.outputId))
    : [];

  // If a project report is selected, render the FULL READ-ONLY REPORT VIEW
  if (selectedProject && selectedProjectId) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Top Action Bar & Back Button */}
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-800">
          <button
            onClick={() => setSelectedProjectId(null)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-2 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>Back to Projects List</span>
          </button>

          <button
            onClick={() => onNavigatePage('generate')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold shadow-md flex items-center space-x-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate New Content for Project</span>
          </button>
        </div>

        {/* Project Report Document Container */}
        <div className="glass-panel p-8 rounded-2xl border border-indigo-500/30 space-y-8 shadow-2xl">
          {/* Header Section: Name & Description */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="px-3 py-1 text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg uppercase tracking-wider">
                Project Report Summary
              </span>
              <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  Created: {selectedProject.createdAt}
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                  Active
                </span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <FolderGit2 className="w-7 h-7 text-indigo-400 shrink-0" />
              {selectedProject.name}
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
              {selectedProject.description}
            </p>
          </div>

          <hr className="border-slate-800" />

          {/* Section 1: Creator / User Context */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-sky-400" />
              Creator / User Context
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">User Type</span>
                <span className="text-xs font-semibold text-slate-200">{selectedProject.creatorContext?.creatorType || 'Working Professional'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Domain</span>
                <span className="text-xs font-semibold text-slate-200">{selectedProject.creatorContext?.domain || 'Computer Science'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Experience Level</span>
                <span className="text-xs font-semibold text-slate-200">{selectedProject.creatorContext?.experienceLevel || 'Advanced'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Primary Goal</span>
                <span className="text-xs font-semibold text-slate-200">{selectedProject.creatorContext?.primaryGoal || 'Inform'}</span>
              </div>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Section 2: Target Audience Context */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Target Audience Context
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Audience Type</span>
                <span className="text-xs font-semibold text-slate-200">{selectedProject.audienceContext?.audienceType || 'Management'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Audience Knowledge</span>
                <span className="text-xs font-semibold text-slate-200">{selectedProject.audienceContext?.knowledgeLevel || 'Advanced'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Communication Style</span>
                <span className="text-xs font-semibold text-slate-200">{selectedProject.audienceContext?.communicationStyle || 'Professional'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Language</span>
                <span className="text-xs font-semibold text-slate-200">{selectedProject.audienceContext?.language || 'English'}</span>
              </div>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Section 3: Content Intent & Output Context */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Content Intent & Output Context
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Output Format</span>
                <span className="text-xs font-semibold text-slate-200 uppercase">{selectedProject.contentContext?.outputType || 'briefing'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target Platform / Channel</span>
                <span className="text-xs font-semibold text-slate-200">{selectedProject.contentContext?.platform || 'LinkedIn'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Content Tone</span>
                <span className="text-xs font-semibold text-slate-200">{selectedProject.contentContext?.tone || 'Professional'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Content Intent</span>
                <span className="text-xs font-semibold text-slate-200">{selectedProject.contentContext?.intent || 'Information'}</span>
              </div>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Section 4: Source Content / Documents */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              Source Content / Documents ({projectDocs.length})
            </h3>

            {projectDocs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projectDocs.map((doc) => (
                  <div key={doc.id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3 truncate">
                      <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-slate-200 truncate">{doc.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase">{doc.fileType} • {doc.size}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30 uppercase shrink-0">
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60 text-xs text-slate-400">
                No source documents attached yet for this project.
              </div>
            )}
          </div>

          <hr className="border-slate-800" />

          {/* Section 5: Generated Outputs */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Generated Outputs ({projectOutputs.length})
            </h3>

            {projectOutputs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projectOutputs.map((out) => (
                  <div key={out.id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{out.title}</span>
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded uppercase">
                        {out.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                      "{out.content.substring(0, 120)}..."
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                      <span>Platform: {out.platform}</span>
                      <span className="text-emerald-400 font-semibold">✓ {out.verificationStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60 text-xs text-slate-400">
                No outputs generated yet for this project. Click "Generate New Content" above to launch pipeline.
              </div>
            )}
          </div>

          <hr className="border-slate-800" />

          {/* Section 6: Verification / Review Status */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verification & Review Status
            </h3>

            {projectClaims.length > 0 ? (
              <div className="space-y-2">
                {projectClaims.map((claim) => (
                  <div key={claim.id} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <p className="font-medium text-slate-200">{claim.claimText}</p>
                      <p className="text-[10px] text-slate-400 italic">Source Evidence: "{claim.evidenceQuote}"</p>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded border uppercase ${
                      claim.status === 'verified' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60 text-xs text-slate-400 flex items-center justify-between">
                <span>Verification audit trail: 100% source-grounded claim mapping active.</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded">
                  System Active
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT VIEW: CLEAN PROJECTS LIST GRID (NO RIGHT-SIDE CONFIGURATION FORM)
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-400" />
            Active Projects Workspace
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Browse and view saved AI Content Intelligence project reports and source-grounded campaigns.
          </p>
        </div>

        <button
          onClick={() => onNavigatePage('generate')}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold shadow-lg flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Project</span>
        </button>
      </div>

      {/* Full Width Clean Projects Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
          Saved Projects ({projects.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => {
                onSelectProject(proj);
                setSelectedProjectId(proj.id);
              }}
              className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-800/80 hover:border-indigo-500/50 cursor-pointer transition-all space-y-4 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md uppercase">
                    {proj.creatorContext?.domain || 'Computer Science'}
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded uppercase">
                    Active
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                  {proj.name}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {proj.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="text-[11px]">Created: {proj.createdAt}</span>
                <span className="text-sky-400 font-bold group-hover:translate-x-1 transition flex items-center gap-1">
                  View Report →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Create New Project */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl space-y-5 border border-indigo-500/30 shadow-2xl relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              ✕
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Create New Intelligence Project</h3>
                <p className="text-xs text-slate-400">Initialize project workspace & baseline context parameters</p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="e.g. Q4 Executive Investor Campaign"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Project Description</label>
                <textarea
                  rows={3}
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="Describe the primary goals and scope of this content intelligence project..."
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
                >
                  Create & View Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
