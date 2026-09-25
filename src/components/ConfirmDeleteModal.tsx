import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemType: 'file' | 'folder';
  itemName: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemType,
  itemName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm bg-[#121622] border border-[#273349] rounded-2xl p-5 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#1f293d]">
          <div className="flex items-center gap-2 text-rose-400">
            <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2233]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-2 text-xs text-slate-300">
          <p>
            Are you sure you want to delete the {itemType}{' '}
            <strong className="text-white font-mono bg-[#182030] px-1.5 py-0.5 rounded border border-[#28354c]">
              {itemName}
            </strong>
            ?
          </p>
          <p className="text-slate-400">{description}</p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1f293d]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-[#182030] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold shadow-md shadow-rose-600/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
