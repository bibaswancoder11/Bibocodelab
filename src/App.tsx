import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProjectFile, ProjectFolder, ConsoleEntry, DeviceMode, MobileTab, EditorPosition, Template } from './types';
import { STARTER_TEMPLATES } from './data/templates';
import { buildExecutableDocument } from './utils/compiler';
import { formatCode } from './utils/formatCode';
import { processUploadedFolder, readFileContent, getLanguageFromFileName } from './utils/fileUpload';
import { Topbar } from './components/Topbar';
import { Sidebar } from './components/Sidebar';
import { EditorTabs } from './components/EditorTabs';
import { CodeEditor } from './components/CodeEditor';
import { PreviewPanel } from './components/PreviewPanel';
import { ConsolePanel } from './components/ConsolePanel';
import { StatusBar } from './components/StatusBar';
import { NewProjectModal } from './components/NewProjectModal';
import { TemplatesModal } from './components/TemplatesModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { generateUniqueId } from './utils/id';

const STORAGE_KEY_FILES = 'bibo-studio-files-v2';
const STORAGE_KEY_FOLDERS = 'bibo-studio-folders-v1';
const STORAGE_KEY_NAME = 'bibo-studio-project-name';
const STORAGE_KEY_AUTORUN = 'bibo-studio-autorun';

export default function App() {
  // Initialize files from storage or default template
  const [files, setFiles] = useState<ProjectFile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FILES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // Check legacy single-item keys
      const oldHtml = localStorage.getItem('bibo-html');
      const oldCss = localStorage.getItem('bibo-css');
      const oldJs = localStorage.getItem('bibo-js');
      if (oldHtml || oldCss || oldJs) {
        return [
          { id: 'html', name: 'index.html', language: 'html', content: oldHtml || STARTER_TEMPLATES[0].files.html, isDeletable: false },
          { id: 'css', name: 'style.css', language: 'css', content: oldCss || STARTER_TEMPLATES[0].files.css, isDeletable: true },
          { id: 'js', name: 'script.js', language: 'javascript', content: oldJs || STARTER_TEMPLATES[0].files.js, isDeletable: true },
        ];
      }
    } catch (e) {
      // Fallback
    }
    return [
      { id: 'html', name: 'index.html', language: 'html', content: STARTER_TEMPLATES[0].files.html, isDeletable: false },
      { id: 'css', name: 'style.css', language: 'css', content: STARTER_TEMPLATES[0].files.css, isDeletable: true },
      { id: 'js', name: 'script.js', language: 'javascript', content: STARTER_TEMPLATES[0].files.js, isDeletable: true },
    ];
  });

  // Initialize folders from storage
  const [folders, setFolders] = useState<ProjectFolder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FOLDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // Fallback
    }
    return [];
  });

  const [projectName, setProjectName] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_NAME) || 'my-first-project';
  });

  const [activeFileId, setActiveFileId] = useState<string>('html');
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [mobileTab, setMobileTab] = useState<MobileTab>('split');
  const [isAutoRun, setIsAutoRun] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_AUTORUN) !== 'false';
  });
  const [cursorPosition, setCursorPosition] = useState<EditorPosition>({ line: 1, column: 1 });

  // Split-pane resizer state (percentage for editor width)
  const [splitPercent, setSplitPercent] = useState<number>(55);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Modals & Toasts
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState<boolean>(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Execution tracking
  const runCounterRef = useRef<number>(0);
  const [compiledDoc, setCompiledDoc] = useState<string>('');

  // Toast trigger helper
  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = generateUniqueId('toast');
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2400);
  };

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  // Core Runner Function (Single Preview Guarantee)
  const executeCode = useCallback(() => {
    setIsExecuting(true);
    runCounterRef.current += 1;
    const currentRunId = runCounterRef.current;

    const htmlContent = files.find((f) => f.id === 'html')?.content || files.find((f) => f.language === 'html')?.content || '';
    const cssContent = files.find((f) => f.id === 'css')?.content || '';
    const jsContent = files.find((f) => f.id === 'js')?.content || '';

    // Extra modular files inside custom folders or custom names
    const extraFiles = files
      .filter((f) => f.id !== 'html' && f.id !== 'css' && f.id !== 'js')
      .map((f) => ({ name: f.name, content: f.content, language: f.language }));

    const newDoc = buildExecutableDocument(htmlContent, cssContent, jsContent, currentRunId, extraFiles);
    setCompiledDoc(newDoc);

    // Add execution notice to console
    setConsoleEntries((prev) => [
      ...prev,
      {
        id: generateUniqueId('run_sys'),
        type: 'system',
        messages: ['› Running project...'],
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);

    setTimeout(() => {
      setIsExecuting(false);
    }, 250);
  }, [files]);

  // Initial Run on mount
  useEffect(() => {
    executeCode();
  }, []);

  // Auto-run with debounce when files change
  useEffect(() => {
    if (!isAutoRun) return;
    const timer = setTimeout(() => {
      executeCode();
    }, 450);
    return () => clearTimeout(timer);
  }, [files, isAutoRun, executeCode]);

  // Listen to postMessage from iframe runner
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || event.data.source !== 'bibocodelab-runner') return;

      const { type, messages, time } = event.data;
      setConsoleEntries((prev) => [
        ...prev,
        {
          id: generateUniqueId('log'),
          type: type || 'log',
          messages: Array.isArray(messages) ? messages : [String(messages)],
          timestamp: time || new Date().toLocaleTimeString(),
        },
      ]);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Update file content
  const handleContentChange = (newContent: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === activeFileId ? { ...f, content: newContent } : f))
    );
    setHasUnsavedChanges(true);
  };

  // Manual save to localStorage
  const handleSave = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(files));
      localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders));
      localStorage.setItem(STORAGE_KEY_NAME, projectName);

      // Legacy backup keys for backwards compatibility
      const h = files.find((f) => f.id === 'html')?.content;
      const c = files.find((f) => f.id === 'css')?.content;
      const j = files.find((f) => f.id === 'js')?.content;
      if (h !== undefined) localStorage.setItem('bibo-html', h);
      if (c !== undefined) localStorage.setItem('bibo-css', c);
      if (j !== undefined) localStorage.setItem('bibo-js', j);

      setHasUnsavedChanges(false);
      addToast('success', 'Project saved to browser storage');
    } catch (e) {
      addToast('error', 'Failed to save to local storage');
    }
  }, [files, folders, projectName]);

  // Global keyboard shortcuts (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // Export standalone HTML
  const handleExport = () => {
    const htmlContent = files.find((f) => f.id === 'html')?.content || files.find((f) => f.language === 'html')?.content || '';
    const cssFiles = files.filter((f) => f.language === 'css' || f.name.endsWith('.css'));
    const jsFiles = files.filter((f) => f.language === 'javascript' || f.name.endsWith('.js'));
    const jsonFiles = files.filter((f) => f.language === 'json' || f.name.endsWith('.json'));

    const combinedCss = cssFiles.map((c) => `/* ${c.name} */\n${c.content}`).join('\n\n');
    const combinedJs = jsFiles.map((j) => `// ${j.name}\n${j.content.replace(/<\/script/gi, '<\\/script')}`).join('\n\n');

    let jsonSnippet = '';
    if (jsonFiles.length > 0) {
      jsonSnippet = `<script>window.__DATA__ = ${JSON.stringify(
        jsonFiles.reduce((acc, f) => ({ ...acc, [f.name]: f.content }), {}),
        null,
        2
      )};</script>\n`;
    }

    const standalone = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <style>
${combinedCss}
  </style>
</head>
<body>
${htmlContent}
${jsonSnippet}
  <script>
${combinedJs}
  </script>
</body>
</html>`;

    const blob = new Blob([standalone], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(projectName || 'project').toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    addToast('success', 'Exported HTML project file');
  };

  // Format active code
  const handleFormat = () => {
    const formatted = formatCode(activeFile.content, activeFile.language);
    handleContentChange(formatted);
    addToast('info', `Formatted ${activeFile.name}`);
  };

  // Create folder
  const handleAddFolder = (name: string, parentId: string | null = null) => {
    const id = generateUniqueId('folder');
    const newFolder: ProjectFolder = { id, name, parentId };
    setFolders((prev) => [...prev, newFolder]);
    setHasUnsavedChanges(true);
    addToast('success', `Created folder "${name}"`);
  };

  // Rename folder
  const handleRenameFolder = (folderId: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    const targetFolder = folders.find((f) => f.id === folderId);
    if (!targetFolder || targetFolder.name === trimmed) return;

    const duplicate = folders.some(
      (f) => f.id !== folderId && f.parentId === targetFolder.parentId && f.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      addToast('error', `A folder named "${trimmed}" already exists here`);
      return;
    }

    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, name: trimmed } : f))
    );
    setHasUnsavedChanges(true);
    addToast('success', `Renamed folder to "${trimmed}"`);
  };

  // Delete folder & all its nested contents
  const handleDeleteFolder = (folderId: string) => {
    const getDescendants = (id: string): string[] => {
      const children = folders.filter((f) => f.parentId === id);
      return [id, ...children.flatMap((c) => getDescendants(c.id))];
    };
    const targetFolderIds = new Set(getDescendants(folderId));

    const remainingFiles = files.filter((f) => !f.folderId || !targetFolderIds.has(f.folderId));
    setFolders((prev) => prev.filter((f) => !targetFolderIds.has(f.id)));

    if (remainingFiles.length === 0) {
      const fallbackFile: ProjectFile = {
        id: 'html',
        name: 'index.html',
        language: 'html',
        content: '<!-- Start building -->\n<div class="app">\n  <h1>Hello World</h1>\n</div>',
        isDeletable: true,
      };
      setFiles([fallbackFile]);
      setActiveFileId('html');
    } else {
      setFiles(remainingFiles);
      if (remainingFiles.every((f) => f.id !== activeFileId)) {
        setActiveFileId(remainingFiles[0].id);
      }
    }

    setHasUnsavedChanges(true);
    addToast('info', 'Folder and contents deleted');
  };

  // Create file (in root or folder)
  const handleAddFile = (fileName: string, targetFolderId: string | null = null) => {
    let language: 'html' | 'css' | 'javascript' | 'json' = 'javascript';
    if (fileName.endsWith('.html') || fileName.endsWith('.htm')) language = 'html';
    else if (fileName.endsWith('.css')) language = 'css';
    else if (fileName.endsWith('.json')) language = 'json';

    const id = generateUniqueId('file');
    const newFile: ProjectFile = {
      id,
      name: fileName,
      language,
      content: language === 'json' ? '{\n  "data": []\n}' : '',
      folderId: targetFolderId,
      isDeletable: true,
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(id);
    setHasUnsavedChanges(true);
    addToast('success', `Created file "${fileName}"`);
  };

  // Rename file
  const handleRenameFile = (fileId: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    const targetFile = files.find((f) => f.id === fileId);
    if (!targetFile || targetFile.name === trimmed) return;

    const duplicate = files.some(
      (f) => f.id !== fileId && f.folderId === targetFile.folderId && f.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      addToast('error', `A file named "${trimmed}" already exists here`);
      return;
    }

    // Determine language by extension
    let language: 'html' | 'css' | 'javascript' | 'json' = targetFile.language;
    if (trimmed.endsWith('.html') || trimmed.endsWith('.htm')) language = 'html';
    else if (trimmed.endsWith('.css')) language = 'css';
    else if (trimmed.endsWith('.json')) language = 'json';
    else if (trimmed.endsWith('.js') || trimmed.endsWith('.javascript')) language = 'javascript';

    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, name: trimmed, language } : f))
    );
    setHasUnsavedChanges(true);
    addToast('success', `Renamed file to "${trimmed}"`);
  };

  // Delete file
  const handleDeleteFile = (fileId: string) => {
    const fileToDelete = files.find((f) => f.id === fileId);
    const remaining = files.filter((f) => f.id !== fileId);

    if (remaining.length === 0) {
      // Gracefully maintain a fresh starter file so editor is never broken
      const fallbackFile: ProjectFile = {
        id: generateUniqueId('file'),
        name: 'index.html',
        language: 'html',
        content: '<!-- Start building -->\n<div class="app">\n  <h1>Hello World</h1>\n</div>',
        isDeletable: true,
      };
      setFiles([fallbackFile]);
      setActiveFileId(fallbackFile.id);
    } else {
      setFiles(remaining);
      if (activeFileId === fileId) {
        setActiveFileId(remaining[0].id);
      }
    }
    setHasUnsavedChanges(true);
    addToast('info', `Deleted ${fileToDelete?.name || 'file'}`);
  };

  // Upload individual files from internal device storage
  const handleUploadFiles = async (fileList: FileList | File[], targetFolderId: string | null = null) => {
    const filesArray = Array.from(fileList);
    if (filesArray.length === 0) return;

    try {
      const newProjectFiles: ProjectFile[] = [];

      for (const file of filesArray) {
        const content = await readFileContent(file);
        const language = getLanguageFromFileName(file.name);
        newProjectFiles.push({
          id: generateUniqueId('file'),
          name: file.name,
          language,
          content,
          folderId: targetFolderId,
          isDeletable: true,
        });
      }

      setFiles((prev) => [...prev, ...newProjectFiles]);
      if (newProjectFiles.length > 0) {
        // Switch to the first uploaded file or index.html if present
        const indexFile = newProjectFiles.find((f) => f.name.toLowerCase() === 'index.html');
        setActiveFileId(indexFile ? indexFile.id : newProjectFiles[0].id);
      }
      setHasUnsavedChanges(true);
      addToast('success', `Uploaded ${newProjectFiles.length} file(s) from device`);
    } catch (err) {
      addToast('error', 'Failed to upload files from device');
    }
  };

  // Upload entire directory folder from internal device storage
  const handleUploadFolder = async (fileList: FileList | File[], targetFolderId: string | null = null) => {
    const filesArray = Array.from(fileList);
    if (filesArray.length === 0) return;

    try {
      const { newFolders, newFiles } = await processUploadedFolder(filesArray, folders, targetFolderId);

      if (newFolders.length > 0) {
        setFolders((prev) => [...prev, ...newFolders]);
      }
      if (newFiles.length > 0) {
        setFiles((prev) => [...prev, ...newFiles]);
        const indexFile = newFiles.find((f) => f.name.toLowerCase() === 'index.html');
        setActiveFileId(indexFile ? indexFile.id : newFiles[0].id);
      }

      setHasUnsavedChanges(true);
      addToast(
        'success',
        `Imported folder with ${newFiles.length} file(s)${newFolders.length > 0 ? ` and ${newFolders.length} folder(s)` : ''}`
      );
    } catch (err) {
      addToast('error', 'Failed to import folder from device');
    }
  };

  // Load starter template
  const handleSelectTemplate = (template: Template) => {
    setFolders([]);
    setFiles([
      { id: 'html', name: 'index.html', language: 'html', content: template.files.html, isDeletable: false },
      { id: 'css', name: 'style.css', language: 'css', content: template.files.css, isDeletable: true },
      { id: 'js', name: 'script.js', language: 'javascript', content: template.files.js, isDeletable: true },
    ]);
    setActiveFileId('html');
    setProjectName(template.name.toLowerCase().replace(/\s+/g, '-'));
    setConsoleEntries([]);
    setTimeout(() => {
      executeCode();
    }, 50);
    addToast('success', `Loaded template: ${template.name}`);
  };

  // Reset to blank project
  const handleConfirmBlank = () => {
    setFolders([]);
    setFiles([
      { id: 'html', name: 'index.html', language: 'html', content: '<!-- Start building -->\n<div class="app">\n  <h1>Hello World</h1>\n</div>', isDeletable: false },
      { id: 'css', name: 'style.css', language: 'css', content: 'body {\n  font-family: sans-serif;\n  padding: 20px;\n}', isDeletable: true },
      { id: 'js', name: 'script.js', language: 'javascript', content: 'console.log("Ready to code!");', isDeletable: true },
    ]);
    setActiveFileId('html');
    setConsoleEntries([]);
    setTimeout(() => {
      executeCode();
    }, 50);
    addToast('info', 'Blank project initiated');
  };

  // Evaluate code from console REPL
  const handleExecuteEval = (code: string) => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          target: 'bibocodelab-eval',
          code,
        },
        '*'
      );
    }
  };

  // Pop out preview window safely
  const handlePopout = () => {
    const blob = new Blob([compiledDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
      addToast('info', 'Popups are restricted in this preview frame. Toggling fullscreen mode instead.');
      setIsFullscreen(true);
    } else {
      addToast('success', 'Preview opened in new tab');
    }
  };

  // Toggle live auto-run
  const handleToggleAutoRun = () => {
    const next = !isAutoRun;
    setIsAutoRun(next);
    localStorage.setItem(STORAGE_KEY_AUTORUN, String(next));
    addToast('info', next ? 'Auto-reload enabled (debounced)' : 'Manual run mode enabled');
  };

  // Split-pane dragging handlers
  const handleMouseDown = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const container = document.getElementById('split-container');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const newPercent = ((e.clientX - rect.left) / rect.width) * 100;
      if (newPercent > 20 && newPercent < 80) {
        setSplitPercent(newPercent);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#090c13] text-slate-200 overflow-hidden select-none font-sans">
      {/* Top Application Bar with App Icon & PWA install button */}
      <Topbar
        projectName={projectName}
        onUpdateProjectName={(name) => {
          setProjectName(name);
          localStorage.setItem(STORAGE_KEY_NAME, name);
          addToast('success', `Renamed project to ${name}`);
        }}
        onNewProject={() => setIsNewProjectModalOpen(true)}
        onSave={handleSave}
        onExport={handleExport}
        onFormat={handleFormat}
        onRun={executeCode}
        isExecuting={isExecuting}
        hasUnsavedChanges={hasUnsavedChanges}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        mobileTab={mobileTab}
        onMobileTabChange={setMobileTab}
      />

      {/* Main Studio Workspace */}
      <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
        {/* Left Explorer Sidebar with Folders & Files */}
        {isSidebarOpen && (
          <Sidebar
            projectName={projectName}
            files={files}
            folders={folders}
            activeFileId={activeFileId}
            onSelectFile={(id) => setActiveFileId(id)}
            onAddFile={handleAddFile}
            onDeleteFile={handleDeleteFile}
            onRenameFile={handleRenameFile}
            onAddFolder={handleAddFolder}
            onDeleteFolder={handleDeleteFolder}
            onRenameFolder={handleRenameFolder}
            onUploadFiles={handleUploadFiles}
            onUploadFolder={handleUploadFolder}
            onOpenTemplates={() => setIsTemplatesModalOpen(true)}
            onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
          />
        )}

        {/* Resizable Editor & Preview Split Container */}
        <div id="split-container" className="flex flex-1 min-h-0 min-w-0 overflow-hidden relative">
          {/* Left / Top: Code Editor Column */}
          <div
            className={`flex flex-col h-full min-h-0 min-w-0 overflow-hidden transition-all ${
              mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'
            }`}
            style={{
              width: mobileTab === 'split' ? `${splitPercent}%` : mobileTab === 'editor' ? '100%' : '50%',
            }}
          >
            <EditorTabs
              files={files}
              activeFileId={activeFileId}
              onSelectFile={(id) => setActiveFileId(id)}
              onCloseFile={handleDeleteFile}
              activeFile={activeFile}
              onRenameFile={handleRenameFile}
            />

            <CodeEditor
              file={activeFile}
              onChange={handleContentChange}
              onCursorChange={setCursorPosition}
              onSave={handleSave}
              onRun={executeCode}
            />
          </div>

          {/* Draggable Divider Handle (Desktop) */}
          <div
            onMouseDown={handleMouseDown}
            className={`hidden lg:flex w-1.5 hover:w-2 hover:bg-indigo-500/80 bg-[#161c28] cursor-col-resize z-20 shrink-0 transition-colors items-center justify-center ${
              isDragging ? 'bg-indigo-500 w-2' : ''
            }`}
            title="Drag to resize panels"
          >
            <div className="w-0.5 h-8 bg-slate-600 rounded-full" />
          </div>

          {/* Right / Bottom: Live Preview & Debug Console Column */}
          <div
            className={`flex flex-col h-full min-h-0 min-w-0 overflow-hidden border-l border-[#1a2130] ${
              mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'
            }`}
            style={{
              width: mobileTab === 'split' ? `${100 - splitPercent}%` : mobileTab === 'preview' ? '100%' : '50%',
            }}
          >
            {/* Live Sandbox Output Frame */}
            <div className="flex-1 min-h-0 min-w-0">
              <PreviewPanel
                srcDoc={compiledDoc}
                deviceMode={deviceMode}
                onDeviceModeChange={setDeviceMode}
                onRefresh={executeCode}
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                onPopout={handlePopout}
                isAutoRun={isAutoRun}
                onToggleAutoRun={handleToggleAutoRun}
                isExecuting={isExecuting}
              />
            </div>

            {/* Live Console Output & Interactive REPL */}
            <ConsolePanel
              entries={consoleEntries}
              onClear={() => setConsoleEntries([])}
              onExecuteEval={handleExecuteEval}
              isCollapsed={isConsoleCollapsed}
              onToggleCollapse={() => setIsConsoleCollapsed(!isConsoleCollapsed)}
            />
          </div>
        </div>
      </div>

      {/* Global Status Bar */}
      <StatusBar
        cursorPosition={cursorPosition}
        activeLanguage={activeFile.language}
        hasUnsavedChanges={hasUnsavedChanges}
        charCount={activeFile.content.length}
        isExecuting={isExecuting}
        isAutoRun={isAutoRun}
      />

      {/* Modals & Overlays */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onConfirmBlank={handleConfirmBlank}
        onConfirmDefaultTemplate={() => handleSelectTemplate(STARTER_TEMPLATES[0])}
      />

      <TemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Toast Notification Stack */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
