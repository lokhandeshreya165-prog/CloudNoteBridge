import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  FileText,
  Presentation,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Cloud,
  FileCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
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

export const UploadPage: React.FC = () => {
  const { user, health } = useAuth();
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

  const isAwsS3 = health?.storage.is_aws_s3 ?? false;

  const handleFileSelection = (file: File) => {
    setError(null);
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError(`Unsupported file type (.${ext}). Allowed formats: PDF, PPT, PPTX.`);
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File size exceeds ${MAX_SIZE_MB} MB limit.`);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim() || title.length < 2) {
      setError('Please provide a descriptive title for this note.');
      return;
    }

    if (!subject.trim() || subject.length < 2) {
      setError('Please provide the course subject name.');
      return;
    }

    if (!selectedFile) {
      setError('Please select a PDF or PPT/PPTX document to upload.');
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
        setSuccess('Course note uploaded and verified successfully!');
        setUploadedNoteId(res.note.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <Link to="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Upload Note</span>
        </div>

        <div className="flex items-center gap-1.5">
          {isAwsS3 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Cloud className="w-3 h-3" />
              AWS S3 Storage
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <ShieldCheck className="w-3 h-3" />
              Local Dev Storage
            </span>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Academic Note Contribution</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Share Academic Notes
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
            Publish syllabus unit notes, exam summaries, or slides to help your college peers study smarter.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50/90 border border-red-200 flex items-start gap-3 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed font-medium">{error}</div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-800 space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5 font-bold text-sm text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Your document is stored securely and indexed in the campus catalog for students.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                onClick={() => navigate(`/notes/${uploadedNoteId}`)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition cursor-pointer shadow-xs"
              >
                View Uploaded Note
              </button>
              <button
                onClick={() => navigate('/explore')}
                className="px-4 py-2 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl transition cursor-pointer"
              >
                Go to Explore
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Note Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Note Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unit 3: Normalization & Functional Dependencies"
              className="w-full px-4 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 font-medium"
            />
          </div>

          {/* Subject & Department in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Course Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Database Management Systems"
                className="w-full px-4 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Semester & Unit Number in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Semester <span className="text-red-500">*</span>
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Syllabus Unit Number <span className="text-red-500">*</span>
              </label>
              <select
                value={unitNumber}
                onChange={(e) => setUnitNumber(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((u) => (
                  <option key={u} value={u}>
                    Unit {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description & Topics Covered (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of topics, key exam questions, derivations, or practice questions..."
              className="w-full px-4 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Drag & Drop File Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Document File <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">Max {MAX_SIZE_MB} MB</span>
            </div>

            {!selectedFile ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  dragActive
                    ? 'border-blue-600 bg-blue-50/60 scale-[1.01]'
                    : 'border-slate-200 hover:border-blue-300 bg-slate-50/60 hover:bg-slate-50'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.ppt,.pptx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-13 h-13 bg-white rounded-2xl shadow-sm text-blue-600 border border-slate-200/80 flex items-center justify-center mx-auto mb-3.5">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  Click or drag and drop your document here
                </p>
                <p className="mt-1 text-xs text-slate-400 font-medium">
                  Accepted formats: <span className="font-semibold text-slate-600">PDF (.pdf)</span>, <span className="font-semibold text-slate-600">PowerPoint (.pptx, .ppt)</span>
                </p>
              </div>
            ) : (
              <div className="p-4 bg-blue-50/70 border border-blue-200/90 rounded-2xl flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {formatFileSize(selectedFile.size)} • {selectedFile.name.split('.').pop()?.toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  title="Remove selected file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !selectedFile}
            className="w-full mt-2 py-3.5 px-4 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying & Uploading Document...</span>
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4" />
                <span>Upload Note to Cloud Library</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
