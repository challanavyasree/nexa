import React, { useState } from 'react';
import type { AudienceContext, ContentContext, CreatorContext, DocumentItem, GeneratedOutput, PageType, Project } from '../types';
import { DEFAULT_AUDIENCE_CONTEXT, DEFAULT_CONTENT_CONTEXT, DEFAULT_CREATOR_CONTEXT } from '../services/sampleData';
import { FolderGit2, Plus, Sparkles, User, Users, Target, Layers, FileText, CheckCircle2, ArrowRight, X, Play } from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  activeProject: Project;
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
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onCreateProject,
  onUpdateProjectContext,
  onNavigatePage,
  documents,
  outputs
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');

  // Form State for Creator, Audience & Content Context
  const [creatorCtx, setCreatorCtx] = useState<CreatorContext>(activeProject.creatorContext || DEFAULT_CREATOR_CONTEXT);
  const [audienceCtx, setAudienceCtx] = useState<AudienceContext>(activeProject.audienceContext || DEFAULT_AUDIENCE_CONTEXT);
  const [contentCtx, setContentCtx] = useState<ContentContext>(activeProject.contentContext || DEFAULT_CONTENT_CONTEXT);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: newProjName,
      description: newProjDesc || 'Source-grounded AI content campaign.',
      createdAt: new Date().toISOString().split('T')[0],
      creatorContext: creatorCtx,
      audienceContext: audienceCtx,
      contentContext: contentCtx,
      documentIds: [],
      outputIds: []
    };

    onCreateProject(newProj);
    onSelectProject(newProj);
    setIsCreateModalOpen(false);
    setNewProjName('');
    setNewProjDesc('');
  };

  const handleSaveContext = () => {
    onUpdateProjectContext(activeProject.id, creatorCtx, audienceCtx, contentCtx);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-400" />
            Project Workspaces & Context Configuration
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Configure Creator Context, Target Audience Context, and Content Channel parameters for project-scoped RAG.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold shadow-lg flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Project</span>
        </button>
      </div>

      {/* Grid: Left Projects List | Right Active Project Context Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Projects Selector List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
            Active Projects ({projects.length})
          </h3>

          <div className="space-y-2.5">
            {projects.map((proj) => {
              const isSelected = activeProject.id === proj.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    onSelectProject(proj);
                    setCreatorCtx(proj.creatorContext);
                    setAudienceCtx(proj.audienceContext);
                    setContentCtx(proj.contentContext);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-900/60 to-slate-900 border-indigo-500 shadow-md'
                      : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[190px]">{proj.name}</span>
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded uppercase">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{proj.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 font-mono">
                    <span>Created: {proj.createdAt}</span>
                    <span className="text-sky-400 font-semibold">{proj.creatorContext.domain}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (8 cols): Project Workspace Context Panels */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-6 border border-indigo-500/20">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Project Workspace Context</span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {activeProject.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{activeProject.description}</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveContext}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center space-x-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Context Parameters</span>
                </button>

                <button
                  onClick={() => onNavigatePage('generate')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md flex items-center space-x-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Launch Pipeline →</span>
                </button>
              </div>
            </div>

            {/* Context Section 1: Creator / User Context (Phase 3) */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-sky-400" />
                Phase 3: Creator / User Context
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Creator Type</label>
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
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Creator Domain</label>
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
                    <option value="Finance">Finance</option>
                    <option value="Other">Other Domain</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Experience Level</label>
                  <select
                    value={creatorCtx.experienceLevel}
                    onChange={(e) => setCreatorCtx({ ...creatorCtx, experienceLevel: e.target.value as any })}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Primary Goal</label>
                  <select
                    value={creatorCtx.primaryGoal}
                    onChange={(e) => setCreatorCtx({ ...creatorCtx, primaryGoal: e.target.value as any })}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                  >
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

            {/* Context Section 2: Target Audience Context (Phase 4) */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Phase 4: Target Audience Context
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Audience Type</label>
                  <select
                    value={audienceCtx.audienceType}
                    onChange={(e) => setAudienceCtx({ ...audienceCtx, audienceType: e.target.value as any })}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                  >
                    <option value="Students">Students</option>
                    <option value="Working Professionals">Working Professionals</option>
                    <option value="Recruiters">Recruiters</option>
                    <option value="Researchers">Researchers</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Customers">Customers</option>
                    <option value="Management">Management</option>
                    <option value="Developers">Developers</option>
                    <option value="General Public">General Public</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Audience Knowledge</label>
                  <select
                    value={audienceCtx.knowledgeLevel}
                    onChange={(e) => setAudienceCtx({ ...audienceCtx, knowledgeLevel: e.target.value as any })}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Communication Style</label>
                  <select
                    value={audienceCtx.communicationStyle}
                    onChange={(e) => setAudienceCtx({ ...audienceCtx, communicationStyle: e.target.value as any })}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Language</label>
                  <input
                    type="text"
                    value={audienceCtx.language}
                    onChange={(e) => setAudienceCtx({ ...audienceCtx, language: e.target.value })}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Context Section 3: Content Intent & Channel (Phase 5) */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Phase 5: Content Intent & Channel Configuration
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Output Format</label>
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target Platform / Channel</label>
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Content Tone</label>
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
              </div>
            </div>
          </div>
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
              <X className="w-4 h-4" />
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
                  Create Project Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
