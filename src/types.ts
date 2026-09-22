export type FileId = 'html' | 'css' | 'js' | string;

export interface ProjectFile {
  id: string;
  name: string;
  language: 'html' | 'css' | 'javascript' | 'json';
  content: string;
  isDeletable?: boolean;
}

export type ConsoleEntryType = 'log' | 'info' | 'warn' | 'error' | 'system';

export interface ConsoleEntry {
  id: string;
  type: ConsoleEntryType;
  messages: string[];
  timestamp: string;
  count?: number;
}

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export type MobileTab = 'editor' | 'preview' | 'split';

export interface Template {
  id: string;
  name: string;
  description: string;
  tag: string;
  files: {
    html: string;
    css: string;
    js: string;
  };
}

export interface EditorPosition {
  line: number;
  column: number;
}
