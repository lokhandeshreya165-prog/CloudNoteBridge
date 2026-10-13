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
  Cloud,
  Share2,
  BookOpen,
  Sparkles,
  FileCheck,
  HardDrive,
  X,
} from 'lucide-react';
import { Note } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatFileSize } from '../components/NoteCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const NoteDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, health } = useAuth();
  const navigate = useNavigate();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Reporting modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Outdated Content');
  const [reportDesc, setReportDesc] = useState('');
  const [reporting, setReporting] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
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
        setSuccess('Download link generated. File download starting...');
        // Increment download count locally
        setNote((prev) => prev ? { ...prev, download_count: (prev.download_count || 0) + 1 } : null);
      }
    } catch (err: any) {
      setError(err.message || 'Download failed. Please sign in or try again.');
    } finally {
      setDownloading(false);
    }
  };

  const confirmDelete = async () => {
    if (!note) return;
    setDeleting(true);
    try {
      await api.notes.delete(note.id);
      navigate('/explore');
    } catch (err: any) {
      setError(err.message || 'Failed to delete note.');
      setDeleteModalOpen(false);
    } finally {
      setDeleting(false);
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
      setSuccess('Report submitted for moderation review. Thank you for maintaining academic quality.');
    } catch (err: any) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setReporting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving note details from cloud storage..." className="py-28" />;
  }

  if (!note) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Note Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested course document could not be located in the cloud repository or has been removed.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Explore Notes
        </Link>
      </div>
    );
  }

  const isOwner = user && (user.id === note.uploader_id || user.role === 'admin');
  const ext = note.file_extension.toLowerCase();
  const isPdf = ext === 'pdf';
  const isPpt = ext === 'ppt' || ext === 'pptx';
  const isAwsS3 = health?.storage.is_aws_s3 ?? false;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 animate-fadeIn">
      {/* Navigation & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Notes Explorer
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs transition cursor-pointer"
          >
            {copiedLink ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Link Copied!
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                Share Link
              </>
            )}
          </button>

          {user && (
            <button
              onClick={() => setReportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200/80 rounded-xl shadow-2xs transition cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              Report Issue
            </button>
          )}

          {isOwner && (
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 bg-white border border-red-200 rounded-xl shadow-2xs transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Note
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between text-xs text-red-700 animate-slideDown">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 animate-slideDown">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main 2-Column Document Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Academic Context (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Tags & Format Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                <BookOpen className="w-3.5 h-3.5" />
                {note.subject}
              </span>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                  Semester {note.semester} • Unit {note.unit_number}
                </span>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                    isPdf
                      ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                      : isPpt
                      ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                      : 'bg-blue-50 text-blue-700 border border-blue-200/80'
                  }`}
                >
                  {isPdf ? (
                    <FileText className="w-3.5 h-3.5" />
                  ) : (
                    <Presentation className="w-3.5 h-3.5" />
                  )}
                  {note.file_extension}
                </span>
              </div>
            </div>

            {/* Document Title & Description */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {note.title}
              </h1>
              {note.description ? (
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {note.description}
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-400 italic">
                  No additional summary provided by author.
                </p>
              )}
            </div>

            {/* Academic Matrix Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Building className="w-3 h-3" /> Department
                </span>
                <p className="text-xs font-bold text-slate-800 leading-snug">{note.department}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Unit Syllabus
                </span>
                <p className="text-xs font-bold text-slate-800">Unit {note.unit_number}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Published
                </span>
                <p className="text-xs font-bold text-slate-800">
                  {new Date(note.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Download className="w-3 h-3" /> Downloads
                </span>
                <p className="text-xs font-bold text-blue-600">
                  {note.download_count || 0} times
                </p>
              </div>
            </div>
          </div>

          {/* Academic Syllabus Guide Card */}
          <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-200/60 rounded-3xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Syllabus Study Recommendation
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              These notes cover <strong className="text-slate-800 font-semibold">{note.subject} — Unit {note.unit_number}</strong>.
              Review these slides alongside your official university lecture notes and textbook problem sets for complete exam preparation.
            </p>
          </div>
        </div>

        {/* Right Column: Download & Storage Details */}
        <div className="space-y-6">
          {/* Main Action Download Box */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                Download Academic Document
              </h3>
              <p className="text-xs text-slate-500">
                Direct access to high-resolution original file.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Original File:</span>
                <span className="font-mono font-semibold text-slate-800 truncate max-w-[150px]" title={note.original_filename}>
                  {note.original_filename}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">File Format:</span>
                <span className="font-bold uppercase text-slate-800">.{note.file_extension}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">File Size:</span>
                <span className="font-mono font-bold text-slate-800">{formatFileSize(note.file_size)}</span>
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-2xl shadow-lg shadow-blue-500/20 transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Presigned URL...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Document
                </>
              )}
            </button>

            {/* Cloud Storage Security Pill */}
            <div className="pt-4 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-500">
              <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-700 block">
                  Encrypted Cloud Storage
                </span>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  {isAwsS3
                    ? 'Stored in Amazon S3 private bucket with AES-256 encryption. Delivered via authenticated temporary pre-signed token.'
                    : 'Served through verified authenticated cloud token pipeline.'}
                </p>
              </div>
            </div>
          </div>

          {/* Uploader Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Contributed By
            </h4>
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                {(note.uploader_name || 'S').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {note.uploader_name || 'Student Contributor'}
                </p>
                <p className="text-xs text-slate-500">{note.department}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                Confirm Note Deletion
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-800 font-semibold">"{note.title}"</strong>?
                This will delete the file object from private cloud storage and revoke all active links.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Flag className="w-4 h-4 text-red-600" />
                Report Academic Content
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Help preserve syllabus accuracy and content integrity by flagging incorrect unit numbers, copyrighted materials, or corrupted documents.
            </p>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Flag
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="Outdated Content">Outdated Course Content</option>
                  <option value="Incorrect Syllabus Unit">Incorrect Syllabus Unit</option>
                  <option value="Corrupted File">Corrupted or Unreadable File</option>
                  <option value="Inappropriate Content">Inappropriate Content</option>
                  <option value="Copyright Concern">Copyright or Plagiarism</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Details & Context
                </label>
                <textarea
                  rows={3}
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Explain why this content needs administrative review..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reporting}
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-500/20 cursor-pointer disabled:opacity-50"
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
