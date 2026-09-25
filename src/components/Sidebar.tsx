import React, { useState, useRef, useEffect } from 'react';
import {
  Folder,
  FolderOpen,
  FolderPlus,
  FilePlus,
  Trash2,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronRight,
  Edit2,
  Check,
  X,
  Search,
  FileCode2,
} from 'lucide-react';
import { ProjectFile, ProjectFolder } from '../types';

interface SidebarProps {
  projectName: string;
  files: ProjectFile[];
  folders: ProjectFolder[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onAddFile: (name: string, folderId?: string | null) => void;
  onDeleteFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onAddFolder: (name: string, parentId?: string | null) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onOpenTemplates: () => void;
  onOpenShortcuts: () => void;
}

interface CreatePromptState {
  type: 'file' | 'folder';
  targetFolderId: string | null;
}

interface RenamingState {
  type: 'file' | 'folder';
  id: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  projectName,
  files,
  folders,
  activeFileId,
  onSelectFile,
  onAddFile,
  onDeleteFile,
  onRenameFile,
  onAddFolder,
  onDeleteFolder,
  onRenameFolder,
  onOpenTemplates,
  onOpenShortcuts,
}) => {
  const [createPrompt, setCreatePrompt] = useState<CreatePromptState | null>(null);
  const [itemNameInput, setItemNameInput] = useState('');
  const [isRootExpanded, setIsRootExpanded] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Renaming state
  const [renamingItem, setRenamingItem] = useState<RenamingState | null>(null);
  const [renameInputValue, setRenameInputValue] = useState('');

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    return new Set(folders.map((f) => f.id));
  });

  // Shortcut Ctrl+P or Cmd+P to quickly focus search in sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Don't collapse if we are renaming this folder
    if (renamingItem?.type === 'folder' && renamingItem.id === folderId) return;

    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const getFileIcon = (file: ProjectFile) => {
    if (file.language === 'html') {
      return <span className="text-rose-400 font-bold text-[11px] w-4 text-center shrink-0">H</span>;
    }
    if (file.language === 'css') {
      return <span className="text-sky-400 font-bold text-[11px] w-4 text-center shrink-0">#</span>;
    }
    if (file.language === 'javascript') {
      return <span className="text-amber-400 font-bold text-[11px] w-4 text-center shrink-0">JS</span>;
    }
    return <span className="text-emerald-400 font-bold text-[11px] w-4 text-center shrink-0">{}</span>;
  };

  // Helper to resolve folder path string for a file (e.g. "components/buttons")
  const getFileFolderPath = (folderId?: string | null): string => {
    if (!folderId) return '';
    const parts: string[] = [];
    let currentId: string | null | undefined = folderId;
    while (currentId) {
      const currentFolder = folders.find((f) => f.id === currentId);
      if (currentFolder) {
        parts.unshift(currentFolder.name);
        currentId = currentFolder.parentId;
      } else {
        break;
      }
    }
    return parts.join('/');
  };

  const handleStartCreate = (type: 'file' | 'folder', targetFolderId: string | null = null, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (targetFolderId) {
      setExpandedFolders((prev) => new Set(prev).add(targetFolderId));
    }
    setCreatePrompt({ type, targetFolderId });
    setItemNameInput('');
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = itemNameInput.trim();
    if (!trimmed || !createPrompt) return;

    if (createPrompt.type === 'file') {
      onAddFile(trimmed, createPrompt.targetFolderId);
    } else {
      onAddFolder(trimmed, createPrompt.targetFolderId);
    }

    setCreatePrompt(null);
    setItemNameInput('');
  };

  // Start renaming an item
  const handleStartRename = (type: 'file' | 'folder', id: string, currentName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRenamingItem({ type, id });
    setRenameInputValue(currentName);
  };

  // Submit rename
  const handleSubmitRename = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!renamingItem) return;

    const trimmed = renameInputValue.trim();
    if (trimmed) {
      if (renamingItem.type === 'file') {
        onRenameFile(renamingItem.id, trimmed);
      } else {
        onRenameFolder(renamingItem.id, trimmed);
      }
    }
    setRenamingItem(null);
    setRenameInputValue('');
  };

  // Cancel rename
  const handleCancelRename = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRenamingItem(null);
    setRenameInputValue('');
  };

  // Highlight matching search text
  const renderHighlightedName = (text: string, query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return text;
    const index = text.toLowerCase().indexOf(q);
    if (index === -1) return text;
    return (
      <>
        {text.substring(0, index)}
        <span className="bg-indigo-500/40 text-indigo-200 font-bold px-0.5 rounded">
          {text.substring(index, index + q.length)}
        </span>
        {text.substring(index + q.length)}
      </>
    );
  };

  // Total lines and byte statistics
  const totalLines = files.reduce((acc, f) => acc + f.content.split('\n').length, 0);
  const totalBytes = files.reduce((acc, f) => acc + new Blob([f.content]).size, 0);

  // Search results filtering
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isSearching = Boolean(normalizedQuery);
  const searchResults = isSearching
    ? files.filter((f) => {
        const nameMatch = f.name.toLowerCase().includes(normalizedQuery);
        const pathMatch = getFileFolderPath(f.folderId).toLowerCase().includes(normalizedQuery);
        return nameMatch || pathMatch;
      })
    : [];

  // Render a single file row
  const renderFileRow = (file: ProjectFile, showPath = false) => {
    const isActive = file.id === activeFileId;
    const isRenamingThis = renamingItem?.type === 'file' && renamingItem.id === file.id;
    const folderPath = getFileFolderPath(file.folderId);

    if (isRenamingThis) {
      return (
        <form
          key={file.id}
          onSubmit={handleSubmitRename}
          className="flex items-center gap-1.5 px-2 py-1 bg-[#131b29] border border-indigo-500 rounded my-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          {getFileIcon(file)}
          <input
            type="text"
            value={renameInputValue}
            onChange={(e) => setRenameInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') handleCancelRename();
            }}
            onBlur={() => handleSubmitRename()}
            className="flex-1 min-w-0 bg-[#0a0d14] text-slate-100 text-xs px-1.5 py-0.5 rounded border border-[#2d3a52] outline-none focus:border-indigo-400 font-mono"
            autoFocus
          />
          <button
            type="submit"
            className="p-1 hover:text-emerald-400 text-emerald-500"
            title="Confirm rename (Enter)"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCancelRename}
            className="p-1 hover:text-slate-200 text-slate-400"
            title="Cancel (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      );
    }

    return (
      <div
        key={file.id}
        onClick={() => onSelectFile(file.id)}
        onDoubleClick={(e) => handleStartRename('file', file.id, file.name, e)}
        className={`group flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors ${
          isActive
            ? 'bg-[#1b2333] text-white font-medium shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-[#141b27]'
        }`}
        title={`Double-click to rename${folderPath ? ` (${folderPath}/${file.name})` : ''}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {getFileIcon(file)}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="truncate text-xs text-slate-200">
              {isSearching ? renderHighlightedName(file.name, searchQuery) : file.name}
            </span>
            {showPath && folderPath && (
              <span className="text-[10px] text-slate-500 truncate font-mono">
                {folderPath}
              </span>
            )}
          </div>
        </div>

        {/* Action icons on hover */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
          {/* Rename file button */}
          <button
            onClick={(e) => handleStartRename('file', file.id, file.name, e)}
            className="p-1 hover:text-indigo-300 text-slate-500 hover:bg-[#1c2638] rounded"
            title={`Rename ${file.name}`}
          >
            <Edit2 className="w-3 h-3" />
          </button>

          {/* Delete file button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFile(file.id);
            }}
            className="p-1 hover:text-rose-400 text-slate-500 hover:bg-rose-500/10 rounded"
            title={`Delete ${file.name}`}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  // Recursive folder node renderer
  const renderFolderNode = (folder: ProjectFolder, level = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const childFolders = folders.filter((f) => f.parentId === folder.id);
    const childFiles = files.filter((f) => f.folderId === folder.id);
    const isCreatingHere = createPrompt && createPrompt.targetFolderId === folder.id;
    const isRenamingThis = renamingItem?.type === 'folder' && renamingItem.id === folder.id;

    return (
      <div key={folder.id} className="space-y-0.5">
        {/* Folder header row */}
        {isRenamingThis ? (
          <form
            onSubmit={handleSubmitRename}
            className="flex items-center gap-1.5 px-2 py-1 bg-[#131b29] border border-amber-500/70 rounded my-0.5"
            style={{ marginLeft: `${Math.max(4, level * 10)}px` }}
            onClick={(e) => e.stopPropagation()}
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <input
              type="text"
              value={renameInputValue}
              onChange={(e) => setRenameInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleCancelRename();
              }}
              onBlur={() => handleSubmitRename()}
              className="flex-1 min-w-0 bg-[#0a0d14] text-slate-100 text-xs px-1.5 py-0.5 rounded border border-[#2d3a52] outline-none focus:border-amber-400 font-mono"
              autoFocus
            />
            <button
              type="submit"
              className="p-1 hover:text-emerald-400 text-emerald-500"
              title="Confirm rename (Enter)"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleCancelRename}
              className="p-1 hover:text-slate-200 text-slate-400"
              title="Cancel (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <div
            onClick={(e) => toggleFolder(folder.id, e)}
            onDoubleClick={(e) => handleStartRename('folder', folder.id, folder.name, e)}
            className="group flex items-center justify-between px-2 py-1.5 rounded text-slate-300 hover:bg-[#141b27] cursor-pointer transition-colors"
            style={{ paddingLeft: `${Math.max(8, level * 12 + 8)}px` }}
            title="Double-click to rename folder"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              ) : (
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              )}
              {isExpanded ? (
                <FolderOpen className="w-3.5 h-3.5 text-amber-400/90 shrink-0" />
              ) : (
                <Folder className="w-3.5 h-3.5 text-amber-400/70 shrink-0" />
              )}
              <span className="truncate text-xs font-medium text-slate-200">{folder.name}</span>
            </div>

            {/* Folder action buttons */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleStartCreate('file', folder.id, e)}
                className="p-1 hover:text-indigo-300 text-slate-400 hover:bg-[#1a2336] rounded"
                title="Add file inside this folder"
              >
                <FilePlus className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => handleStartCreate('folder', folder.id, e)}
                className="p-1 hover:text-indigo-300 text-slate-400 hover:bg-[#1a2336] rounded"
                title="Add subfolder"
              >
                <FolderPlus className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => handleStartRename('folder', folder.id, folder.name, e)}
                className="p-1 hover:text-amber-300 text-slate-400 hover:bg-[#1a2336] rounded"
                title={`Rename folder "${folder.name}"`}
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFolder(folder.id);
                }}
                className="p-1 hover:text-rose-400 text-slate-400 hover:bg-rose-500/10 rounded"
                title={`Delete folder "${folder.name}" and contents`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Inline create input if targeted to this folder */}
        {isCreatingHere && (
          <form
            onSubmit={handleSubmitCreate}
            className="p-2 ml-4 my-1 border border-indigo-500/40 rounded bg-[#131926]"
          >
            <div className="flex items-center gap-1 text-[10px] text-indigo-300 font-semibold mb-1">
              {createPrompt.type === 'file' ? (
                <>
                  <FilePlus className="w-3 h-3" />
                  <span>New File in {folder.name}</span>
                </>
              ) : (
                <>
                  <FolderPlus className="w-3 h-3" />
                  <span>New Subfolder in {folder.name}</span>
                </>
              )}
            </div>
            <input
              type="text"
              placeholder={createPrompt.type === 'file' ? 'e.g. component.js, style.css' : 'e.g. subfolder'}
              value={itemNameInput}
              onChange={(e) => setItemNameInput(e.target.value)}
              className="w-full bg-[#0a0d14] text-slate-200 border border-[#2b364c] rounded px-2 py-1 text-xs outline-none focus:border-indigo-500"
              autoFocus
            />
            <div className="flex justify-end gap-1.5 mt-1.5">
              <button
                type="button"
                onClick={() => setCreatePrompt(null)}
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

        {/* Children if expanded */}
        {isExpanded && (
          <div className="pl-3 border-l border-[#1a2232] ml-3 space-y-0.5">
            {childFolders.map((childFolder) => renderFolderNode(childFolder, level + 1))}
            {childFiles.map((childFile) => renderFileRow(childFile))}
            {childFolders.length === 0 && childFiles.length === 0 && !isCreatingHere && (
              <div className="px-2 py-1 text-[10px] text-slate-500 italic">Empty folder</div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Top-level folders (parentId is null or empty)
  const rootFolders = folders.filter((f) => !f.parentId);
  // Top-level files (folderId is null or empty)
  const rootFiles = files.filter((f) => !f.folderId);

  return (
    <aside className="w-60 bg-[#0c0f16] border-r border-[#1a2130] flex flex-col h-full select-none text-xs shrink-0">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-[#1a2130]">
        <span className="font-bold tracking-wider text-[10px] text-slate-400 uppercase">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => handleStartCreate('file', null, e)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#182132] transition-colors"
            title="Create new file at root"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => handleStartCreate('folder', null, e)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#182132] transition-colors"
            title="Create new folder at root"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Search Input */}
      <div className="px-2.5 py-2 border-b border-[#1a2130] bg-[#090d14]">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search files... (Ctrl+P)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSearchQuery('');
            }}
            className="w-full bg-[#121724] text-slate-200 placeholder-slate-500 text-xs pl-7 pr-7 py-1 rounded-md border border-[#212b3e] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              className="absolute right-1.5 p-0.5 text-slate-400 hover:text-white hover:bg-[#1b2537] rounded"
              title="Clear search (Esc)"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Root Create Form (if active at root) */}
      {createPrompt && createPrompt.targetFolderId === null && (
        <form onSubmit={handleSubmitCreate} className="p-2 border-b border-[#1e273a] bg-[#121824]">
          <div className="flex items-center gap-1 text-[10px] text-indigo-300 font-semibold mb-1">
            {createPrompt.type === 'file' ? (
              <>
                <FilePlus className="w-3 h-3" />
                <span>New Root File</span>
              </>
            ) : (
              <>
                <FolderPlus className="w-3 h-3" />
                <span>New Root Folder</span>
              </>
            )}
          </div>
          <input
            type="text"
            placeholder={createPrompt.type === 'file' ? 'e.g. data.json, app.js' : 'e.g. components, utils'}
            value={itemNameInput}
            onChange={(e) => setItemNameInput(e.target.value)}
            className="w-full bg-[#0a0d14] text-slate-200 border border-[#2b364c] rounded px-2 py-1 text-xs outline-none focus:border-indigo-500"
            autoFocus
          />
          <div className="flex justify-end gap-1.5 mt-1.5">
            <button
              type="button"
              onClick={() => setCreatePrompt(null)}
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

      {/* Files & Folders Tree OR Search Results View */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isSearching ? (
          /* Search Results Display */
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>Matches ({searchResults.length})</span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-indigo-400 hover:text-indigo-300 capitalize text-[10px]"
              >
                Clear
              </button>
            </div>

            {searchResults.length > 0 ? (
              <div className="space-y-0.5">
                {searchResults.map((file) => renderFileRow(file, true))}
              </div>
            ) : (
              <div className="py-8 px-3 text-center text-slate-500 space-y-2">
                <FileCode2 className="w-6 h-6 mx-auto text-slate-600 stroke-[1.5]" />
                <p className="text-xs text-slate-400 font-medium">No files found</p>
                <p className="text-[11px] text-slate-500">
                  No match for "<span className="text-slate-300">{searchQuery}</span>"
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs px-2.5 py-1 bg-[#151c2a] hover:bg-[#1e273a] text-indigo-300 border border-indigo-900/40 rounded transition-colors"
                >
                  Reset filter
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Normal Explorer Tree */
          <>
            {/* Project root folder entry */}
            <div className="flex items-center justify-between px-2 py-1 rounded text-slate-300 hover:bg-[#141b27] group">
              <div
                onClick={() => setIsRootExpanded(!isRootExpanded)}
                className="flex items-center gap-1.5 cursor-pointer font-medium min-w-0"
              >
                {isRootExpanded ? (
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                )}
                <Folder className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">{projectName}</span>
              </div>

              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleStartCreate('file', null, e)}
                  className="p-1 hover:text-indigo-300 text-slate-400 rounded"
                  title="Add file at root"
                >
                  <FilePlus className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => handleStartCreate('folder', null, e)}
                  className="p-1 hover:text-indigo-300 text-slate-400 rounded"
                  title="Add folder at root"
                >
                  <FolderPlus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {isRootExpanded && (
              <div className="pl-2 space-y-0.5">
                {/* Render Folders first */}
                {rootFolders.map((folder) => renderFolderNode(folder, 0))}

                {/* Render Root Files */}
                {rootFiles.map((file) => renderFileRow(file))}
              </div>
            )}
          </>
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
          <span>Folders:</span>
          <span className="text-slate-400 font-mono">{folders.length}</span>
        </div>
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
