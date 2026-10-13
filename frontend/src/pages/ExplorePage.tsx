import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { Note } from '../types';
import { api } from '../services/api';
import { NoteCard } from '../components/NoteCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Course Notes
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Browse verified academic documents, syllabus units, and slides.
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
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center justify-between md:hidden mb-3">
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 p-2 rounded-lg bg-slate-50 border border-slate-200"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showFiltersMobile ? 'Hide Filters' : 'Show Filters'}
          </button>
          <span className="text-xs text-slate-500 font-medium">{totalCount} results</span>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 ${showFiltersMobile ? 'block' : 'hidden md:grid'}`}>
          {/* Department */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
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
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Semester</label>
            <select
              value={semester}
              onChange={(e) => {
                setSemester(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          {/* Unit */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Syllabus Unit</label>
            <select
              value={unit}
              onChange={(e) => {
                setUnit(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
            >
              <option value="">All Units</option>
              {[1, 2, 3, 4, 5, 6].map((u) => (
                <option key={u} value={u}>
                  Unit {u}
                </option>
              ))}
            </select>
          </div>

          {/* File Format */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Format</label>
            <select
              value={fileType}
              onChange={(e) => {
                setFileType(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
            >
              <option value="">All Formats</option>
              <option value="pdf">PDF Documents</option>
              <option value="pptx">PPTX Presentations</option>
              <option value="ppt">PPT Slides</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
            >
              <option value="newest">Newest First</option>
              <option value="title">Note Title (A-Z)</option>
              <option value="semester">Semester</option>
              <option value="unit">Unit Number</option>
            </select>
          </div>
        </div>

        {/* Clear Filters indicator */}
        {(q || (department && department !== 'All Departments') || semester || unit || fileType) && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Showing {totalCount} matching notes</span>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-semibold cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Notes Grid */}
      {loading ? (
        <LoadingSpinner message="Searching verified course notes..." className="py-20" />
      ) : notes.length === 0 ? (
        <EmptyState
          title="No Course Notes Found"
          description="Try broadening your search term or clearing some of the filters above."
          actionText="Clear All Filters"
          onActionClick={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <span className="text-xs text-slate-500 font-medium">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
