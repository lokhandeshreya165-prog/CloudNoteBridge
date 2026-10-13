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

  const loadData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.admin.getStats();
      if (statsRes.success) setStats(statsRes.stats);

      if (activeTab === 'reports') {
        const repRes = await api.admin.listReports(reportFilter);
        if (repRes.success) setReports(repRes.reports);
      } else if (activeTab === 'notes') {
        const notesRes = await api.admin.listNotes({ q: search, per_page: 30 });
        if (notesRes.success) setNotes(notesRes.notes);
      } else if (activeTab === 'users') {
        const usersRes = await api.admin.listUsers({ q: search, per_page: 30 });
        if (usersRes.success) setUsers(usersRes.users);
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, reportFilter]);

  const handleResolveReport = async (reportId: number, status: 'resolved' | 'dismissed') => {
    try {
      await api.admin.updateReport(reportId, status);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status } : r))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update report status.');
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!window.confirm('As administrator, delete this note from database and cloud storage?')) {
      return;
    }
    try {
      await api.admin.deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      setReports((prev) => prev.filter((r) => r.note_id !== noteId));
      // Refresh stats
      const statsRes = await api.admin.getStats();
      if (statsRes.success) setStats(statsRes.stats);
    } catch (err: any) {
      alert(err.message || 'Failed to delete note.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
              <ShieldCheck className="w-3.5 h-3.5" />
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

      {/* Overview Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-500" /> Total Users
            </span>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total_users}</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-indigo-500" /> Total Notes
            </span>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total_notes}</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
              <Download className="w-3.5 h-3.5 text-emerald-500" /> Total Downloads
            </span>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total_downloads}</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
              <Flag className="w-3.5 h-3.5 text-red-500" /> Pending Flags
            </span>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.pending_reports}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
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
            className={`py-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
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
            className={`py-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            User Directory
          </button>
        </nav>
      </div>

      {/* TAB CONTENT */}
      {loading ? (
        <LoadingSpinner message="Loading administrator data..." className="py-20" />
      ) : (
        <>
          {/* 1. REPORTED NOTES QUEUE */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Filter by report status:</span>
                <select
                  value={reportFilter}
                  onChange={(e) => setReportFilter(e.target.value)}
                  className="px-3 py-1 text-xs border border-slate-200 rounded-lg bg-white"
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
                <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Reported Note</th>
                        <th className="px-4 py-3">Reason & Context</th>
                        <th className="px-4 py-3">Reported By</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Moderation Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reports.map((rep) => (
                        <tr key={rep.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-900 max-w-xs">
                            <span className="block truncate">{rep.note_title || `Note #${rep.note_id}`}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {rep.note_id}</span>
                          </td>
                          <td className="px-4 py-3 max-w-sm">
                            <span className="font-semibold text-slate-800 block">{rep.reason}</span>
                            <span className="text-[11px] text-slate-500 block truncate">{rep.description || 'No comment'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="block font-medium text-slate-700">{rep.reporter_name || 'Student'}</span>
                            <span className="text-[10px] text-slate-400">{rep.reporter_email}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
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
                          <td className="px-4 py-3 text-right space-x-2">
                            {rep.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleResolveReport(rep.id, 'resolved')}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md cursor-pointer"
                                >
                                  Resolve
                                </button>
                                <button
                                  onClick={() => handleResolveReport(rep.id, 'dismissed')}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer"
                                >
                                  Dismiss
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteNote(rep.note_id)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-md cursor-pointer"
                              title="Delete note completely"
                            >
                              Remove Note
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 2. ALL NOTES DIRECTORY */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Title & Subject</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Sem / Unit</th>
                      <th className="px-4 py-3">Size</th>
                      <th className="px-4 py-3">Uploaded</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {notes.map((n) => (
                      <tr key={n.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-900 max-w-xs">
                          <span className="block truncate">{n.title}</span>
                          <span className="text-[10px] text-blue-600 font-semibold">{n.subject}</span>
                        </td>
                        <td className="px-4 py-3">{n.department}</td>
                        <td className="px-4 py-3">Sem {n.semester} • Unit {n.unit_number}</td>
                        <td className="px-4 py-3 font-mono">{formatFileSize(n.file_size)}</td>
                        <td className="px-4 py-3 text-slate-400">
                          {new Date(n.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteNote(n.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete note"
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
          )}

          {/* 3. USER DIRECTORY */}
          {activeTab === 'users' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Name & Email</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Semester</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <span className="block">{u.full_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{u.email}</span>
                      </td>
                      <td className="px-4 py-3">{u.department}</td>
                      <td className="px-4 py-3">Semester {u.semester}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
