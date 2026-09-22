import React from 'react';
import { STARTER_TEMPLATES } from '../data/templates';
import { Template } from '../types';
import { Sparkles, X, ArrowRight, Layers } from 'lucide-react';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#121622] border border-[#263147] rounded-2xl p-6 shadow-2xl text-slate-200 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-4 border-b border-[#20283a] shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Starter Templates</h3>
              <p className="text-xs text-slate-400">Jumpstart your experiments with ready-to-run interactive examples</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-4 overflow-y-auto pr-1">
          {STARTER_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="flex flex-col justify-between p-4 rounded-xl border border-[#232d40] bg-[#161c29] hover:border-indigo-500/50 hover:bg-[#1a2233] transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {tmpl.tag}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                  {tmpl.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              <button
                onClick={() => {
                  onSelectTemplate(tmpl);
                  onClose();
                }}
                className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 bg-[#20293d] hover:bg-indigo-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <span>Load Template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-3 border-t border-[#20283a] shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
