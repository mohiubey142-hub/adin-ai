// src/components/cv-builder/components/RemoveDocumentChoice.tsx
// Compact modal shown when user clicks delete on a CV/CL.
// Gives 3 options: Archive (keep in cloud), Delete Forever, Cancel.

import React from 'react';
import { Archive, Trash2, X } from 'lucide-react';

interface RemoveDocumentChoiceProps {
  isOpen: boolean;
  documentTitle: string;
  kind: 'resume' | 'cover-letter';
  onArchive: () => void;
  onDeleteForever: () => void;
  onCancel: () => void;
}

const RemoveDocumentChoice: React.FC<RemoveDocumentChoiceProps> = ({
  isOpen,
  documentTitle,
  kind,
  onArchive,
  onDeleteForever,
  onCancel,
}) => {
  if (!isOpen) return null;

  const label = kind === 'cover-letter' ? 'cover letter' : 'CV';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="relative px-5 pt-5 pb-3">
          <button
            onClick={onCancel}
            className="absolute top-3.5 right-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          <h2 className="text-sm font-bold text-slate-900 tracking-tight pr-6">
            Remove this {label}?
          </h2>
          <p className="text-xs text-slate-500 mt-1 truncate">
            "{documentTitle || `Untitled ${label}`}"
          </p>
        </div>

        <div className="px-5 pb-5 space-y-2">
          <button
            onClick={onArchive}
            className="w-full flex items-start gap-3 p-3 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-300 transition-colors text-left group"
          >
            <div className="shrink-0 w-8 h-8 rounded-lg bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center transition-colors">
              <Archive size={15} className="text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-900">
                Archive — Remove from device
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                Keeps a safe backup in the cloud. Restore anytime with your ID.
              </div>
            </div>
          </button>

          <button
            onClick={onDeleteForever}
            className="w-full flex items-start gap-3 p-3 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 hover:border-red-200 transition-colors text-left group"
          >
            <div className="shrink-0 w-8 h-8 rounded-lg bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-colors">
              <Trash2 size={15} className="text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-900">
                Delete forever
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                Removes from this device AND the cloud. Cannot be undone.
              </div>
            </div>
          </button>

          <button
            onClick={onCancel}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveDocumentChoice;