import React from 'react';
import type { DocumentItem } from '../types';
import { FolderGit2, FileText, Zap, Key, UserCheck } from 'lucide-react';

interface TopbarProps {
  currentDocument: DocumentItem | null;
  onLoadDemoDoc: () => void;
  onOpenSettings: () => void;
  activeProjectName: string;
  setActiveProjectName: (name: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentDocument,
  onLoadDemoDoc,
  onOpenSettings,
  activeProjectName,
  setActiveProjectName
}) => {
  return (
    <header className="h-16 bg-[#0d1322]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between z-10 shrink-0">
      {/* Left: Project Name Selector */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-lg">
          <FolderGit2 className="w-4 h-4 text-indigo-400" />
          <select
            value={activeProjectName}
            onChange={(e) => setActiveProjectName(e.target.value)}
            aria-label="Select Project"
            className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer pr-1"
          >
            <option value="WebX Hackathon 2026 Campaign" className="bg-slate-900 text-slate-200">
              WebX Hackathon 2026 Campaign
            </option>
            <option value="Q4 Executive Briefings" className="bg-slate-900 text-slate-200">
              Q4 Executive Briefings
            </option>
            <option value="CSE Department Media Kit" className="bg-slate-900 text-slate-200">
              CSE Department Media Kit
            </option>
          </select>
        </div>

        {/* Current Active Document Badge */}
        <div className="hidden md:flex items-center space-x-2 text-xs bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
          <FileText className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-400">Current Doc:</span>
          <span className="font-medium text-slate-200 truncate max-w-[180px]">
            {currentDocument ? currentDocument.name : 'No Document Selected'}
          </span>
          {currentDocument?.isDemo && (
            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded uppercase">
              Demo
            </span>
          )}
        </div>
      </div>

      {/* Right: Quick Actions & Profile */}
      <div className="flex items-center space-x-3">
        {/* Instant Load Demo Data Button */}
        <button
          onClick={onLoadDemoDoc}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all duration-200 shadow-sm"
          title="Instantly load WebX Hackathon 24-Hour sample document"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span>Load WebX Demo Doc</span>
        </button>

        {/* API Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-slate-300 hover:text-white transition-all text-xs flex items-center space-x-1.5"
          title="Configure LLM API Settings"
        >
          <Key className="w-4 h-4 text-slate-400" />
          <span className="hidden sm:inline">API Config</span>
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold border border-slate-700 shadow-sm">
            AI
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-200 flex items-center gap-1">
              Hackathon Reviewer
              <UserCheck className="w-3 h-3 text-emerald-400" />
            </p>
            <p className="text-[10px] text-slate-400">Chief Content Verifier</p>
          </div>
        </div>
      </div>
    </header>
  );
};
