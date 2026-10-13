import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Compass,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { Note } from '../types';
import { api } from '../services/api';
import { NoteCard } from '../components/NoteCard';
import { EmptyState } from '../components/EmptyState';
import { GridSkeleton } from '../components/LoadingSkeleton';

const DEPARTMENTS = [
  'All Departments',
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Biotechnology',
  'Business Administration',
  'Basic Sciences & Humanities',
];

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states initialized from URL params
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [department, setDepartment] = useState(searchParams.get('department') || 'All Departments');
  const [semester, setSemester] = useState(searchParams.get('semester') || '');
  const [unit, setUnit] = useState(searchParams.get('unit') || '');
  const [fileType, setFileType] = useState(searchParams.get('file_type') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const [notes, setNotes] = useState<Note[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        per_page: 9,
        sort_by: sortBy,
      };

      if (q.trim()) params.q = q.trim();
      if (department && department !== 'All Departments') params.department = department;
      if (semester) params.semester = semester;
      if (unit) params.unit = unit;
      if (fileType) params.file_type = fileType;

      const res = await api.notes.list(params);
      if (res.success) {
        setNotes(res.notes);
        setTotalPages(res.total_pages);
        setTotalCount(res.total);
      }
    } catch (err) {
      console.error('Failed to query notes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [page, department, semester, unit, fileType, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchNotes();
  };

  const handleResetFilters = () => {
    setQ('');
    setDepartment('All Departments');
    setSemester('');
    setUnit('');
    setFileType('');
    setSortBy('newest');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    q || (department && department !== 'All Departments') || semester || unit || fileType || sortBy !== 'newest'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 mb-2">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>Academic Resource Discovery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Course Notes
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Browse verified academic documents, syllabus unit guides, and lecture slides.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title, topic, or subject..."
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer active:scale-95"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between md:hidden mb-3">
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            {showFiltersMobile ? 'Hide Filters' : 'Show Filters'}
          </button>
          <span className="text-xs text-slate-500 font-semibold">{totalCount} notes found</span>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 ${showFiltersMobile ? 'block' : 'hidden md:grid'}`}>
          {/* Department */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-medium"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Semester
            </label>
            <select
              value={semester}
              onChange={(e) => {
                setSemester(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-medium"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          {/* Unit */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Unit Number
            </label>
            <select
              value={unit}
              onChange={(e) => {
                setUnit(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-medium"
            >
              <option value="">All Units</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((u) => (
                <option key={u} value={u}>
                  Unit {u}
                </option>
              ))}
            </select>
          </div>

          {/* File Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              File Format
            </label>
            <select
              value={fileType}
              onChange={(e) => {
                setFileType(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-medium"
            >
              <option value="">All Formats</option>
              <option value="pdf">PDF Document (.pdf)</option>
              <option value="pptx">Slides (.pptx, .ppt)</option>
              <option value="docx">Word (.docx, .doc)</option>
              <option value="txt">Text File (.txt)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Sort Order
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-medium"
            >
              <option value="newest">Recently Uploaded</option>
              <option value="title">Alphabetical (Title)</option>
              <option value="semester">By Semester</option>
              <option value="unit">By Syllabus Unit</option>
            </select>
          </div>
        </div>

        {/* Active Filter Summary Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="font-bold text-slate-900">{totalCount}</span> notes matching your criteria
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset all filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Note Grid / Results */}
      {loading ? (
        <GridSkeleton count={9} />
      ) : notes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-semibold text-slate-700 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No notes match your filters"
          description="Try broadening your search term, selecting 'All Departments', or clearing some filters."
          actionText="Clear Filters"
          onActionClick={handleResetFilters}
          icon={BookOpen}
        />
      )}
    </div>
  );
};
