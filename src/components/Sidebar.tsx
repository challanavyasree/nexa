import React from 'react';
import type { PageType } from '../types';
import { LayoutDashboard, FolderGit2, FileText, Sparkles, Layers, ShieldCheck, UserCheck, Cpu } from 'lucide-react';

interface SidebarProps {
  activePage: PageType;
  setActivePage: (page: PageType) => void;
  projectsCount: number;
  documentsCount: number;
  outputsCount: number;
  pendingReviewCount: number;
  mismatchCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  projectsCount,
  documentsCount,
  outputsCount,
  pendingReviewCount,
  mismatchCount
}) => {
  const navItems = [
    { id: 'dashboard' as PageType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects' as PageType, label: 'Projects', icon: FolderGit2, badge: projectsCount > 0 ? projectsCount : undefined },
    { id: 'documents' as PageType, label: 'Documents', icon: FileText, badge: documentsCount > 0 ? documentsCount : undefined },
    { id: 'generate' as PageType, label: 'Generate', icon: Sparkles },
    { id: 'outputs' as PageType, label: 'Outputs', icon: Layers, badge: outputsCount > 0 ? outputsCount : undefined },
    { id: 'verification' as PageType, label: 'Verification', icon: ShieldCheck, alert: mismatchCount > 0 },
    { id: 'review' as PageType, label: 'Review', icon: UserCheck, badge: pendingReviewCount > 0 ? pendingReviewCount : undefined, color: 'bg-emerald-500/20 text-emerald-400' }
  ];

  return (
    <aside className="w-64 bg-[#0d1322] border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
              AI Content Intelligence
            </h1>
            <p className="text-[11px] text-slate-400 font-medium tracking-wider uppercase">Master MVP Platform</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
            Platform Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/90 to-sky-600/90 text-white shadow-md shadow-indigo-500/15 border border-indigo-400/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${item.color || 'bg-slate-800 text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}

                {item.alert && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-200">RAG Engine Online</p>
            <p className="text-[10px] text-slate-400">PostgreSQL / Vector Ready</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
