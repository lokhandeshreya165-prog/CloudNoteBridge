import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Search, FileText } from 'lucide-react';
import { Note } from '../types';
import { api } from '../services/api';
import { NoteCard } from '../components/NoteCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

export const MyUploadsPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchMyNotes = async () => {
    setLoading(true);
    try {
      const res = await api.notes.myNotes({ q: search });
      if (res.success) {
        setNotes(res.notes);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve your uploads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyNotes();
  }, [search]);

  const handleDelete = async (noteId: number) => {
    if (!window.confirm('Are you sure you want to delete this note? It will be removed from cloud storage.')) {
      return;
    }

    try {
      await api.notes.delete(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete note.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Uploaded Notes
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage your contributed syllabus notes and academic slides.
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
        >
          <Upload className="w-4 h-4" />
          Upload New Document
        </Link>
      </div>

      {/* Filter search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter your uploads..."
          className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
        />
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your uploads..." className="py-20" />
      ) : notes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="You Haven't Uploaded Any Notes Yet"
          description="Contribute to your college community by sharing course documents or unit revision slides."
          actionText="Upload Your First Note"
          actionLink="/upload"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} showDelete={true} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};
