import React from 'react';
import { ProjectFile } from '../types';
import { X, Search } from 'lucide-react';

interface EditorTabsProps {
  files: ProjectFile[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onCloseFile?: (id: string) => void;
  activeFile: ProjectFile;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCloseFile,
  activeFile,
}) => {
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
              className={`group relative flex items-center gap-2 px-3.5 border-r border-[#1a2130] text-xs cursor-pointer transition-colors whitespace-nowrap min-w-[110px] ${
                isActive
                  ? 'bg-[#0a0d14] text-slate-100 font-medium'
                  : 'bg-[#0d111a] text-slate-400 hover:text-slate-200 hover:bg-[#111722]'
              }`}
            >
              {getFileBadge(file)}
              <span>{file.name}</span>

              {/* Active Tab Accent Line */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 shadow-[0_-1px_6px_rgba(99,102,241,0.5)]" />
              )}

              {/* Optional Close for non-core files */}
              {file.isDeletable && onCloseFile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseFile(file.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 ml-auto hover:text-rose-400 transition-opacity rounded"
                  title="Close file"
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
          <span className="text-slate-300 font-mono">{activeFile.name}</span>
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
