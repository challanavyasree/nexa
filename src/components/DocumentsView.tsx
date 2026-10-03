import React, { useState } from 'react';
import type { DocumentItem } from '../types';
import { processUploadedFile, extractStructuredInfoFromText } from '../services/documentProcessor';
import { FileText, Upload, Zap, CheckCircle2, FileCode, Calendar, Users, Building, Target, Layers, Search, Trash2, Video, Image, FileType } from 'lucide-react';

interface DocumentsViewProps {
  documents: DocumentItem[];
  activeDocument: DocumentItem | null;
  onSelectDocument: (doc: DocumentItem) => void;
  onAddDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (docId: string) => void;
  onLoadDemoDoc: () => void;
  onProceedToGenerate: () => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  activeDocument,
  onSelectDocument,
  onAddDocument,
  onDeleteDocument,
  onLoadDemoDoc,
  onProceedToGenerate
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [rawTextSearch, setRawTextSearch] = useState('');

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsUploading(true);

    try {
      const { text, fileType } = await processUploadedFile(file);
      const extractedInfo = extractStructuredInfoFromText(text, fileType);

      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
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
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const currentDoc = activeDocument || documents[0];

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5 text-purple-400" />;
      case 'image': return <Image className="w-5 h-5 text-emerald-400" />;
      case 'pdf': return <FileType className="w-5 h-5 text-rose-400" />;
      default: return <FileCode className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Demo Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            Multimodal Content Understanding & Upload
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Accepts PDF, Text, Image (OCR), and Video (Audio Transcript Extraction). Automatically extracts structured facts.
          </p>
        </div>

        <button
          onClick={onLoadDemoDoc}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center space-x-2 cursor-pointer shadow-md"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Load Generic Demo Data</span>
        </button>
      </div>

      {/* Main Grid: Left Upload & Selector | Right Extracted Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Upload Box & Document List */}
        <div className="lg:col-span-5 space-y-6">
          {/* Drag & Drop Upload Zone */}
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
              id="fileInput"
              accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg,.mp4,.webm,.mov"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            <label htmlFor="fileInput" className="cursor-pointer space-y-3 block">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  {isUploading ? 'Extracting multimodal content...' : 'Click to Upload or Drag & Drop'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Supported: PDF, TXT, DOCX, Images, Video (MP4/WebM)</p>
              </div>
            </label>
          </div>

          {/* Active Documents List */}
          <div className="glass-panel p-4 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
              Multimodal Documents ({documents.length})
            </h3>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {documents.map((doc) => {
                const isSelected = currentDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => onSelectDocument(doc)}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-900/50 to-slate-900 border-indigo-500/50 shadow-md'
                        : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {getMediaIcon(doc.fileType)}
                      <div>
                        <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                          {doc.name}
                          {doc.isDemo && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                              Demo Data
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400">{doc.fileType.toUpperCase()} • {doc.size}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                        ✓ Processed
                      </span>
                      {documents.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDocument(doc.id);
                          }}
                          className="p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded transition"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Content Understanding Card */}
        {currentDoc && (
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel p-6 rounded-2xl space-y-5 border border-indigo-500/20">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Extracted Multimodal Intelligence</span>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Content Understanding Card
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </h3>
                </div>

                <button
                  onClick={onProceedToGenerate}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md flex items-center space-x-2 cursor-pointer"
                >
                  <span>Proceed to Generation →</span>
                </button>
              </div>

              {/* Grid of Extracted Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                    <Layers className="w-3 h-3 text-sky-400" /> Main Topic
                  </span>
                  <p className="text-xs font-bold text-white mt-1">{currentDoc.extractedInfo.topic}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-emerald-400" /> Event Date
                  </span>
                  <p className="text-xs font-bold text-white mt-1">{currentDoc.extractedInfo.date}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                    <Users className="w-3 h-3 text-indigo-400" /> Turnout / Numbers
                  </span>
                  <p className="text-xs font-bold text-white mt-1">{currentDoc.extractedInfo.participants}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                    <Building className="w-3 h-3 text-purple-400" /> Organization
                  </span>
                  <p className="text-xs font-bold text-white mt-1">{currentDoc.extractedInfo.department}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 sm:col-span-2">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                    <Target className="w-3 h-3 text-amber-400" /> Primary Objectives
                  </span>
                  <p className="text-xs font-semibold text-slate-200 mt-1">{currentDoc.extractedInfo.purpose}</p>
                </div>
              </div>

              {/* Key Facts & Points */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Extracted Key Points & Facts
                </h4>
                <ul className="space-y-1.5">
                  {currentDoc.extractedInfo.keyPoints.map((point, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Raw Extracted Text / Transcript Preview */}
            <div className="glass-panel p-5 rounded-2xl space-y-3">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
