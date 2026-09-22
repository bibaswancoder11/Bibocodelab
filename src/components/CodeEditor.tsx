import React, { useEffect, useRef, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-json';
import { EditorPosition, ProjectFile } from '../types';
import { Search, X, Replace, ChevronDown, ChevronUp } from 'lucide-react';

interface CodeEditorProps {
  file: ProjectFile;
  onChange: (value: string) => void;
  onCursorChange: (pos: EditorPosition) => void;
  onSave: () => void;
  onRun: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  file,
  onChange,
  onCursorChange,
  onSave,
  onRun,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Search & Replace state
  const [showFind, setShowFind] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [matchCount, setMatchCount] = useState(0);

  // Detect touch/mobile environment to prevent invisible text on mobile keyboards/WebViews
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    setIsTouchDevice(
      typeof window !== 'undefined' &&
        ('ontouchstart' in window || navigator.maxTouchPoints > 0)
    );
  }, []);

  const lines = file.content.split('\n');
  const totalLines = lines.length;

  // Track cursor position
  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const text = textareaRef.current.value;
    const selStart = textareaRef.current.selectionStart;
    const textBeforeCursor = text.substring(0, selStart);
    const lineArray = textBeforeCursor.split('\n');
    const currentLine = lineArray.length;
    const currentColumn = lineArray[lineArray.length - 1].length + 1;
    onCursorChange({ line: currentLine, column: currentColumn });
  };

  // Scroll synchronization
  const handleScroll = () => {
    if (!textareaRef.current) return;
    const top = textareaRef.current.scrollTop;
    const left = textareaRef.current.scrollLeft;

    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = top;
    }
    if (highlightRef.current) {
      highlightRef.current.scrollTop = top;
      highlightRef.current.scrollLeft = left;
    }
  };

  // Synchronize scroll on file change
  useEffect(() => {
    handleScroll();
    updateCursorPosition();
  }, [file.id, file.content]);

  // Key shortcuts & code ergonomics (Tab, Auto-Indent, Auto-Closing)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Run shortcut: Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun();
      return;
    }

    // Save shortcut: Ctrl+S or Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      onSave();
      return;
    }

    // Find shortcut: Ctrl+F or Cmd+F
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      setShowFind(true);
      return;
    }

    const { selectionStart, selectionEnd, value } = textarea;

    // Tab & Shift+Tab handling (2 spaces)
    if (e.key === 'Tab') {
      e.preventDefault();
      const tabStr = '  ';

      if (selectionStart === selectionEnd) {
        if (e.shiftKey) {
          // Outdent single line
          const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
          if (value.startsWith('  ', lineStart)) {
            const nextVal = value.substring(0, lineStart) + value.substring(lineStart + 2);
            onChange(nextVal);
            setTimeout(() => {
              textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, selectionStart - 2);
            }, 0);
          }
        } else {
          // Normal Tab: Insert 2 spaces
          const nextVal = value.substring(0, selectionStart) + tabStr + value.substring(selectionEnd);
          onChange(nextVal);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = selectionStart + 2;
          }, 0);
        }
      } else {
        // Multi-line indent/outdent
        const startLine = value.lastIndexOf('\n', selectionStart - 1) + 1;
        const endLine = value.indexOf('\n', selectionEnd);
        const effectiveEnd = endLine === -1 ? value.length : endLine;
        const selectedBlock = value.substring(startLine, effectiveEnd);
        const blockLines = selectedBlock.split('\n');

        let modifiedBlock: string[];
        let offset = 0;

        if (e.shiftKey) {
          // Outdent
          modifiedBlock = blockLines.map((l) => {
            if (l.startsWith('  ')) {
              offset -= 2;
              return l.substring(2);
            } else if (l.startsWith(' ')) {
              offset -= 1;
              return l.substring(1);
            }
            return l;
          });
        } else {
          // Indent
          modifiedBlock = blockLines.map((l) => {
            offset += 2;
            return tabStr + l;
          });
        }

        const nextVal = value.substring(0, startLine) + modifiedBlock.join('\n') + value.substring(effectiveEnd);
        onChange(nextVal);
        setTimeout(() => {
          textarea.selectionStart = startLine;
          textarea.selectionEnd = effectiveEnd + offset;
        }, 0);
      }
      return;
    }

    // Auto-indent on Enter
    if (e.key === 'Enter') {
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const currentLineText = value.substring(lineStart, selectionStart);
      const match = currentLineText.match(/^(\s+)/);
      let indent = match ? match[1] : '';

      // If line ends with opening brace, increase indent
      const isBraceOpen = /[{\[(:]\s*$/.test(currentLineText);
      if (isBraceOpen) {
        indent += '  ';
      }

      e.preventDefault();
      const insert = '\n' + indent;
      const nextVal = value.substring(0, selectionStart) + insert + value.substring(selectionEnd);
      onChange(nextVal);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + insert.length;
      }, 0);
      return;
    }

    // Auto-closing brackets & quotes
    const pairs: Record<string, string> = {
      '{': '}',
      '(': ')',
      '[': ']',
      '"': '"',
      "'": "'",
      '`': '`',
    };

    if (pairs[e.key] && selectionStart === selectionEnd) {
      const closing = pairs[e.key];
      // Only auto-close quotes if not already followed by non-whitespace
      const nextChar = value.charAt(selectionStart);
      if (['"', "'", '`'].includes(e.key) && nextChar === e.key) {
        // Skip over existing quote
        e.preventDefault();
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
        return;
      }

      e.preventDefault();
      const nextVal = value.substring(0, selectionStart) + e.key + closing + value.substring(selectionEnd);
      onChange(nextVal);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
      }, 0);
      return;
    }

    // Skip over closing bracket if typed
    if ([')', '}', ']'].includes(e.key) && selectionStart === selectionEnd) {
      if (value.charAt(selectionStart) === e.key) {
        e.preventDefault();
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
        return;
      }
    }
  };

  // Highlighted HTML string with Prism with fallback
  const getHighlightedHtml = () => {
    try {
      let grammar = Prism.languages.markup;
      let lang: string = file.language;
      if (file.language === 'javascript') grammar = Prism.languages.javascript || Prism.languages.markup;
      else if (file.language === 'css') grammar = Prism.languages.css || Prism.languages.markup;
      else if (file.language === 'json') grammar = Prism.languages.json || Prism.languages.javascript || Prism.languages.markup;
      else {
        grammar = Prism.languages.markup;
        lang = 'markup';
      }

      let highlighted = Prism.highlight(file.content || '', grammar, lang);
      if (file.content.endsWith('\n')) {
        highlighted += ' ';
      }
      return highlighted;
    } catch {
      return (file.content || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  };

  // Find & Replace actions
  const handleFind = () => {
    if (!searchQuery) {
      setMatchCount(0);
      return;
    }
    const matches = file.content.split(searchQuery).length - 1;
    setMatchCount(matches);
  };

  useEffect(() => {
    handleFind();
  }, [searchQuery, file.content]);

  const handleReplaceAll = () => {
    if (!searchQuery) return;
    const updated = file.content.split(searchQuery).join(replaceQuery);
    onChange(updated);
  };

  return (
    <div className="relative flex flex-col flex-1 h-full min-h-0 min-w-0 bg-[#0a0d14] overflow-hidden">
      {/* Optional Find / Replace Bar */}
      {showFind && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#121722] border-b border-[#232b3c] z-20 text-xs animate-in fade-in">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Find in file..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#0b0e14] text-slate-200 border border-[#2b3548] rounded px-2 py-1 outline-none focus:border-indigo-500 w-44"
            autoFocus
          />
          <span className="text-slate-400 font-mono text-[11px] min-w-[50px]">
            {searchQuery ? `${matchCount} found` : ''}
          </span>
          <input
            type="text"
            placeholder="Replace with..."
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            className="bg-[#0b0e14] text-slate-200 border border-[#2b3548] rounded px-2 py-1 outline-none focus:border-indigo-500 w-44"
          />
          <button
            onClick={handleReplaceAll}
            className="px-2 py-1 bg-[#1e2638] hover:bg-[#2a354c] text-slate-200 rounded font-medium flex items-center gap-1"
            title="Replace All"
          >
            <Replace className="w-3 h-3" />
            Replace All
          </button>
          <button
            onClick={() => setShowFind(false)}
            className="p-1 text-slate-400 hover:text-white ml-auto"
            title="Close find"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editor Body with Gutter & Textarea/Highlight layer */}
      <div className="relative flex flex-1 h-full min-h-0 overflow-hidden font-mono text-[13px] leading-[1.65]">
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          className="w-12 shrink-0 py-3 pr-2.5 text-right select-none bg-[#0a0d14] border-r border-[#1a2130] text-[#475569] overflow-hidden"
          style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
        >
          {Array.from({ length: totalLines }, (_, i) => (
            <div key={i + 1} className="h-[21.45px]">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Canvas Container */}
        <div className="relative flex-1 h-full min-h-0 min-w-0 overflow-hidden bg-[#0a0d14]">
          {/* Syntax Highlighted Render (Backdrop) */}
          {!isTouchDevice && (
            <pre
              ref={highlightRef}
              aria-hidden="true"
              className="absolute inset-0 m-0 p-3 pl-4 overflow-hidden pointer-events-none whitespace-pre select-none font-mono text-[13px] leading-[1.65]"
              style={{
                tabSize: 2,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              }}
            >
              <code
                className={`language-${file.language}`}
                dangerouslySetInnerHTML={{ __html: getHighlightedHtml() }}
              />
            </pre>
          )}

          {/* Interactive Textarea (Foreground) */}
          <textarea
            ref={textareaRef}
            value={file.content}
            onChange={(e) => {
              onChange(e.target.value);
              updateCursorPosition();
            }}
            onKeyDown={handleKeyDown}
            onKeyUp={updateCursorPosition}
            onClick={updateCursorPosition}
            onScroll={handleScroll}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className={`absolute inset-0 w-full h-full p-3 pl-4 m-0 resize-none border-0 outline-none bg-transparent caret-[#9d94ff] font-mono text-[13px] leading-[1.65] whitespace-pre overflow-auto z-10 selection:bg-[#6c63ff44] ${
              isTouchDevice ? 'text-slate-200' : 'text-transparent'
            }`}
            style={{
              tabSize: 2,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              WebkitTextFillColor: isTouchDevice ? '#e2e8f0' : 'transparent',
            }}
          />
        </div>
      </div>
    </div>
  );
};
