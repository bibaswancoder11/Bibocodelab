import React from 'react';
import { EditorPosition } from '../types';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface StatusBarProps {
  cursorPosition: EditorPosition;
  activeLanguage: string;
  hasUnsavedChanges: boolean;
  charCount: number;
  isExecuting: boolean;
  isAutoRun: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  cursorPosition,
  activeLanguage,
  hasUnsavedChanges,
  charCount,
  isExecuting,
  isAutoRun,
}) => {
  return (
    <footer className="h-7 bg-[#584ee3] text-white px-3 flex items-center justify-between text-[11px] select-none shrink-0 font-medium">
      {/* Left items */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          {isExecuting ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin text-white" />
              <span>Running...</span>
            </>
          ) : hasUnsavedChanges ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_6px_#fde047]" />
              <span>Unsaved changes</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-300" />
              <span>Saved locally</span>
            </>
          )}
        </div>

        <span className="opacity-40">|</span>
        <span className="hidden sm:inline">UTF-8</span>
        <span className="opacity-40 hidden sm:inline">|</span>
        <span className="uppercase">{activeLanguage}</span>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-3">
        <span className="hidden md:inline">{charCount} chars</span>
        <span className="opacity-40 hidden md:inline">|</span>
        <span className="font-mono">
          Ln {cursorPosition.line}, Col {cursorPosition.column}
        </span>
        <span className="opacity-40">|</span>
        <span className="hidden sm:inline font-bold">BiboCodeLab Studio</span>
      </div>
    </footer>
  );
};
