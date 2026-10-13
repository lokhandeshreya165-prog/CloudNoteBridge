import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  Search,
  FileText,
  Download,
  BookOpen,
  ArrowUpDown,
  Trash2,
  AlertTriangle,
  FolderOpen,
  Sparkles,
  Layers,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Note } from '../types';
import { api } from '../services/api';
import { NoteCard } from '../components/NoteCard';
import { GridSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';

export const MyUploadsPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'downloads' | 'title'>('newest');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Custom Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMyNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.notes.myNotes({ q: search });
      if (res.success) {
        setNotes(res.notes);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve your uploads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyNotes();
  }, [search]);

  // Client-side sorting for quick responsive responsiveness
  const sortedNotes = useMemo(() => {
    const list = [...notes];
    if (sortBy === 'downloads') {
      return list.sort((a, b) => (b.download_count || 0) - (a.download_count || 0));
    }
    if (sortBy === 'title') {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    }
    // newest default
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [notes, sortBy]);

  // Aggregate stats
  const totalDownloads = useMemo(() => {
    return notes.reduce((acc, curr) => acc + (curr.download_count || 0), 0);
  }, [notes]);

  const uniqueSubjects = useMemo(() => {
    const set = new Set(notes.map((n) => n.subject.toLowerCase()));
    return set.size;
  }, [notes]);

  const initiateDelete = (noteId: number) => {
    const target = notes.find((n) => n.id === noteId);
    if (target) {
      setDeleteTarget(target);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      await api.notes.delete(deleteTarget.id);
      setNotes((prev) => prev.filter((n) => n.id !== deleteTarget.id));
      setSuccess(`"${deleteTarget.title}" was permanently removed from cloud storage.`);
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete note from cloud storage.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 animate-fadeIn">
      {/* Top Banner & Heading */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 sm:p-10 shadow-xl shadow-blue-500/10">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-blue-100 border border-white/20 backdrop-blur-md">
              <FolderOpen className="w-3.5 h-3.5" />
              Contributor Dashboard
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              My Uploaded Course Notes
            </h1>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              Track the reach of your shared study materials, organize lecture units, and manage syllabus assets securely stored in the cloud.
            </p>
          </div>

          <Link
            to="/upload"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-blue-700 bg-white hover:bg-blue-50 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            <Upload className="w-4 h-4" />
            Upload New Notes
          </Link>
        </div>

        {/* Live Metrics Row */}
        <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-blue-200 text-xs font-medium">
              <FileText className="w-4 h-4" />
              Total Uploads
            </div>
            <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">
              {notes.length}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-medium">
              <Download className="w-4 h-4" />
              Total Peer Downloads
            </div>
            <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">
              {totalDownloads}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 text-cyan-200 text-xs font-medium">
              <BookOpen className="w-4 h-4" />
              Subjects Covered
            </div>
            <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">
              {uniqueSubjects}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between text-xs text-red-700 animate-slideDown">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
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

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your notes by title, subject..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            Sort:
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
          >
            <option value="newest">Recently Uploaded</option>
            <option value="downloads">Most Downloaded</option>
            <option value="title">Title (A to Z)</option>
          </select>
        </div>
      </div>

      {/* Notes Grid or Empty State */}
      {loading ? (
        <GridSkeleton count={6} />
      ) : sortedNotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={search ? 'No Matches in Your Uploads' : "You Haven't Uploaded Any Notes Yet"}
          description={
            search
              ? `No notes matching "${search}" were found in your repository.`
              : 'Empower your classmates by sharing unit notes, revision summaries, and lecture presentations.'
          }
          actionText={search ? 'Clear Search Filter' : 'Upload Your First Note'}
          actionLink={search ? undefined : '/upload'}
          onAction={search ? () => setSearch('') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              showDelete={true}
              onDelete={initiateDelete}
            />
          ))}
        </div>
      )}

      {/* Modern Custom Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                Delete Note From Cloud?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-800 font-semibold">"{deleteTarget.title}"</strong>?
                This action is permanent and will remove the file from cloud storage and remove it from student search results.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Subject:</span>
                <span className="font-semibold text-slate-800">{deleteTarget.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Unit / Semester:</span>
                <span className="font-semibold text-slate-800">Unit {deleteTarget.unit_number} • Sem {deleteTarget.semester}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Downloads:</span>
                <span className="font-semibold text-blue-600">{deleteTarget.download_count} times</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Yes, Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
