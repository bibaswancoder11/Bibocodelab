import React, { useState } from 'react';
import {
  Code,
  Play,
  Save,
  Download,
  FilePlus2,
  Sparkles,
  Columns,
  Eye,
  PanelLeftClose,
  PanelLeftOpen,
  Edit2,
  Check,
} from 'lucide-react';
import { MobileTab } from '../types';

interface TopbarProps {
  projectName: string;
  onUpdateProjectName: (name: string) => void;
  onNewProject: () => void;
  onSave: () => void;
  onExport: () => void;
  onFormat: () => void;
  onRun: () => void;
  isExecuting: boolean;
  hasUnsavedChanges: boolean;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  mobileTab: MobileTab;
  onMobileTabChange: (tab: MobileTab) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  projectName,
  onUpdateProjectName,
  onNewProject,
  onSave,
  onExport,
  onFormat,
  onRun,
  isExecuting,
  hasUnsavedChanges,
  isSidebarOpen,
  onToggleSidebar,
  mobileTab,
  onMobileTabChange,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(projectName);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onUpdateProjectName(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <header className="h-14 bg-[#0d1017] border-b border-[#1e2535] px-3 md:px-4 flex items-center justify-between z-20 shrink-0 select-none">
      {/* Brand & Project Info */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#192233] transition-colors"
          title={isSidebarOpen ? 'Collapse Explorer' : 'Expand Explorer'}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-mono text-xs font-bold">
            &lt;/&gt;
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white hidden sm:inline">
            Bibo<span className="text-indigo-400">CodeLab</span>
          </span>
        </div>

        {/* Project name editor */}
        <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-[#202738] min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] shrink-0" />
          {isEditingName ? (
            <form onSubmit={handleNameSubmit} className="flex items-center gap-1">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="bg-[#151c2a] text-slate-200 border border-indigo-500/60 rounded px-1.5 py-0.5 text-xs outline-none"
                autoFocus
                onBlur={handleNameSubmit}
              />
              <button type="submit" className="text-emerald-400 hover:text-emerald-300">
                <Check className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                setTempName(projectName);
                setIsEditingName(true);
              }}
              className="flex items-center gap-1 text-xs text-slate-300 hover:text-white group truncate max-w-[140px] md:max-w-[200px]"
              title="Click to rename project"
            >
              <span className="truncate">{projectName}</span>
              <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-slate-300 shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Tab Switcher (Code | Split | Preview) */}
      <div className="flex lg:hidden items-center bg-[#151a24] border border-[#232c3f] rounded-lg p-0.5 text-xs">
        <button
          onClick={() => onMobileTabChange('editor')}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
            mobileTab === 'editor' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Editor</span>
        </button>
        <button
          onClick={() => onMobileTabChange('split')}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
            mobileTab === 'split' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400'
          }`}
        >
          <Columns className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Split</span>
        </button>
        <button
          onClick={() => onMobileTabChange('preview')}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
            mobileTab === 'preview' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Preview</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 md:gap-2">
        <button
          onClick={onNewProject}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#161c28] hover:bg-[#1e2738] text-slate-200 border border-[#242e42] rounded-lg text-xs font-medium transition-colors"
          title="Create or reset project"
        >
          <FilePlus2 className="w-3.5 h-3.5 text-slate-400" />
          <span>New</span>
        </button>

        <button
          onClick={onFormat}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#161c28] hover:bg-[#1e2738] text-slate-200 border border-[#242e42] rounded-lg text-xs font-medium transition-colors"
          title="Format & beautify current code"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Format</span>
        </button>

        <button
          onClick={onSave}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#161c28] hover:bg-[#1e2738] text-slate-200 border border-[#242e42] rounded-lg text-xs font-medium transition-colors relative"
          title="Save project locally (Ctrl+S / Cmd+S)"
        >
          <Save className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Save</span>
          {hasUnsavedChanges && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1.5 right-1.5" />
          )}
        </button>

        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#161c28] hover:bg-[#1e2738] text-slate-200 border border-[#242e42] rounded-lg text-xs font-medium transition-colors"
          title="Export as standalone HTML file"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Primary Run Button */}
        <button
          onClick={onRun}
          disabled={isExecuting}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
          title="Execute code (Ctrl+Enter / Cmd+Enter)"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isExecuting ? 'animate-pulse' : ''}`} />
          <span>Run</span>
        </button>
      </div>
    </header>
  );
};
