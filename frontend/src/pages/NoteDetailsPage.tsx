import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Presentation,
  Download,
  Calendar,
  User as UserIcon,
  Building,
  Layers,
  ArrowLeft,
  Trash2,
  Flag,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Note } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatFileSize } from '../components/NoteCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const NoteDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reporting modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Outdated Content');
  const [reportDesc, setReportDesc] = useState('');
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await api.notes.get(Number(id));
        if (res.success) {
          setNote(res.note);
        }
      } catch (err: any) {
        setError(err.message || 'Note not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  const handleDownload = async () => {
    if (!note) return;
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
        setSuccess('Download ticket generated successfully.');
      }
    } catch (err: any) {
      setError(err.message || 'Download failed. Please sign in or try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    if (!window.confirm('Are you sure you want to delete this course note? This cannot be undone.')) {
      return;
    }

    try {
      await api.notes.delete(note.id);
      navigate('/explore');
    } catch (err: any) {
      setError(err.message || 'Failed to delete note.');
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note) return;
    setReporting(true);
    try {
      await api.notes.report(note.id, {
        reason: reportReason,
        description: reportDesc,
      });
      setReportModalOpen(false);
      setSuccess('Report submitted for moderation review. Thank you!');
    } catch (err: any) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving note details..." className="py-24" />;
  }

  if (!note) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-800">Note Not Found</h2>
        <p className="mt-2 text-xs text-slate-500">The requested academic document could not be located.</p>
        <Link to="/explore" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">
          Back to Explore
        </Link>
      </div>
    );
  }

  const isOwner = user && (user.id === note.uploader_id || user.role === 'admin');
  const isPdf = note.file_extension.toLowerCase() === 'pdf';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Back link */}
      <Link
        to="/explore"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Explore Notes
      </Link>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Details Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700">
            {note.subject}
          </span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
              Semester {note.semester} • Unit {note.unit_number}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase ${
                isPdf ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
              }`}
            >
              {isPdf ? <FileText className="w-3.5 h-3.5 mr-1" /> : <Presentation className="w-3.5 h-3.5 mr-1" />}
              {note.file_extension}
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {note.title}
          </h1>
          {note.description && (
            <p className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {note.description}
            </p>
          )}
        </div>

        {/* Academic Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-y border-slate-100">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Department</span>
            <p className="text-xs font-semibold text-slate-800">{note.department}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Original File</span>
            <p className="text-xs font-mono text-slate-800 truncate" title={note.original_filename}>
              {note.original_filename}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">File Size</span>
            <p className="text-xs font-mono text-slate-800">{formatFileSize(note.file_size)}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Uploaded By</span>
            <p className="text-xs font-semibold text-slate-800">{note.uploader_name || 'Student'}</p>
          </div>
        </div>

        {/* Security & Access Notice */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-500">
          <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            This document is secured in private cloud storage. Downloads are protected and authenticated with authorized temporary presigned access tokens.
          </span>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl shadow-md transition cursor-pointer"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Download Link...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Document ({formatFileSize(note.file_size)})
                </>
              )}
            </button>

            {user && (
              <button
                onClick={() => setReportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-xl transition cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                Report
              </button>
            )}
          </div>

          {isOwner && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Delete Note
            </button>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-2">Report Note Content</h3>
            <p className="text-xs text-slate-500 mb-4">
              Help maintain academic quality by reporting incorrect syllabi, copyright violations, or corrupted files.
            </p>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Outdated Content">Outdated Course Content</option>
                  <option value="Incorrect Syllabus Unit">Incorrect Syllabus Unit</option>
                  <option value="Corrupted File">Corrupted or Unreadable File</option>
                  <option value="Inappropriate Content">Inappropriate Content</option>
                  <option value="Copyright Concern">Copyright or Plagiarism</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Details</label>
                <textarea
                  rows={3}
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Explain why this content needs review..."
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reporting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
                >
                  {reporting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
