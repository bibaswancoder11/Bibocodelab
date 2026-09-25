import React, { useState, useEffect } from 'react';
import { ProjectFile } from '../types';
import { X, Edit2, Check, Trash2 } from 'lucide-react';

interface EditorTabsProps {
  files: ProjectFile[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onCloseFile?: (id: string) => void;
  activeFile: ProjectFile;
  onRenameFile?: (id: string, newName: string) => void;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCloseFile,
  activeFile,
  onRenameFile,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(activeFile.name);

  useEffect(() => {
    setNameInput(activeFile.name);
    setIsEditingName(false);
  }, [activeFile.id, activeFile.name]);

  const handleNameSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = nameInput.trim();
    if (trimmed && onRenameFile && trimmed !== activeFile.name) {
      onRenameFile(activeFile.id, trimmed);
    }
    setIsEditingName(false);
  };

  const getFileBadge = (file: ProjectFile) => {
    if (file.language === 'html') {
      return <span className="text-rose-400 font-bold text-[11px]">H</span>;
    }
    if (file.language === 'css') {
      return <span className="text-sky-400 font-bold text-[11px]">#</span>;
    }
    if (file.language === 'javascript') {
      return <span className="text-amber-400 font-bold text-[11px]">JS</span>;
    }
    return <span className="text-emerald-400 font-bold text-[11px]">{}</span>;
  };

  return (
    <div className="flex flex-col shrink-0 select-none">
      {/* Horizontal Tabs Bar */}
      <div className="h-10 bg-[#0d111a] border-b border-[#1b2230] flex items-stretch overflow-x-auto">
        {files.map((file) => {
          const isActive = file.id === activeFileId;
          return (
            <div
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              onDoubleClick={() => {
                if (isActive && onRenameFile) {
                  setNameInput(file.name);
                  setIsEditingName(true);
                }
              }}
              className={`group relative flex items-center gap-2 px-3.5 border-r border-[#1a2130] text-xs cursor-pointer transition-colors whitespace-nowrap min-w-[110px] ${
                isActive
                  ? 'bg-[#0a0d14] text-slate-100 font-medium'
                  : 'bg-[#0d111a] text-slate-400 hover:text-slate-200 hover:bg-[#111722]'
              }`}
              title="Click to view, double-click to rename"
            >
              {getFileBadge(file)}
              <span>{file.name}</span>

              {/* Active Tab Accent Line */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 shadow-[0_-1px_6px_rgba(99,102,241,0.5)]" />
              )}

              {/* Close / Delete file button */}
              {onCloseFile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseFile(file.id);
                  }}
                  className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 p-0.5 ml-auto hover:text-rose-400 text-slate-500 hover:bg-rose-500/10 transition-all rounded"
                  title={`Delete ${file.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Editor Sub-header info */}
      <div className="h-8 px-3 bg-[#0a0d14] border-b border-[#161c28] flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <form onSubmit={handleNameSubmit} className="flex items-center gap-1">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={() => handleNameSubmit()}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsEditingName(false);
                }}
                className="bg-[#151c2a] text-slate-100 text-xs px-1.5 py-0.5 rounded border border-indigo-500 outline-none font-mono"
                autoFocus
              />
              <button type="submit" className="text-emerald-400 hover:text-emerald-300">
                <Check className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (onRenameFile) {
                    setNameInput(activeFile.name);
                    setIsEditingName(true);
                  }
                }}
                className="flex items-center gap-1.5 text-slate-300 hover:text-white font-mono transition-colors group"
                title="Click to rename this file"
              >
                <span>{activeFile.name}</span>
                {onRenameFile && (
                  <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-colors" />
                )}
              </button>

              {onCloseFile && (
                <button
                  onClick={() => onCloseFile(activeFile.id)}
                  className="text-slate-500 hover:text-rose-400 p-0.5 hover:bg-rose-500/10 rounded transition-colors ml-0.5"
                  title={`Delete ${activeFile.name}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          <span className="text-slate-600">|</span>
          <span className="text-slate-500 uppercase">{activeFile.language}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-slate-500 text-[10px]">
            Press <kbd className="px-1.5 py-0.5 bg-[#171e2c] border border-[#273245] rounded text-slate-300 font-mono">Ctrl+Enter</kbd> to run
          </span>
        </div>
      </div>
    </div>
  );
};
