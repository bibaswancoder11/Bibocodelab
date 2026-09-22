import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + Enter / Cmd + Enter', desc: 'Run code and refresh live preview' },
    { key: 'Ctrl + S / Cmd + S', desc: 'Save files to browser local storage' },
    { key: 'Ctrl + F / Cmd + F', desc: 'Open Find & Replace toolbar' },
    { key: 'Tab', desc: 'Indent 2 spaces (or indent selected lines)' },
    { key: 'Shift + Tab', desc: 'Outdent 2 spaces (or outdent selected lines)' },
    { key: 'Enter', desc: 'Auto-indent to match previous line indentation' },
    { key: '{ } ( ) [ ] " \' `', desc: 'Auto-close matching brackets and quotation marks' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-[#121622] border border-[#263147] rounded-2xl p-6 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-[#20283a]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="divide-y divide-[#1e273a] my-4">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400">{s.desc}</span>
              <kbd className="px-2 py-1 bg-[#182030] border border-[#29364d] rounded text-[11px] font-mono text-indigo-300 shrink-0">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
