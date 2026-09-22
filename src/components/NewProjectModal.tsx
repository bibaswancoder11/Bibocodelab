import React from 'react';
import { AlertTriangle, FileCode2, Sparkles, X } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmBlank: () => void;
  onConfirmDefaultTemplate: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onConfirmBlank,
  onConfirmDefaultTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-[#121622] border border-[#263147] rounded-2xl p-6 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-[#20283a]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Start New Project</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-3 leading-relaxed">
          Starting a new project will replace your current workspace files. Any unsaved edits will be lost. Choose how you want to begin:
        </p>

        <div className="grid grid-cols-1 gap-2.5 mt-5">
          <button
            onClick={() => {
              onConfirmDefaultTemplate();
              onClose();
            }}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-950/40 text-left transition-colors group"
          >
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" />
            <div>
              <div className="font-semibold text-sm text-white">Reset to Starter Showcase</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Load the default interactive BiboCodeLab sample with working styles and scripts.
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onConfirmBlank();
              onClose();
            }}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-[#232d40] bg-[#171d2b] hover:bg-[#1d2538] text-left transition-colors group"
          >
            <FileCode2 className="w-5 h-5 text-slate-400 shrink-0 group-hover:scale-110 transition-transform" />
            <div>
              <div className="font-semibold text-sm text-white">Completely Blank Project</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Start from a clean slate with blank index.html, style.css, and script.js files.
              </div>
            </div>
          </button>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
