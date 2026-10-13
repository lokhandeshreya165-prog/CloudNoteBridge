import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Cloud,
  Search,
  BookOpen,
  Shield,
  ArrowRight,
  Upload,
  FileCheck,
  Download,
  Filter,
} from 'lucide-react';
import { Note } from '../types';
import { api } from '../services/api';
import { NoteCard } from '../components/NoteCard';

export const LandingPage: React.FC = () => {
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await api.notes.list({ per_page: 3, sort_by: 'newest' });
        if (res.success) {
          setRecentNotes(res.notes);
        }
      } catch (err) {
        console.error('Failed to load recent notes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-slate-50/50 py-20 sm:py-28 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100/80 text-blue-700 border border-blue-200 mb-6">
            <Cloud className="w-3.5 h-3.5" />
            Cloud-Based Academic Knowledge Sharing
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight max-w-4xl mx-auto leading-tight">
            Your Knowledge. <span className="text-blue-600">Connected.</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Eliminate notes scattered across WhatsApp chats, email attachments, and lost drives.
            CloudNoteBridge gives college students a centralized, cloud-backed platform to discover,
            organize, and download syllabus-aligned unit notes.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/explore"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition"
            >
              <Search className="w-4 h-4" />
              Explore Notes
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/upload"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition"
            >
              <Upload className="w-4 h-4 text-blue-600" />
              Share Your Notes
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Engineered for Academic Success
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            A cohesive architecture combining high-speed search, secure cloud storage, and intuitive organization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Cloud className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">Amazon S3 Cloud Storage</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Documents are stored in a private AWS S3 bucket with server-side AES256 encryption and accessible only via short-lived authorized URLs.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">Smart Multi-Filter Search</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Filter by Department, Semester (1–8), Unit (1–6), Subject title, or Document format (PDF, PPT/PPTX) to find exact course topics.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">Organized Learning</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unit-wise breakdown maps directly to university syllabi, allowing students to systematically study module-by-module before examinations.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">Secure Access & Audit</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Role-based student access, strict document ownership boundaries, server-side validation, and audit tracking for every download.
            </p>
          </div>
        </div>
      </section>

      {/* Clear 4-Step Academic Workflow */}
      <section className="bg-white border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">How It Works</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              From Lecture Hall to Cloud in Seconds
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto font-bold text-base shadow-sm">
                1
              </div>
              <h3 className="text-base font-semibold text-slate-900">1. Upload Notes</h3>
              <p className="text-xs text-slate-500">
                Sign in and select your lecture PDF or presentation slides, adding your syllabus unit and subject details.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto font-bold text-base shadow-sm">
                2
              </div>
              <h3 className="text-base font-semibold text-slate-900">2. Cloud Organization</h3>
              <p className="text-xs text-slate-500">
                The backend verifies file headers and pushes the document to private cloud storage while indexing metadata in MySQL.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto font-bold text-base shadow-sm">
                3
              </div>
              <h3 className="text-base font-semibold text-slate-900">3. Discover & Filter</h3>
              <p className="text-xs text-slate-500">
                Fellow classmates filter by department, semester, and unit to locate the exact materials needed.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto font-bold text-base shadow-sm">
                4
              </div>
              <h3 className="text-base font-semibold text-slate-900">4. Instant Download</h3>
              <p className="text-xs text-slate-500">
                Generate an authorized download ticket and save the document for offline revision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real Recent Uploads Preview */}
      {recentNotes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recent Academic Notes</h2>
              <p className="text-xs text-slate-500 mt-1">Live notes directly from the database.</p>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View all course notes <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
