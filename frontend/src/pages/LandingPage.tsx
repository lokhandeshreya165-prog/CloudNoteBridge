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
  Sparkles,
  Users,
  CheckCircle2,
  GraduationCap,
  HardDrive,
  Layers,
  Lock,
} from 'lucide-react';
import { Note } from '../types';
import { api } from '../services/api';
import { NoteCard } from '../components/NoteCard';
import { NoteCardSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user, health } = useAuth();
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const isAwsS3 = health?.storage.is_aws_s3 ?? false;

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
    <div className="space-y-20 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-slate-200/80 bg-gradient-to-b from-blue-50/40 via-white to-slate-50/30">
        {/* Soft background ambient blur spots */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-blue-400/10 via-indigo-400/10 to-teal-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-100/70 text-blue-800 border border-blue-200/90 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Cloud-Native Academic Knowledge Hub
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.12]">
                Your Course Notes. <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent">
                  Organized in the Cloud.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                No more lost WhatsApp attachments or broken Google Drive links. CloudNoteBridge connects college students through an authenticated, unit-aligned repository backed by cloud storage.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <Link
                  to="/explore"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-xl transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Search className="w-4 h-4" />
                  Explore Notes
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to={user ? "/upload" : "/register"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xs hover:shadow-md transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Upload className="w-4 h-4 text-blue-600" />
                  {user ? "Share Your Notes" : "Join Free as Student"}
                </Link>
              </div>

              {/* Feature Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Unit-wise syllabus (1–6)
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Presigned token downloads
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Free for students
                </span>
              </div>
            </div>

            {/* Right Visual Image Card Column */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Floating Image Container with Glass Shadow */}
                <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl shadow-blue-500/15">
                  <img
                    src="/study-hero.jpg"
                    alt="Students collaborating on academic notes"
                    className="w-full h-[400px] object-cover object-center transform hover:scale-105 transition duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                  {/* Glassmorphic Document Highlight Badge */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/40 shadow-lg text-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        Database Systems • Unit 3
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">2.4 MB</span>
                    </div>
                    <p className="text-xs font-extrabold text-slate-900 truncate">
                      Relational Algebra & Normalization Complete Notes
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 text-emerald-600 font-bold">
                        <Download className="w-3 h-3" /> 148 Downloads
                      </span>
                      <span>•</span>
                      <span>PDF Document</span>
                    </div>
                  </div>
                </div>

                {/* Floating Top Pill */}
                <div className="absolute -top-4 -left-4 px-3.5 py-1.5 rounded-2xl bg-white border border-slate-200/90 shadow-lg flex items-center gap-2 text-xs font-bold text-slate-800">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isAwsS3 ? 'AWS S3 Cloud Active' : 'Local Storage Ready'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/80">
            Engineered For Higher Education
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Everything You Need For Exam Season
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Built from scratch to solve real academic collaboration challenges across engineering, science, and business departments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs hover:shadow-xl transition transform hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition">
              <Cloud className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Cloud Object Storage</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Files are stored in Amazon S3 buckets with server-side AES256 encryption. Delivered securely via authorized expiring presigned URLs.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs hover:shadow-xl transition transform hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Multi-Filter Discovery</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Drill down instantly by Department, Semester (1–8), Syllabus Unit (1–6), Subject title, or file format (PDF, PPT/PPTX).
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs hover:shadow-xl transition transform hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Unit-Wise Organization</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Course materials map directly to official university syllabus modules. No searching through 400-page unsorted documents.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs hover:shadow-xl transition transform hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 group-hover:bg-purple-600 group-hover:text-white transition">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Academic Integrity & Safety</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Student moderation reporting queue, admin oversight, and Argon2 password hashing protect users and content accuracy.
            </p>
          </div>
        </div>
      </section>

      {/* 4-Step Academic Workflow */}
      <section className="bg-white border-y border-slate-200/80 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Simple Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              From Lecture Hall to Cloud in Seconds
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Designed for effortless sharing between lectures or right before midterms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/70 text-center space-y-3 relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto font-black text-lg shadow-md shadow-blue-500/20">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Upload Notes</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Drag-and-drop lecture slides or typed notes. Select syllabus unit and course title.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/70 text-center space-y-3 relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto font-black text-lg shadow-md shadow-blue-500/20">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Cloud Storage</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Securely encrypted and pushed to cloud object storage while metadata is indexed in database.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/70 text-center space-y-3 relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto font-black text-lg shadow-md shadow-blue-500/20">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Instant Search</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Students filter by subject, department, or unit number to pinpoint exact study materials.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/70 text-center space-y-3 relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto font-black text-lg shadow-md shadow-blue-500/20">
                4
              </div>
              <h3 className="text-base font-bold text-slate-900">Presigned Download</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Generate authenticated temporary presigned URLs to safely download original documents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Recent Uploads Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              Live Repository
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Recently Contributed Course Notes
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Fresh study materials uploaded by students across departments.
            </p>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition"
          >
            Explore all notes <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NoteCardSkeleton />
            <NoteCardSkeleton />
            <NoteCardSkeleton />
          </div>
        ) : recentNotes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No notes uploaded yet</p>
            <p className="text-xs text-slate-400">Be the first to share notes for your department!</p>
            <Link
              to="/upload"
              className="inline-block px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Upload Notes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-8 sm:p-14 shadow-2xl shadow-blue-500/20 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to Share & Excel Together?
            </h2>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              Create your free student account, find your course materials, and contribute your study notes to help the entire campus succeed.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-blue-700 bg-white hover:bg-blue-50 rounded-2xl shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Get Started for Free
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/explore"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition"
            >
              <Search className="w-4 h-4" />
              Browse Notes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
