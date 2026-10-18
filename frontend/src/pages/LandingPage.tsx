import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  Upload,
  BookOpen,
  Cpu,
  Network,
  Zap,
  Cog,
  Building2,
  Dna,
  Briefcase,
  FlaskConical,
  Filter,
  FolderUp,
  Download,
} from 'lucide-react';
import { Note } from '../types';
import { api } from '../services/api';
import { NoteCard } from '../components/NoteCard';
import { NoteCardSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';

const DEPARTMENT_TILES = [
  { name: 'Computer Science & Engineering', short: 'Computer Science', icon: Cpu, tone: 'bg-blue-50 text-blue-600' },
  { name: 'Information Technology', short: 'Information Technology', icon: Network, tone: 'bg-indigo-50 text-indigo-600' },
  { name: 'Electronics & Communication', short: 'Electronics', icon: Zap, tone: 'bg-amber-50 text-amber-600' },
  { name: 'Electrical Engineering', short: 'Electrical', icon: Zap, tone: 'bg-red-50 text-red-600' },
  { name: 'Mechanical Engineering', short: 'Mechanical', icon: Cog, tone: 'bg-emerald-50 text-emerald-600' },
  { name: 'Civil Engineering', short: 'Civil', icon: Building2, tone: 'bg-purple-50 text-purple-600' },
  { name: 'Biotechnology', short: 'Biotechnology', icon: Dna, tone: 'bg-rose-50 text-rose-600' },
  { name: 'Business Administration', short: 'Business', icon: Briefcase, tone: 'bg-blue-50 text-blue-600' },
  { name: 'Basic Sciences & Humanities', short: 'Sciences & Humanities', icon: FlaskConical, tone: 'bg-indigo-50 text-indigo-600' },
];

const STEPS = [
  { icon: Filter, title: 'Find', text: 'Pick your department, semester and unit, or just search by topic.' },
  { icon: Download, title: 'Download', text: 'Open the note and download it with one click.' },
  { icon: FolderUp, title: 'Share', text: 'Upload your own notes so juniors and classmates can use them too.' },
];

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await api.notes.list({ per_page: 6, sort_by: 'newest' });
        if (res.success) setRecentNotes(res.notes);
      } catch (err) {
        console.error('Failed to load recent notes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/explore?q=${encodeURIComponent(q)}` : '/explore');
  };

  return (
    <div className="pb-16">
      {/* 1. Hero: one message, one search box, one main button */}
      <section className="border-b border-slate-200/80 bg-gradient-to-b from-blue-50/60 via-white to-slate-50/30 dark:from-blue-950/30 dark:via-transparent dark:to-transparent">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-14 sm:pb-16 text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
            Find the right notes for your exam,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">fast.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Notes and slides from students in your college, sorted by subject, semester and unit. No more
            searching through WhatsApp groups.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto" role="search">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search notes"
                placeholder="Try “DBMS unit 3” or “Operating Systems”"
                className="w-full pl-12 pr-4 py-3.5 text-base bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="px-7 py-3.5 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-lg shadow-blue-500/20 transition cursor-pointer active:scale-95"
            >
              Search
            </button>
          </form>

          <p className="text-sm text-slate-500">
            Have notes to share?{' '}
            <Link to={user ? '/upload' : '/register'} className="font-bold text-blue-600 hover:underline">
              {user ? 'Upload them now' : 'Sign up free and upload them'}
            </Link>
          </p>
        </div>
      </section>

      {/* 2. Browse by department */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Browse by department</h2>
          <p className="text-sm text-slate-500 mt-1">Pick yours to see only the notes that matter to you.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {DEPARTMENT_TILES.map(({ name, short, icon: Icon, tone }) => (
            <Link
              key={name}
              to={`/explore?department=${encodeURIComponent(name)}`}
              className="group flex items-center gap-3 p-4 bg-white border border-slate-200/90 hover:border-blue-300 rounded-2xl shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition"
            >
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tone}`}>
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <span className="text-sm font-bold text-slate-800 leading-snug">{short}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Recently added notes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Recently added</h2>
            <p className="text-sm text-slate-500 mt-1">The newest notes shared by students.</p>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition self-start sm:self-auto"
          >
            See all notes <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NoteCardSkeleton />
            <NoteCardSkeleton />
            <NoteCardSkeleton />
          </div>
        ) : recentNotes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" aria-hidden="true" />
            <p className="text-base font-bold text-slate-700">No notes yet</p>
            <p className="text-sm text-slate-500">Be the first to share notes for your department.</p>
            <Link
              to={user ? '/upload' : '/register'}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-xs transition"
            >
              <Upload className="w-4 h-4" aria-hidden="true" /> Upload notes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </section>

      {/* 4. How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 space-y-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">How it works</h2>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="flex gap-4 p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
              <span className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 font-black">
                {i + 1}
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  {title} <Icon className="w-4 h-4 text-blue-600" aria-hidden="true" />
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mt-1">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 5. Final call to action (only for visitors who are not signed in) */}
      {!user && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
          <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-8 sm:p-12 text-center space-y-5 shadow-xl shadow-blue-500/10">
            <h2 className="text-3xl font-black tracking-tight">Ready to study smarter?</h2>
            <p className="text-blue-100 max-w-xl mx-auto">
              Create a free account to download notes and share your own. It takes under a minute.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-bold text-[#1d4ed8] bg-[#ffffff] hover:bg-[#eff6ff] rounded-2xl shadow-lg transition"
              >
                Sign up free <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                to="/explore"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/25 rounded-2xl transition"
              >
                Just browse notes
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
