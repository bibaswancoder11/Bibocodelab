import React, { useState } from 'react';
import {
  Folder,
  FileCode,
  FileText,
  FileJson,
  Plus,
  Trash2,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronRight,
  Code2,
} from 'lucide-react';
import { ProjectFile } from '../types';

interface SidebarProps {
  projectName: string;
  files: ProjectFile[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onAddFile: (name: string) => void;
  onDeleteFile: (fileId: string) => void;
  onOpenTemplates: () => void;
  onOpenShortcuts: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  projectName,
  files,
  activeFileId,
  onSelectFile,
  onAddFile,
  onDeleteFile,
  onOpenTemplates,
  onOpenShortcuts,
}) => {
  const [isNewFileOpen, setIsNewFileOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isTreeExpanded, setIsTreeExpanded] = useState(true);

  const getFileIcon = (file: ProjectFile) => {
    if (file.language === 'html') {
      return <span className="text-rose-400 font-bold text-[11px] w-4 text-center">H</span>;
    }
    if (file.language === 'css') {
      return <span className="text-sky-400 font-bold text-[11px] w-4 text-center">#</span>;
    }
    if (file.language === 'javascript') {
      return <span className="text-amber-400 font-bold text-[11px] w-4 text-center">JS</span>;
    }
    return <span className="text-emerald-400 font-bold text-[11px] w-4 text-center">{}</span>;
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    onAddFile(newFileName.trim());
    setNewFileName('');
    setIsNewFileOpen(false);
  };

  const totalLines = files.reduce((acc, f) => acc + f.content.split('\n').length, 0);
  const totalBytes = files.reduce((acc, f) => acc + new Blob([f.content]).size, 0);

  return (
    <aside className="w-56 bg-[#0c0f16] border-r border-[#1a2130] flex flex-col h-full select-none text-xs shrink-0">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-[#1a2130]">
        <span className="font-bold tracking-wider text-[10px] text-slate-400 uppercase">
          Explorer
        </span>
        <button
          onClick={() => setIsNewFileOpen(!isNewFileOpen)}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#182132] transition-colors"
          title="Add new file"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* New File Inline Form */}
      {isNewFileOpen && (
        <form onSubmit={handleCreateFile} className="p-2 border-b border-[#1e273a] bg-[#121824]">
          <input
            type="text"
            placeholder="e.g. data.json, app.js"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            className="w-full bg-[#0a0d14] text-slate-200 border border-[#2b364c] rounded px-2 py-1 text-xs outline-none focus:border-indigo-500"
            autoFocus
          />
          <div className="flex justify-end gap-1.5 mt-1.5">
            <button
              type="button"
              onClick={() => setIsNewFileOpen(false)}
              className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2 py-0.5 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium"
            >
              Create
            </button>
          </div>
        </form>
      )}

      {/* Files Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Project root folder */}
        <div
          onClick={() => setIsTreeExpanded(!isTreeExpanded)}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-slate-300 hover:bg-[#141b27] cursor-pointer font-medium"
        >
          {isTreeExpanded ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
          <Folder className="w-3.5 h-3.5 text-indigo-400" />
          <span className="truncate">{projectName}</span>
        </div>

        {isTreeExpanded && (
          <div className="pl-3.5 space-y-0.5">
            {files.map((file) => {
              const isActive = file.id === activeFileId;
              return (
                <div
                  key={file.id}
                  onClick={() => onSelectFile(file.id)}
                  className={`group flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-[#1b2333] text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#141b27]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {getFileIcon(file)}
                    <span className="truncate text-xs">{file.name}</span>
                  </div>

                  {file.isDeletable && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile(file.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-400 transition-opacity"
                      title="Delete file"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Project Quick Actions */}
        <div className="pt-4 border-t border-[#1a2130] mt-3 space-y-1">
          <div className="px-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
            Library & Tools
          </div>

          <button
            onClick={onOpenTemplates}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-[#141b27] transition-colors text-left"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Templates</span>
          </button>

          <button
            onClick={onOpenShortcuts}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-[#141b27] transition-colors text-left"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Shortcuts</span>
          </button>
        </div>
      </div>

      {/* Project Statistics Footer */}
      <div className="p-3 border-t border-[#1a2130] bg-[#090c12] text-[11px] text-slate-500 space-y-1">
        <div className="flex justify-between">
          <span>Files:</span>
          <span className="text-slate-400 font-mono">{files.length}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Lines:</span>
          <span className="text-slate-400 font-mono">{totalLines}</span>
        </div>
        <div className="flex justify-between">
          <span>Bundle Size:</span>
          <span className="text-slate-400 font-mono">{(totalBytes / 1024).toFixed(1)} KB</span>
        </div>
      </div>
    </aside>
  );
};
