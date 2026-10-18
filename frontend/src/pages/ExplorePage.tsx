import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, ChevronLeft, ChevronRight, SlidersHorizontal, RotateCcw, BookOpen } from 'lucide-react';
import { Note } from '../types';
import { api } from '../services/api';
import { NoteCard } from '../components/NoteCard';
import { EmptyState } from '../components/EmptyState';
import { GridSkeleton } from '../components/LoadingSkeleton';

const ALL_DEPARTMENTS = 'All Departments';
const DEPARTMENTS = [
  ALL_DEPARTMENTS,
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

const FILE_TYPE_LABELS: Record<string, string> = { pdf: 'PDF', pptx: 'Slides' };
const SORT_LABELS: Record<string, string> = {
  newest: 'Newest first',
  title: 'A to Z',
  semester: 'By semester',
  unit: 'By unit',
};

const selectClass =
  'w-full py-2.5 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 text-slate-800 font-medium cursor-pointer';
const labelClass = 'block text-xs font-bold text-slate-600 mb-1';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters live in the URL, so the Back button and shared links keep them
  const q = searchParams.get('q') || '';
  const department = searchParams.get('department') || ALL_DEPARTMENTS;
  const semester = searchParams.get('semester') || '';
  const unit = searchParams.get('unit') || '';
  const fileType = searchParams.get('file_type') || '';
  const sortBy = searchParams.get('sort_by') || 'newest';
  const page = Number(searchParams.get('page')) || 1;

  const updateParams = (changes: Record<string, string | null>, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (resetPage) next.delete('page');
    setSearchParams(next, { replace: true });
  };

  // The search box types freely; the search itself runs shortly after you stop typing
  const [searchText, setSearchText] = useState(q);
  useEffect(() => {
    setSearchText(q);
  }, [q]);
  useEffect(() => {
    if (searchText.trim() === q.trim()) return;
    const t = setTimeout(() => updateParams({ q: searchText.trim() || null }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const [notes, setNotes] = useState<Note[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState<boolean>(Boolean(unit || fileType || sortBy !== 'newest'));

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string | number> = { page, per_page: 9, sort_by: sortBy };
        if (q.trim()) params.q = q.trim();
        if (department !== ALL_DEPARTMENTS) params.department = department;
        if (semester) params.semester = semester;
        if (unit) params.unit = unit;
        if (fileType) params.file_type = fileType;

        const res = await api.notes.list(params);
        if (!cancelled && res.success) {
          setNotes(res.notes);
          setTotalPages(res.total_pages);
          setTotalCount(res.total);
        }
      } catch (err) {
        console.error('Failed to query notes', err);
        if (!cancelled) setError('We could not load the notes. Please check your connection and try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [q, page, department, semester, unit, fileType, sortBy]);

  const handleResetFilters = () => {
    setSearchText('');
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  // Chips for every filter that is switched on, each removable with one click
  const chips: { label: string; onRemove: () => void }[] = [];
  if (q.trim()) chips.push({ label: `“${q.trim()}”`, onRemove: () => updateParams({ q: null }) });
  if (department !== ALL_DEPARTMENTS) chips.push({ label: department, onRemove: () => updateParams({ department: null }) });
  if (semester) chips.push({ label: `Semester ${semester}`, onRemove: () => updateParams({ semester: null }) });
  if (unit) chips.push({ label: `Unit ${unit}`, onRemove: () => updateParams({ unit: null }) });
  if (fileType) chips.push({ label: FILE_TYPE_LABELS[fileType] || fileType, onRemove: () => updateParams({ file_type: null }) });
  if (sortBy !== 'newest') chips.push({ label: SORT_LABELS[sortBy] || sortBy, onRemove: () => updateParams({ sort_by: null }) });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Find notes</h1>
        <p className="mt-1 text-sm text-slate-500">Search by topic, or narrow down by department, semester and unit.</p>
      </div>

      {/* Search + filters in one card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="relative" role="search">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            aria-label="Search notes"
            placeholder="Search by title, subject or topic…"
            className="w-full pl-12 pr-4 py-3 text-base bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="f-dept" className={labelClass}>Department</label>
            <select id="f-dept" value={department} onChange={(e) => updateParams({ department: e.target.value === ALL_DEPARTMENTS ? null : e.target.value })} className={selectClass}>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-sem" className={labelClass}>Semester</label>
            <select id="f-sem" value={semester} onChange={(e) => updateParams({ semester: e.target.value || null })} className={selectClass}>
              <option value="">All semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          aria-expanded={showMore}
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
          {showMore ? 'Fewer filters' : 'More filters (unit, file type, sort)'}
        </button>

        {showMore && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn">
            <div>
              <label htmlFor="f-unit" className={labelClass}>Unit</label>
              <select id="f-unit" value={unit} onChange={(e) => updateParams({ unit: e.target.value || null })} className={selectClass}>
                <option value="">All units</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((u) => (
                  <option key={u} value={u}>Unit {u}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="f-type" className={labelClass}>File type</label>
              <select id="f-type" value={fileType} onChange={(e) => updateParams({ file_type: e.target.value || null })} className={selectClass}>
                <option value="">All types</option>
                <option value="pdf">PDF</option>
                <option value="pptx">Slides (PowerPoint)</option>
              </select>
            </div>
            <div>
              <label htmlFor="f-sort" className={labelClass}>Sort by</label>
              <select id="f-sort" value={sortBy} onChange={(e) => updateParams({ sort_by: e.target.value === 'newest' ? null : e.target.value })} className={selectClass}>
                {Object.entries(SORT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Result count + active filter chips */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-sm" aria-live="polite">
          <span className="text-slate-500 mr-1">
            <span className="font-bold text-slate-900">{loading ? '…' : totalCount}</span> {totalCount === 1 ? 'note' : 'notes'} found
          </span>
          {chips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={chip.onRemove}
              title="Remove this filter"
              className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 cursor-pointer"
            >
              {chip.label}
              <X className="w-3.5 h-3.5" aria-label="Remove" />
            </button>
          ))}
          {chips.length > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-700 cursor-pointer ml-1"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {error ? (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium" role="alert">
          {error}
        </div>
      ) : loading ? (
        <GridSkeleton count={9} />
      ) : notes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => updateParams({ page: String(Math.max(1, page - 1)) }, false)}
                disabled={page === 1}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-slate-700 px-4 py-2 rounded-xl bg-white border border-slate-200">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => updateParams({ page: String(Math.min(totalPages, page + 1)) }, false)}
                disabled={page === totalPages}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No notes match these filters"
          description="Try a shorter search, or clear a filter. You can also be the one to upload notes for this subject."
          actionText="Clear all filters"
          onActionClick={handleResetFilters}
          icon={BookOpen}
        />
      )}
    </div>
  );
};
