'use client';

import { Document, DocumentType } from '@/lib/types';
import { format } from 'date-fns';
import {
  FileText,
  Image as ImageIcon,
  FileCheck,
  FileCode,
  File,
  ExternalLink,
  Trash2,
  Building2,
  FolderKanban
} from 'lucide-react';
import { useDeleteDocument } from '@/hooks/useDocuments';

interface DocumentListProps {
  documents: Document[];
}

const getIcon = (type: DocumentType) => {
  switch (type) {
    case 'contract': return FileCheck;
    case 'design': return ImageIcon;
    case 'brief': return FileText;
    case 'invoice': return FileText;
    default: return File;
  }
};

const getColor = (type: DocumentType) => {
  switch (type) {
    case 'contract': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
    case 'design': return 'text-pink-400 bg-pink-400/10 border-pink-400/20';
    case 'brief': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    case 'invoice': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  }
};

export function DocumentList({ documents }: DocumentListProps) {
  const deleteDocument = useDeleteDocument();

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-white/10 bg-white/5">
        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-4">
          <File className="w-6 h-6 text-gray-600" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No documents found</h3>
        <p className="text-gray-500 max-w-sm">
          Upload contracts, briefs, or connect external drive links to keep everything organized.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {documents.map((doc) => {
        const Icon = getIcon(doc.type);
        const colorClass = getColor(doc.type);

        return (
          <div
            key={doc.id}
            className="group relative bg-[#151515] hover:bg-[#1A1A1A] border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all hover:shadow-lg hover:shadow-black/20 flex flex-col"
          >
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className={`p-2.5 rounded-lg border ${colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (confirm('Delete document?')) {
                      deleteDocument.mutate(doc.id);
                    }
                  }}
                  className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h4 className="font-medium text-white mb-1 truncate" title={doc.name}>
              {doc.name}
            </h4>
            <p className="text-xs text-gray-500 capitalize mb-4">{doc.type}</p>

            <div className="mt-auto space-y-2 pt-2 border-t border-white/5">
              {doc.clientName && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Building2 className="w-3 h-3" />
                  <span className="truncate">{doc.clientName}</span>
                </div>
              )}
              {doc.projectName && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <FolderKanban className="w-3 h-3" />
                  <span className="truncate">{doc.projectName}</span>
                </div>
              )}
            </div>

            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 z-0"
              onClick={(e) => {
                // Prevent click on delete button triggering link
                if ((e.target as HTMLElement).closest('button')) {
                  e.preventDefault();
                }
              }}
            />

            <div className="absolute top-4 right-4 pointer-events-none">
              <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
