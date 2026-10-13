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
  Sparkles,
  Compass,
  Clock,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';
import { Note } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { NoteCard } from '../components/NoteCard';
import { EmptyState } from '../components/EmptyState';
import { GridSkeleton } from '../components/LoadingSkeleton';

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

  // Group recent notes by unique subject for filter chips
  const distinctSubjects = Array.from(new Set(recentNotes.map((n) => n.subject))).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* =========================================================================
          HERO BANNER (Educational EdTech Welcome)
          ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        {/* Subtle mesh background circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 rounded-full bg-indigo-600/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          {/* Department Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-blue-200 border border-white/15 mb-4">
            <GraduationCap className="w-4 h-4 text-blue-400" />
            <span>{user?.department || 'Academic Department'} • Semester {user?.semester || 1}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Good to see you again{user?.full_name ? `, ${user.full_name}` : ''}!
          </h1>

          <p className="mt-2 text-sm sm:text-base text-slate-300/90 leading-relaxed max-w-2xl">
            Your next great study session starts here. Find unit syllabus notes, exam preparation guides, and presentation slides uploaded by your college peers.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row items-stretch gap-2.5 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, subjects, semesters, or topics..."
                className="w-full pl-10 pr-4 py-3 text-sm bg-white/95 text-slate-900 placeholder:text-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-md transition shrink-0 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Search Notes</span>
            </button>
          </form>

          {/* Quick Subject Chips */}
          {distinctSubjects.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="text-slate-400 font-medium">Quick subjects:</span>
              {distinctSubjects.map((subj) => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => navigate(`/explore?subject=${encodeURIComponent(subj)}`)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition cursor-pointer border border-white/10"
                >
                  {subj}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          KEY STATS & ACTIONS ROW
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Explore Directory */}
        <Link
          to="/explore"
          className="group p-5 bg-white border border-slate-200/90 hover:border-blue-300 rounded-2xl shadow-xs hover:shadow-lg transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Campus Library</p>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {totalNotesCount} Verified Notes
              </h3>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </Link>

        {/* Card 2: My Contributions */}
        <Link
          to="/my-uploads"
          className="group p-5 bg-white border border-slate-200/90 hover:border-indigo-300 rounded-2xl shadow-xs hover:shadow-lg transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition flex items-center justify-center shrink-0">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Contributions</p>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {myNotesCount} Uploaded
              </h3>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </Link>

        {/* Card 3: Quick Upload CTA */}
        <Link
          to="/upload"
          className="group p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md hover:shadow-xl transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Share With Peers</p>
              <h3 className="text-lg font-bold text-white mt-0.5">Quick Upload Note</h3>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* =========================================================================
          RECENTLY UPLOADED NOTES SECTION
          ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Recently Shared Notes</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fresh study materials and lecture documents uploaded by university students
            </p>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition group"
          >
            <span>View all campus notes</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <GridSkeleton count={6} />
        ) : recentNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No notes shared yet"
            description="Be the first to upload course notes for your department and semester!"
            actionText="Upload First Note"
            actionLink="/upload"
            icon={BookOpen}
          />
        )}
      </div>
    </div>
  );
};
