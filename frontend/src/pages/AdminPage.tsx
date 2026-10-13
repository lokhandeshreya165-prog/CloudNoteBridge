import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Users,
  FileText,
  Flag,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  HardDrive,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Filter,
  X,
} from 'lucide-react';
import { User, Note, NoteReport, SystemStats } from '../types';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { formatFileSize } from '../components/NoteCard';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reports' | 'notes' | 'users'>('reports');
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [reports, setReports] = useState<NoteReport[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [reportFilter, setReportFilter] = useState('all');

  // Admin delete modal
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.admin.getStats();
      if (statsRes.success) setStats(statsRes.stats);

      if (activeTab === 'reports') {
        const repRes = await api.admin.listReports(reportFilter);
        if (repRes.success) setReports(repRes.reports);
      } else if (activeTab === 'notes') {
        const notesRes = await api.admin.listNotes({ q: search, per_page: 50 });
        if (notesRes.success) setNotes(notesRes.notes);
      } else if (activeTab === 'users') {
        const usersRes = await api.admin.listUsers({ q: search, per_page: 50 });
        if (usersRes.success) setUsers(usersRes.users);
      }
    } catch (err: any) {
      console.error('Failed to load admin data', err);
      setError(err.message || 'Failed to load administrator data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, reportFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleResolveReport = async (reportId: number, status: 'resolved' | 'dismissed') => {
    try {
      await api.admin.updateReport(reportId, status);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status } : r))
      );
      setSuccess(`Report #${reportId} status updated to ${status}.`);
      // Refresh stats
      const statsRes = await api.admin.getStats();
      if (statsRes.success) setStats(statsRes.stats);
    } catch (err: any) {
      setError(err.message || 'Failed to update report status.');
    }
  };

  const confirmDeleteNote = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await api.admin.deleteNote(deleteTargetId);
      setNotes((prev) => prev.filter((n) => n.id !== deleteTargetId));
      setReports((prev) => prev.filter((r) => r.note_id !== deleteTargetId));
      setSuccess(`Note #${deleteTargetId} permanently deleted from database and cloud storage.`);
      setDeleteTargetId(null);
      // Refresh stats
      const statsRes = await api.admin.getStats();
      if (statsRes.success) setStats(statsRes.stats);
    } catch (err: any) {
      setError(err.message || 'Failed to delete note.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Administrative Governance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Administrator Control Center
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Monitor academic content moderation, registered students, and cloud storage health.
          </p>
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

      {/* Overview Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-500" /> Total Students
            </span>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.total_users}</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-500" /> Course Notes
            </span>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.total_notes}</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Download className="w-4 h-4 text-emerald-500" /> Downloads
            </span>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.total_downloads}</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flag className="w-4 h-4 text-red-500" /> Pending Flags
            </span>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.pending_reports}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-3.5 border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'reports'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Flag className="w-4 h-4" />
            Reported Notes Queue ({reports.filter((r) => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3.5 border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'notes'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Manage All Notes
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3.5 border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Student User Directory
          </button>
        </nav>
      </div>

      {/* TAB CONTENT */}
      {loading ? (
        <LoadingSpinner message="Retrieving administrative data..." className="py-24" />
      ) : (
        <>
          {/* 1. REPORTED NOTES QUEUE */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Filter queue by status:</span>
                <select
                  value={reportFilter}
                  onChange={(e) => setReportFilter(e.target.value)}
                  className="px-3.5 py-1.5 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">All Reports</option>
                  <option value="pending">Pending Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>

              {reports.length === 0 ? (
                <EmptyState
                  icon={CheckCircle}
                  title="No Pending Content Reports"
                  description="The student notes repository is clean with no unreviewed moderation flags."
                />
              ) : (
                <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                        <tr>
                          <th className="px-5 py-3.5">Reported Note</th>
                          <th className="px-5 py-3.5">Reason & Details</th>
                          <th className="px-5 py-3.5">Reported By</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Moderation Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reports.map((rep) => (
                          <tr key={rep.id} className="hover:bg-slate-50/60 transition">
                            <td className="px-5 py-4 font-bold text-slate-900 max-w-xs">
                              <span className="block truncate">{rep.note_title || `Note #${rep.note_id}`}</span>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {rep.note_id}</span>
                            </td>
                            <td className="px-5 py-4 max-w-sm">
                              <span className="font-bold text-slate-800 block">{rep.reason}</span>
                              <span className="text-[11px] text-slate-500 block truncate">{rep.description || 'No comment provided'}</span>
                            </td>
                            <td className="px-5 py-4">
                              <span className="block font-bold text-slate-700">{rep.reporter_name || 'Student'}</span>
                              <span className="text-[10px] text-slate-400">{rep.reporter_email}</span>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                  rep.status === 'pending'
                                    ? 'bg-amber-100 text-amber-800'
                                    : rep.status === 'resolved'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {rep.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right space-x-2">
                              {rep.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleResolveReport(rep.id, 'resolved')}
                                    className="px-3 py-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition cursor-pointer"
                                  >
                                    Resolve
                                  </button>
                                  <button
                                    onClick={() => handleResolveReport(rep.id, 'dismissed')}
                                    className="px-3 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                                  >
                                    Dismiss
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => setDeleteTargetId(rep.note_id)}
                                className="px-3 py-1.5 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition cursor-pointer"
                                title="Delete note completely"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. ALL NOTES DIRECTORY */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search all notes by title or subject..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition"
                >
                  Search
                </button>
              </form>

              <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3.5">Title & Subject</th>
                        <th className="px-5 py-3.5">Department</th>
                        <th className="px-5 py-3.5">Sem / Unit</th>
                        <th className="px-5 py-3.5">Size</th>
                        <th className="px-5 py-3.5">Downloads</th>
                        <th className="px-5 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {notes.map((n) => (
                        <tr key={n.id} className="hover:bg-slate-50/60 transition">
                          <td className="px-5 py-4 font-bold text-slate-900 max-w-xs">
                            <span className="block truncate">{n.title}</span>
                            <span className="text-[10px] text-blue-600 font-bold">{n.subject}</span>
                          </td>
                          <td className="px-5 py-4">{n.department}</td>
                          <td className="px-5 py-4">Sem {n.semester} • Unit {n.unit_number}</td>
                          <td className="px-5 py-4 font-mono">{formatFileSize(n.file_size)}</td>
                          <td className="px-5 py-4 font-bold text-emerald-600">{n.download_count || 0}</td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => setDeleteTargetId(n.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                              title="Delete note completely"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. USER DIRECTORY */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3.5">Name & Email</th>
                        <th className="px-5 py-3.5">Department</th>
                        <th className="px-5 py-3.5">Semester</th>
                        <th className="px-5 py-3.5">Role</th>
                        <th className="px-5 py-3.5">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/60 transition">
                          <td className="px-5 py-4 font-bold text-slate-900">
                            <span className="block">{u.full_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{u.email}</span>
                          </td>
                          <td className="px-5 py-4">{u.department}</td>
                          <td className="px-5 py-4 font-bold">Semester {u.semester}</td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                u.role === 'admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-400">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Admin Delete Confirmation Modal */}
      {deleteTargetId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                Administrative Delete
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                As system administrator, do you confirm the permanent removal of note #{deleteTargetId}?
                The document will be removed from cloud storage and all reports for this note will be cleared.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteNote}
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
                    Yes, Delete Note
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
