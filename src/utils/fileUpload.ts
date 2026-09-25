import { ProjectFile, ProjectFolder } from '../types';
import { generateUniqueId } from './id';

/**
 * Maps file names or extensions to supported syntax languages.
 */
export function getLanguageFromFileName(fileName: string): 'html' | 'css' | 'javascript' | 'json' {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.html') || lower.endsWith('.htm') || lower.endsWith('.svg') || lower.endsWith('.xml')) {
    return 'html';
  }
  if (lower.endsWith('.css') || lower.endsWith('.scss') || lower.endsWith('.less')) {
    return 'css';
  }
  if (lower.endsWith('.json')) {
    return 'json';
  }
  return 'javascript';
}

/**
 * Reads file content from a browser File object.
 * Returns text content for code/markup or DataURL for images.
 */
export async function readFileContent(file: File): Promise<string> {
  if (file.type.startsWith('image/')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error || new Error('Failed to read image'));
      reader.readAsDataURL(file);
    });
  }
  return await file.text();
}

export interface ProcessFolderResult {
  newFolders: ProjectFolder[];
  newFiles: ProjectFile[];
}

/**
 * Processes an uploaded directory hierarchy from webkitRelativePath.
 * Automatically recreates folders and assigns nested files.
 */
export async function processUploadedFolder(
  fileList: FileList | File[],
  existingFolders: ProjectFolder[],
  targetParentFolderId: string | null = null
): Promise<ProcessFolderResult> {
  const filesArray = Array.from(fileList);
  const allFolders: ProjectFolder[] = [...existingFolders];
  const newFiles: ProjectFile[] = [];

  // Path string to folder ID lookup
  const pathMap = new Map<string, string>();

  // Populate map with existing folders
  const getExistingPath = (folder: ProjectFolder): string => {
    if (!folder.parentId) return folder.name;
    const parent = existingFolders.find((f) => f.id === folder.parentId);
    return parent ? `${getExistingPath(parent)}/${folder.name}` : folder.name;
  };
  for (const f of existingFolders) {
    pathMap.set(getExistingPath(f), f.id);
  }

  for (const file of filesArray) {
    const relPath = file.webkitRelativePath || file.name;
    const parts = relPath.split('/').filter(Boolean);

    let currentFolderId: string | null = targetParentFolderId;

    if (parts.length > 1) {
      const dirParts = parts.slice(0, -1);
      let cumulativePath = targetParentFolderId ? (pathMap.get(targetParentFolderId) || '') : '';

      for (let i = 0; i < dirParts.length; i++) {
        const dirName = dirParts[i];
        cumulativePath = cumulativePath ? `${cumulativePath}/${dirName}` : dirName;

        let folderId = pathMap.get(cumulativePath);
        if (!folderId) {
          folderId = generateUniqueId('folder');
          const newFolder: ProjectFolder = {
            id: folderId,
            name: dirName,
            parentId: currentFolderId,
          };
          allFolders.push(newFolder);
          pathMap.set(cumulativePath, folderId);
        }
        currentFolderId = folderId;
      }
    }

    const fileName = parts[parts.length - 1];
    let content = '';
    try {
      content = await readFileContent(file);
    } catch (e) {
      content = `// Error reading file: ${file.name}`;
    }

    newFiles.push({
      id: generateUniqueId('file'),
      name: fileName,
      language: getLanguageFromFileName(fileName),
      content,
      folderId: currentFolderId,
      isDeletable: true,
    });
  }

  const existingFolderIds = new Set(existingFolders.map((f) => f.id));
  const newFolders = allFolders.filter((f) => !existingFolderIds.has(f.id));

  return { newFolders, newFiles };
}
