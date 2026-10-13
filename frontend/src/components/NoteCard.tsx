import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Presentation, Download, Calendar, User, Eye, Loader2 } from 'lucide-react';
import { Note } from '../types';
import { api } from '../services/api';

interface NoteCardProps {
  note: Note;
  onDelete?: (id: number) => void;
  showDelete?: boolean;
}

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete, showDelete = false }) => {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPdf = note.file_extension.toLowerCase() === 'pdf';

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setDownloading(true);

    try {
      const res = await api.downloads.getDownloadUrl(note.id);
      if (res.download_url) {
        // Create temporary anchor to trigger browser download
        const a = document.createElement('a');
        a.href = res.download_url;
        a.download = res.original_filename || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err: any) {
      setError(err.message || 'Download failed. Please sign in or try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group">
      <div>
        {/* Badges: Subject, Semester, Unit, Extension */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700">
            {note.subject}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
              Sem {note.semester} • Unit {note.unit_number}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                isPdf ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
              }`}
            >
              {isPdf ? <FileText className="w-3 h-3 mr-1" /> : <Presentation className="w-3 h-3 mr-1" />}
              {note.file_extension}
            </span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/notes/${note.id}`} className="block">
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {note.title}
          </h3>
        </Link>

        {/* Description snippet */}
        {note.description && (
          <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {note.description}
          </p>
        )}

        {/* Metadata: Department, Uploader, Date */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-600 truncate max-w-[180px]">{note.department}</span>
            <span className="text-slate-400 font-mono">{formatFileSize(note.file_size)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1 truncate max-w-[160px]">
              <User className="w-3.5 h-3.5" />
              {note.uploader_name || 'Student'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(note.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        {error && (
          <p className="mb-2 text-xs font-medium text-red-600 bg-red-50 p-1.5 rounded">{error}</p>
        )}
        <div className="flex items-center justify-between gap-2">
          <Link
            to={`/notes/${note.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition"
          >
            <Eye className="w-3.5 h-3.5" />
            Details
          </Link>

          <div className="flex items-center gap-2">
            {showDelete && onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(note.id);
                }}
                className="px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
              >
                Delete
              </button>
            )}

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition shadow-xs cursor-pointer"
              title="Download course note"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Download
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
