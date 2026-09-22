import React, { useRef, useEffect } from 'react';
import { RefreshCw, Monitor, Tablet, Smartphone, Maximize2, Minimize2, ExternalLink } from 'lucide-react';
import { DeviceMode } from '../types';

interface PreviewPanelProps {
  srcDoc: string;
  deviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
  onRefresh: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onPopout: () => void;
  isAutoRun: boolean;
  onToggleAutoRun: () => void;
  isExecuting: boolean;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  srcDoc,
  deviceMode,
  onDeviceModeChange,
  onRefresh,
  isFullscreen,
  onToggleFullscreen,
  onPopout,
  isAutoRun,
  onToggleAutoRun,
  isExecuting,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Send interactive eval expression to iframe
  useEffect(() => {
    // Window message listener is configured in compiler
  }, []);

  return (
    <div
      className={`flex flex-col h-full min-h-0 bg-[#0c0f16] ${
        isFullscreen ? 'fixed inset-0 z-50 p-3 bg-[#07090f]/95 backdrop-blur-md' : 'relative'
      }`}
    >
      {/* Top control header */}
      <div className="flex items-center justify-between h-11 px-3 bg-[#0f131c] border-b border-[#1e2535] shrink-0 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200 tracking-wide">Preview</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
            <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${isExecuting ? 'animate-ping' : 'shadow-[0_0_6px_#34d399]'}`} />
            <span>LIVE</span>
          </div>

          {/* Auto-reload badge toggle */}
          <button
            onClick={onToggleAutoRun}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ml-1 border ${
              isAutoRun
                ? 'bg-indigo-950/60 text-indigo-300 border-indigo-700/50'
                : 'bg-[#181f2c] text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Live Auto-Reload on typing (400ms debounce)"
          >
            {isAutoRun ? '⚡ Live Auto-Reload' : '⏸ Manual Run'}
          </button>
        </div>

        {/* Device Switcher & Action Controls */}
        <div className="flex items-center gap-1">
          {/* Responsive viewport selector */}
          <div className="flex items-center bg-[#151a24] border border-[#232c3f] rounded-lg p-0.5 mr-1">
            <button
              onClick={() => onDeviceModeChange('desktop')}
              className={`p-1 rounded transition-colors ${
                deviceMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Desktop (100% width)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeviceModeChange('tablet')}
              className={`p-1 rounded transition-colors ${
                deviceMode === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeviceModeChange('mobile')}
              className={`p-1 rounded transition-colors ${
                deviceMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onRefresh}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#1c2434] transition-colors"
            title="Reload Preview"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          <button
            onClick={onPopout}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#1c2434] transition-colors"
            title="Pop out in new window or view clean document"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleFullscreen}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#1c2434] transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Preview'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="relative flex-1 min-h-0 bg-[#07090f] overflow-auto flex items-center justify-center p-2">
        <div
          className={`h-full transition-all duration-300 flex flex-col bg-white rounded-lg shadow-2xl overflow-hidden ${
            deviceMode === 'desktop'
              ? 'w-full'
              : deviceMode === 'tablet'
              ? 'w-[768px] max-w-full border-4 border-[#252c3c]'
              : 'w-[375px] max-w-full border-4 border-[#252c3c]'
          }`}
        >
          {deviceMode !== 'desktop' && (
            <div className="h-4 bg-[#1f2430] flex items-center justify-center shrink-0">
              <div className="w-12 h-1 bg-slate-600 rounded-full" />
            </div>
          )}
          <iframe
            ref={iframeRef}
            srcDoc={srcDoc}
            title="BiboCodeLab Live Output"
            sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
            className="w-full flex-1 border-0 bg-white"
          />
        </div>
      </div>
    </div>
  );
};
