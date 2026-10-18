import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Upload, Search, ArrowRight, Compass, FolderOpen, GraduationCap } from 'lucide-react';
import { Note } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { NoteCard } from '../components/NoteCard';
import { EmptyState } from '../components/EmptyState';
import { GridSkeleton } from '../components/LoadingSkeleton';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [forYou, setForYou] = useState<Note[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [myNotesCount, setMyNotesCount] = useState<number>(0);
  const [totalNotesCount, setTotalNotesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const firstName = user?.full_name?.split(' ')[0] || '';

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [recentRes, myRes, forYouRes] = await Promise.all([
          api.notes.list({ per_page: 6, sort_by: 'newest' }),
          api.notes.myNotes({ per_page: 1 }),
          user?.department && user?.semester
            ? api.notes.list({ per_page: 6, sort_by: 'newest', department: user.department, semester: user.semester })
            : Promise.resolve(null),
        ]);

        if (recentRes.success) {
          setRecentNotes(recentRes.notes);
          setTotalNotesCount(recentRes.total);
        }
        if (myRes.success) setMyNotesCount(myRes.total);
        if (forYouRes && forYouRes.success) setForYou(forYouRes.notes);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.department, user?.semester]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/explore?q=${encodeURIComponent(q)}` : '/explore');
  };

  const forYouLink = `/explore?department=${encodeURIComponent(user?.department || '')}&semester=${user?.semester || ''}`;
  const hasForYou = forYou.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Greeting + search: compact so the notes are visible without scrolling */}
      <section className="rounded-3xl bg-white border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hi{firstName ? `, ${firstName}` : ''} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-blue-600" aria-hidden="true" />
              {user?.department || 'Your department'} · Semester {user?.semester || 1}
            </p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" aria-hidden="true" /> Upload notes
          </Link>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5" role="search">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search notes"
              placeholder="Search by subject or topic, e.g. “Operating Systems”"
              className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition cursor-pointer active:scale-95"
          >
            Search
          </button>
        </form>

        {/* Small stats row */}
        <div className="flex flex-wrap gap-3 pt-1 text-sm">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 font-semibold transition"
          >
            <Compass className="w-4 h-4 text-blue-600" aria-hidden="true" />
            {totalNotesCount} notes available
          </Link>
          <Link
            to="/my-uploads"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 font-semibold transition"
          >
            <FolderOpen className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            {myNotesCount} uploaded by you
          </Link>
        </div>
      </section>

      {loading ? (
        <GridSkeleton count={6} />
      ) : (
        <>
          {/* Personalised: the user's own department + semester first */}
          {hasForYou && (
            <section className="space-y-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">For your semester</h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {user?.department}, Semester {user?.semester}
                  </p>
                </div>
                <Link to={forYouLink} className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 transition">
                  See all <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forYou.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </section>
          )}

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recently added</h2>
                <p className="text-sm text-slate-500 mt-0.5">Newest notes from all departments</p>
              </div>
              <Link to="/explore" className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 transition">
                See all <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            {recentNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentNotes.slice(0, hasForYou ? 3 : 6).map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No notes yet"
                description="Be the first to upload notes for your department and semester."
                actionText="Upload notes"
                actionLink="/upload"
                icon={BookOpen}
              />
            )}
          </section>
        </>
      )}
    </div>
  );
};
