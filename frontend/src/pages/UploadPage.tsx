import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, CheckCircle2, AlertCircle, Loader2, X, FileCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatFileSize } from '../components/NoteCard';

const DEPARTMENTS = [
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

const ALLOWED_EXTENSIONS = ['pdf', 'ppt', 'pptx'];
const MAX_SIZE_MB = 25;

const inputClass =
  'w-full px-4 py-3 text-base bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 text-slate-900 placeholder:text-slate-400';
const labelClass = 'block text-sm font-bold text-slate-800 mb-1.5';
const hintClass = 'mt-1.5 text-xs text-slate-500';

// "unit-3_normalization.pdf" -> "Unit 3 normalization"
const titleFromFileName = (name: string): string => {
  const base = name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : '';
};

export const UploadPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [department, setDepartment] = useState(user?.department || 'Computer Science & Engineering');
  const [semester, setSemester] = useState(user?.semester || 1);
  const [unitNumber, setUnitNumber] = useState(1);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadedNoteId, setUploadedNoteId] = useState<number | null>(null);

  const handleFileSelection = (file: File) => {
    setError(null);
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError(`This file type (.${ext}) is not supported. Please choose a PDF or PowerPoint (.ppt, .pptx) file.`);
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`This file is larger than ${MAX_SIZE_MB} MB. Try compressing it or splitting it into parts.`);
      return;
    }

    setSelectedFile(file);
    // Save some typing: suggest a title from the file name, but never overwrite what the student wrote
    if (!title.trim()) setTitle(titleFromFileName(file.name));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFileSelection(e.target.files[0]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileSelection(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedFile) {
      setError('Please choose a file to upload first.');
      return;
    }
    if (!title.trim() || title.trim().length < 2) {
      setError('Please give your notes a short title, for example “Unit 3 – Normalization”.');
      return;
    }
    if (!subject.trim() || subject.trim().length < 2) {
      setError('Please enter the subject name, for example “Database Management Systems”.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('subject', subject.trim());
      formData.append('department', department);
      formData.append('semester', String(semester));
      formData.append('unit_number', String(unitNumber));
      formData.append('file', selectedFile);

      const res = await api.notes.upload(formData);
      if (res.success) {
        setSuccess('Your notes are uploaded!');
        setUploadedNoteId(res.note.id);
      }
    } catch (err: any) {
      setError(err.message || 'The upload did not work. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
        <Link to="/dashboard" className="hover:text-blue-600 transition">Home</Link>
        <span aria-hidden="true">/</span>
        <span className="text-slate-900 font-bold">Upload notes</span>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Upload notes</h1>
          <p className="mt-1.5 text-sm sm:text-base text-slate-500 leading-relaxed">
            Share your notes or slides with classmates. It takes about a minute.
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 leading-relaxed font-medium">{error}</div>
          </div>
        )}

        {success && (
          <div role="status" className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-3">
            <div className="flex items-center gap-2.5 font-bold text-base text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>{success}</span>
            </div>
            <p className="text-sm text-emerald-700 leading-relaxed">Classmates can now find and download them.</p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                onClick={() => navigate(`/notes/${uploadedNoteId}`)}
                className="px-4 py-2.5 text-sm bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition cursor-pointer"
              >
                View my notes
              </button>
              <button
                onClick={() => navigate('/explore')}
                className="px-4 py-2.5 text-sm bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl transition cursor-pointer"
              >
                Browse all notes
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: the file */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-bold text-slate-800">
                1. Choose your file <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-500">PDF or PowerPoint · up to {MAX_SIZE_MB} MB</span>
            </div>

            {!selectedFile ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  dragActive
                    ? 'border-blue-600 bg-blue-50 scale-[1.01]'
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.ppt,.pptx"
                  onChange={handleFileChange}
                  aria-label="Choose a PDF or PowerPoint file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm text-blue-600 border border-slate-200 flex items-center justify-center mx-auto mb-3.5">
                  <Upload className="w-6 h-6" aria-hidden="true" />
                </div>
                <p className="text-base font-bold text-slate-800">
                  {dragActive ? 'Drop it here' : 'Drag your file here, or click to choose'}
                </p>
                <p className="mt-1 text-sm text-slate-500">.pdf, .ppt or .pptx</p>
              </div>
            ) : (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-[14rem] sm:max-w-md">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatFileSize(selectedFile.size)} · {selectedFile.name.split('.').pop()?.toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  aria-label="Remove selected file"
                  title="Choose a different file"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Step 2: describe it */}
          <div className="space-y-5">
            <p className="text-sm font-bold text-slate-800">2. Tell us what it is</p>

            <div>
              <label htmlFor="u-title" className={labelClass}>Title <span className="text-red-500">*</span></label>
              <input
                id="u-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unit 3 – Normalization"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="u-subject" className={labelClass}>Subject <span className="text-red-500">*</span></label>
              <input
                id="u-subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Database Management Systems"
                className={inputClass}
              />
              <p className={hintClass}>Use the full subject name so classmates can find it when they search.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3 lg:col-span-1">
                <label htmlFor="u-dept" className={labelClass}>Department</label>
                <select id="u-dept" value={department} onChange={(e) => setDepartment(e.target.value)} className={`${inputClass} cursor-pointer`}>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="u-sem" className={labelClass}>Semester</label>
                <select id="u-sem" value={semester} onChange={(e) => setSemester(Number(e.target.value))} className={`${inputClass} cursor-pointer`}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="u-unit" className={labelClass}>Unit</label>
                <select id="u-unit" value={unitNumber} onChange={(e) => setUnitNumber(Number(e.target.value))} className={`${inputClass} cursor-pointer`}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((u) => (
                    <option key={u} value={u}>Unit {u}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="u-desc" className={labelClass}>What’s in it? <span className="font-normal text-slate-500">(optional)</span></label>
              <textarea
                id="u-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Topics covered, important questions, formulas…"
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                <span>Uploading… please wait</span>
              </>
            ) : (
              <>
                <span>Upload notes</span>
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
