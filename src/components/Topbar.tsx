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
  Smartphone,
  X,
} from 'lucide-react';
import { MobileTab } from '../types';
import { usePWAInstall } from '../utils/usePWAInstall';

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
  const [imgError, setImgError] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onUpdateProjectName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
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

          {/* App Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-[34px] h-[34px] rounded-xl overflow-hidden flex items-center justify-center shrink-0 ring-1 ring-indigo-500/40 shadow-md shadow-indigo-950/50 bg-[#0d121c]">
              <img
                src={imgError ? "/logo.svg" : "/app-icon.png"}
                alt="BiboCodeLab Logo"
                onError={() => {
                  if (!imgError) setImgError(true);
                }}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-white leading-tight">
                Bibo<span className="text-indigo-400">CodeLab</span>
              </span>
              <span className="text-[9px] font-semibold text-indigo-300 tracking-wider hidden sm:inline uppercase">
                Browser Studio
              </span>
            </div>
          </div>

          {/* Project name editor */}
          <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-[#202738] min-w-0">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                hasUnsavedChanges
                  ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24]'
                  : 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
              }`}
              title={hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
            />
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
          {/* PWA Install Button when available or on mobile */}
          {!isInstalled && (isInstallable || isIOS) && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
              title="Install BiboCodeLab on your device / home screen"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}

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

          {/* Save button */}
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#161c28] hover:bg-[#1e2738] text-slate-200 border border-[#242e42] rounded-lg text-xs font-medium transition-colors"
            title="Save project (Ctrl+S / Cmd+S)"
          >
            <Save className={`w-3.5 h-3.5 ${hasUnsavedChanges ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Export standalone HTML button */}
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#161c28] hover:bg-[#1e2738] text-slate-200 border border-[#242e42] rounded-lg text-xs font-medium transition-colors"
            title="Export project as standalone HTML"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
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

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl bg-[#121722] border border-[#252f42] p-5 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#212a3d]">
              <div className="flex items-center gap-2">
                <img src="/app-icon.png" alt="App Icon" className="w-6 h-6 rounded" />
                <h3 className="text-sm font-bold text-white">Install on iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 space-y-2.5 text-xs text-slate-300">
              <p>To install with your custom app icon on your home screen:</p>
              <div className="p-2.5 rounded-lg bg-[#182030] border border-[#26334d] space-y-1.5">
                <p>1. Tap the <strong className="text-indigo-300">Share</strong> button in Safari's bottom toolbar.</p>
                <p>2. Scroll down and select <strong className="text-indigo-300">Add to Home Screen</strong>.</p>
                <p>3. Tap <strong className="text-indigo-300">Add</strong> in the top right.</p>
              </div>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 py-2 text-xs font-bold text-white transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

