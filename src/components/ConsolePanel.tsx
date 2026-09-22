import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Trash2, ChevronDown, ChevronUp, Copy, Check, CornerDownLeft, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { ConsoleEntry, ConsoleEntryType } from '../types';

interface ConsolePanelProps {
  entries: ConsoleEntry[];
  onClear: () => void;
  onExecuteEval: (code: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({
  entries,
  onClear,
  onExecuteEval,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [filter, setFilter] = useState<'all' | 'log' | 'warn' | 'error'>('all');
  const [replInput, setReplInput] = useState('');
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new log
  useEffect(() => {
    if (scrollRef.current && !isCollapsed) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries, isCollapsed]);

  const filteredEntries = entries.filter((e) => {
    if (filter === 'all') return true;
    if (filter === 'log') return e.type === 'log' || e.type === 'info' || e.type === 'system';
    if (filter === 'warn') return e.type === 'warn';
    if (filter === 'error') return e.type === 'error';
    return true;
  });

  const errorCount = entries.filter((e) => e.type === 'error').length;
  const warnCount = entries.filter((e) => e.type === 'warn').length;

  const handleReplSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const command = replInput.trim();
    if (!command) return;
    onExecuteEval(command);
    setReplInput('');
  };

  const handleCopyLogs = () => {
    const text = entries
      .map((e) => `[${e.timestamp}] [${e.type.toUpperCase()}] ${e.messages.join(' ')}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={`flex flex-col border-t border-[#1e2535] bg-[#090c13] transition-all duration-200 shrink-0 ${
        isCollapsed ? 'h-9' : 'h-48'
      }`}
    >
      {/* Console Header Bar */}
      <div className="flex items-center justify-between h-9 px-3 bg-[#0d111a] border-b border-[#1b2230] select-none text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleCollapse}
            className="flex items-center gap-1.5 font-bold tracking-wider text-slate-300 hover:text-white"
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>CONSOLE</span>
            {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Quick counts */}
          {!isCollapsed && (
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({entries.length})
              </button>
              <button
                onClick={() => setFilter('log')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  filter === 'log' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Logs
              </button>
              <button
                onClick={() => setFilter('warn')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  filter === 'warn' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                {warnCount}
              </button>
              <button
                onClick={() => setFilter('error')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  filter === 'error' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-rose-300'
                }`}
              >
                <AlertCircle className="w-3 h-3 text-rose-400" />
                {errorCount}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isCollapsed && entries.length > 0 && (
            <button
              onClick={handleCopyLogs}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
              title="Copy all logs"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}

          <button
            onClick={onClear}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
            title="Clear Console"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Console Output Body */}
      {!isCollapsed && (
        <div className="flex flex-col flex-1 min-h-0">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 font-mono text-[12px] leading-relaxed space-y-1">
            {filteredEntries.length === 0 ? (
              <div className="text-slate-500 italic py-2 px-1 text-[11px]">
                Console is empty. Run your code or execute commands below.
              </div>
            ) : (
              filteredEntries.map((item, index) => {
                let badgeColor = 'text-slate-400';
                let rowBg = 'hover:bg-slate-900/60';
                let border = 'border-transparent';

                if (item.type === 'error') {
                  badgeColor = 'text-rose-400';
                  rowBg = 'bg-rose-950/20 hover:bg-rose-950/30';
                  border = 'border-rose-800/30';
                } else if (item.type === 'warn') {
                  badgeColor = 'text-amber-400';
                  rowBg = 'bg-amber-950/20 hover:bg-amber-950/30';
                  border = 'border-amber-800/30';
                } else if (item.type === 'system') {
                  badgeColor = 'text-indigo-400';
                }

                return (
                  <div
                    key={`${item.id}-${index}`}
                    className={`flex items-start gap-2 py-0.5 px-1.5 rounded border ${border} ${rowBg}`}
                  >
                    <span className="text-[10px] text-slate-500 shrink-0 font-sans mt-0.5 select-none">
                      {item.timestamp}
                    </span>
                    <div className="flex-1 min-w-0 break-words whitespace-pre-wrap">
                      {item.messages.map((msg, mIdx) => (
                        <span key={mIdx} className={`${badgeColor} mr-2`}>
                          {msg}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Interactive REPL Prompt */}
          <form
            onSubmit={handleReplSubmit}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-[#0e121a] border-t border-[#1b2230]"
          >
            <span className="text-indigo-400 font-mono text-xs select-none">›</span>
            <input
              type="text"
              value={replInput}
              onChange={(e) => setReplInput(e.target.value)}
              placeholder="Evaluate JavaScript in live sandbox..."
              className="flex-1 bg-transparent text-slate-200 font-mono text-xs outline-none placeholder:text-slate-600"
            />
            <button
              type="submit"
              disabled={!replInput.trim()}
              className="p-1 rounded text-slate-400 hover:text-indigo-300 disabled:opacity-30"
              title="Evaluate expression"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
