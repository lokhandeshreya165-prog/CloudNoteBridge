import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Upload,
  Search,
  FileText,
  Layers,
  ArrowRight,
  TrendingUp,
  GraduationCap,
} from 'lucide-react';
import { Note } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { NoteCard } from '../components/NoteCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [myNotesCount, setMyNotesCount] = useState<number>(0);
  const [totalNotesCount, setTotalNotesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [recentRes, myRes] = await Promise.all([
          api.notes.list({ per_page: 6, sort_by: 'newest' }),
          api.notes.myNotes({ per_page: 1 }),
        ]);

        if (recentRes.success) {
          setRecentNotes(recentRes.notes);
          setTotalNotesCount(recentRes.total);
        }
        if (myRes.success) {
          setMyNotesCount(myRes.total);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Group recent notes by subject
  const subjectsMap = recentNotes.reduce((acc, note) => {
    acc[note.subject] = (acc[note.subject] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white mb-4">
            <GraduationCap className="w-4 h-4" />
            {user?.department} • Semester {user?.semester}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Find the latest unit syllabus notes, exam preparation materials, and slides uploaded by your college peers.
          </p>

          {/* Search bar inside banner */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex items-center gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by topic, unit, or subject..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white text-slate-900 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-sm transition shrink-0 cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Action Button */}
        <div className="mt-6 sm:mt-0 sm:absolute sm:right-10 sm:bottom-10 z-10">
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white text-blue-700 hover:bg-blue-50 text-sm font-bold rounded-xl shadow-md transition"
          >
            <Upload className="w-4 h-4" />
            Upload New Note
          </Link>
        </div>
      </div>

      {/* Real Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Available Notes</span>
            <p className="text-2xl font-bold text-slate-900">{totalNotesCount}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Your Uploads</span>
            <p className="text-2xl font-bold text-slate-900">{myNotesCount}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Subjects Active</span>
            <p className="text-2xl font-bold text-slate-900">{Object.keys(subjectsMap).length}</p>
          </div>
        </div>
      </div>

      {/* Active Subjects Pills */}
      {Object.keys(subjectsMap).length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Popular Course Subjects
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(subjectsMap).map(([subject, count]) => (
              <Link
                key={subject}
                to={`/explore?subject=${encodeURIComponent(subject)}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 transition"
              >
                {subject}
                <span className="px-1.5 py-0.2 rounded-full bg-slate-200/60 text-[10px] text-slate-600">
                  {count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recently Uploaded Notes Section */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recently Uploaded Notes</h2>
            <p className="text-xs text-slate-500">Course materials newly added by university students</p>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Explore all notes <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching course documents..." />
        ) : recentNotes.length === 0 ? (
          <EmptyState
            title="No Course Notes Yet"
            description="Be the first student to upload a lecture note or presentation slides for your department!"
            actionText="Upload Notes"
            actionLink="/upload"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
