import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Presentation,
  Download,
  Calendar,
  User,
  Eye,
  Loader2,
  FileCode,
  FileCheck2,
  Share2,
} from 'lucide-react';
import { Note } from '../types';
import { api } from '../services/api';

interface NoteCardProps {
  note: Note;
  onDelete?: (id: number) => void;
  showDelete?: boolean;
}

export const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete, showDelete = false }) => {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ext = note.file_extension.toLowerCase();
  const isPdf = ext === 'pdf';
  const isPptx = ext === 'pptx' || ext === 'ppt';
  const isDocx = ext === 'docx' || ext === 'doc';

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setDownloading(true);

    try {
      const res = await api.downloads.getDownloadUrl(note.id);
      if (res.download_url) {
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
    <div className="flex flex-col justify-between bg-white border border-slate-200/90 hover:border-blue-300/80 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group relative overflow-hidden">
      {/* Top subtle highlight line based on file type */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          isPdf
            ? 'bg-rose-500'
            : isPptx
            ? 'bg-amber-500'
            : isDocx
            ? 'bg-blue-600'
            : 'bg-indigo-500'
        }`}
      />

      <div>
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pt-1">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
            {note.subject}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
              Sem {note.semester} • Unit {note.unit_number}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                isPdf
                  ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                  : isPptx
                  ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                  : isDocx
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {isPdf ? (
                <FileText className="w-3 h-3 mr-1" />
              ) : isPptx ? (
                <Presentation className="w-3 h-3 mr-1" />
              ) : (
                <FileCode className="w-3 h-3 mr-1" />
              )}
              {note.file_extension}
            </span>
          </div>
        </div>

        {/* Note Title */}
        <Link to={`/notes/${note.id}`} className="block group/title">
          <h3 className="text-base font-bold text-slate-900 group-hover/title:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {note.title}
          </h3>
        </Link>

        {/* Description snippet */}
        {note.description ? (
          <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {note.description}
          </p>
        ) : (
          <p className="mt-2 text-xs text-slate-400 italic">No additional summary provided.</p>
        )}

        {/* Academic Metadata */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-700 truncate max-w-[200px]" title={note.department}>
              {note.department}
            </span>
            <span className="text-slate-400 font-mono font-medium">{formatFileSize(note.file_size)}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span className="flex items-center gap-1.5 truncate max-w-[170px] text-slate-600 font-medium">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                {(note.uploader_name || 'S').charAt(0).toUpperCase()}
              </span>
              <span className="truncate">{note.uploader_name || 'Classmate'}</span>
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3 h-3" />
              {new Date(note.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        {error && (
          <p className="mb-2 text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-2">
          <Link
            to={`/notes/${note.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-700 bg-slate-100/80 hover:bg-blue-50 rounded-xl transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </Link>

          <div className="flex items-center gap-2">
            {showDelete && onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(note.id);
                }}
                className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
              >
                Delete
              </button>
            )}

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 rounded-xl shadow-xs hover:shadow-md transition cursor-pointer active:scale-95"
              title="Download course note"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
