import React, { useState } from 'react';
import type { DocumentItem, Project } from '../types';
import { processUploadedFile, extractStructuredInfoFromText } from '../services/documentProcessor';
import { FileText, Upload, Zap, CheckCircle2, FileCode, Calendar, Users, Building, Target, Layers, Search, Trash2, Video, Image, FileType, FolderGit2, ArrowLeft, ArrowRight, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';

interface DocumentsViewProps {
  projects: Project[];
  documents: DocumentItem[];
  activeDocument: DocumentItem | null;
  activeProject: Project | null;
  onSelectProject: (proj: Project) => void;
  onSelectDocument: (doc: DocumentItem) => void;
  onAddDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (docId: string) => void;
  onLoadDemoDoc: () => void;
  onProceedToGenerate: () => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  projects,
  documents,
  activeDocument,
  activeProject,
  onSelectProject,
  onSelectDocument,
  onAddDocument,
  onDeleteDocument,
  onProceedToGenerate
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [rawTextSearch, setRawTextSearch] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const selectedProject = selectedProjectId ? (projects.find(p => p.id === selectedProjectId) || null) : null;

  // Documents belonging to the selected project
  const projectDocs = selectedProject
    ? documents.filter(d => d.projectId === selectedProject.id || selectedProject.documentIds?.includes(d.id))
    : [];

  const currentDoc = selectedDocId
    ? (projectDocs.find(d => d.id === selectedDocId) || null)
    : null;

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedProject) return;
    const file = files[0];
    setIsUploading(true);
    setUploadError(null);

    try {
      const { text, fileType } = await processUploadedFile(file);
      const extractedInfo = extractStructuredInfoFromText(text, fileType);

      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        projectId: selectedProject.id,
        name: file.name,
        fileType,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        uploadTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'processed',
        rawText: text,
        extractedInfo
      };

      onAddDocument(newDoc);
      onSelectDocument(newDoc);
      setSelectedDocId(newDoc.id);
    } catch (err: any) {
      console.error(err);
      setUploadError(err?.message || 'Failed to process document upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5 text-purple-400" />;
      case 'image': return <Image className="w-5 h-5 text-emerald-400" />;
      case 'pdf': return <FileType className="w-5 h-5 text-rose-400" />;
      default: return <FileCode className="w-5 h-5 text-sky-400" />;
    }
  };

  const handleProceedToGenerateWithContext = () => {
    if (currentDoc) onSelectDocument(currentDoc);
    if (selectedProject) onSelectProject(selectedProject);
    onProceedToGenerate();
  };

  // LEVEL 1: PROJECT FOLDERS LIST (if no project folder is opened)
  if (!selectedProjectId || !selectedProject) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-400" />
            Project Documents Workspace
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Source documents organized by project folder. Select a project to view its source content and extracted intelligence.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
            Project Workspace Folders ({projects.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((proj) => {
              const docCount = documents.filter(d => d.projectId === proj.id || proj.documentIds?.includes(d.id)).length;
              return (
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
                      <span className="text-xs font-mono text-slate-400">
                        {docCount} {docCount === 1 ? 'document' : 'documents'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition flex items-center gap-2">
                      <FolderGit2 className="w-5 h-5 text-sky-400 shrink-0" />
                      {proj.name}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Created: {proj.createdAt}</span>
                    <span className="text-indigo-400 font-bold group-hover:translate-x-1 transition flex items-center gap-1">
                      Open Project Documents →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // LEVEL 2 & 3: PROJECT SOURCE DOCUMENT WORKSPACE & MULTIMODAL INTELLIGENCE VIEW
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <button
            onClick={() => {
              setSelectedProjectId(null);
              setSelectedDocId(null);
            }}
            className="hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
            Documents
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-200 font-semibold">{selectedProject.name}</span>
          {currentDoc && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-sky-400 font-semibold truncate max-w-[200px]">{currentDoc.name}</span>
            </>
          )}
        </div>

        <button
          onClick={() => {
            setSelectedProjectId(null);
            setSelectedDocId(null);
          }}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
          <span>Back to All Project Folders</span>
        </button>
      </div>

      {/* Project Folder Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Project Source Content Workspace</span>
          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded uppercase">
            {projectDocs.length} {projectDocs.length === 1 ? 'File' : 'Files'}
          </span>
        </div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FolderGit2 className="w-6 h-6 text-sky-400 shrink-0" />
          {selectedProject.name}
        </h2>
        <p className="text-xs text-slate-300">{selectedProject.description}</p>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{uploadError}</span>
          </div>
        </div>
      )}

      {/* Main Grid: Left Files List & Upload | Right Extracted Document Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Upload & Project Files List */}
        <div className="lg:col-span-5 space-y-6">
          {/* Multimodal File Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              handleFileUpload(e.dataTransfer.files);
            }}
            className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
              dragActive
                ? 'border-indigo-400 bg-indigo-500/10'
                : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
            }`}
          >
            <input
              type="file"
              id="fileInputProject"
              accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg,.mp4,.webm,.mov"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            <label htmlFor="fileInputProject" className="cursor-pointer space-y-2 block">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  {isUploading ? 'Extracting multimodal content...' : 'Upload Project Source Content'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Supported: PDF, DOCX, TXT, PNG, JPG, MP4</p>
              </div>
            </label>
          </div>

          {/* Project Source Files Selector */}
          <div className="glass-panel p-4 rounded-2xl space-y-3 border border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1 flex items-center justify-between">
              <span>Project Source Files ({projectDocs.length})</span>
            </h3>

            {projectDocs.length > 0 ? (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {projectDocs.map((doc) => {
                  const isSelected = currentDoc?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => {
                        onSelectDocument(doc);
                        setSelectedDocId(doc.id);
                      }}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-900/60 to-slate-900 border-indigo-500 shadow-md'
                          : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        {getMediaIcon(doc.fileType)}
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-200 truncate">
                            {doc.name}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase font-mono">{doc.fileType} • {doc.size}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                          doc.status === 'processed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {doc.status}
                        </span>

                        {projectDocs.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteDocument(doc.id);
                              if (selectedDocId === doc.id) setSelectedDocId(null);
                            }}
                            className="p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded transition"
                            title="Delete File"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 space-y-1 bg-slate-900/20 rounded-xl border border-slate-800/60">
                <p className="font-semibold text-slate-300">No source files in this project yet</p>
                <p>Upload a PDF, DOCX, image, or video above to begin.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Document Intelligence Details */}
        <div className="lg:col-span-7 space-y-6">
          {currentDoc ? (
            <div className="space-y-6">
              {/* Top Document Status & Detail Card */}
              <div className="glass-panel p-6 rounded-2xl space-y-5 border border-indigo-500/20 shadow-xl">
                {/* Header Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Extracted Multimodal Intelligence</span>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      Content Understanding Card
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </h3>
                  </div>

                  <button
                    onClick={handleProceedToGenerateWithContext}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold shadow-lg flex items-center space-x-2 cursor-pointer transition"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Proceed to Generation →</span>
                  </button>
                </div>

                {/* Selected File Overview Table */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Project</span>
                    <p className="font-bold text-slate-200 truncate">{selectedProject.name}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Document</span>
                    <p className="font-bold text-slate-200 truncate">{currentDoc.name}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">File Type</span>
                    <p className="font-bold text-sky-400 uppercase">{currentDoc.fileType}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Processing Status</span>
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded uppercase inline-block mt-0.5">
                      {currentDoc.status}
                    </span>
                  </div>
                </div>

                {/* Content Understanding Card Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                      <Layers className="w-3 h-3 text-sky-400" /> Main Topic
                    </span>
                    <p className="text-xs font-bold text-white mt-1">{currentDoc.extractedInfo?.topic || 'Analysis'}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-400" /> Event Date
                    </span>
                    <p className="text-xs font-bold text-white mt-1">{currentDoc.extractedInfo?.date || 'N/A'}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                      <Users className="w-3 h-3 text-indigo-400" /> Turnout / Numbers
                    </span>
                    <p className="text-xs font-bold text-white mt-1">{currentDoc.extractedInfo?.participants || 'N/A'}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                      <Building className="w-3 h-3 text-purple-400" /> Organization
                    </span>
                    <p className="text-xs font-bold text-white mt-1">{currentDoc.extractedInfo?.department || 'N/A'}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 sm:col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                      <Target className="w-3 h-3 text-amber-400" /> Primary Objectives
                    </span>
                    <p className="text-xs font-semibold text-slate-200 mt-1">{currentDoc.extractedInfo?.purpose || 'Solution development'}</p>
                  </div>
                </div>

                {/* Key Points & Facts */}
                <div className="space-y-2 pt-1">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Extracted Key Points & Facts
                  </h4>
                  <ul className="space-y-1.5">
                    {currentDoc.extractedInfo?.keyPoints?.map((point, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Extracted Content / Transcript Text */}
              <div className="glass-panel p-5 rounded-2xl space-y-3 border border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    Extracted Content / Transcript Text
                  </h4>

                  <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                    <Search className="w-3 h-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search text..."
                      value={rawTextSearch}
                      onChange={(e) => setRawTextSearch(e.target.value)}
                      className="bg-transparent text-[11px] text-slate-200 outline-none w-28"
                    />
                  </div>
                </div>

                <pre className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {currentDoc.rawText}
                </pre>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleProceedToGenerateWithContext}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold shadow-lg flex items-center space-x-2 cursor-pointer transition"
                  >
                    <span>Proceed to Generation →</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">Select a Source Document</h3>
              <p className="text-xs text-slate-400">Select a file from the project list on the left to view extracted content intelligence.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
