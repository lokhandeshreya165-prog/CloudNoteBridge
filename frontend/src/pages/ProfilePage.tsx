import React, { useEffect, useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Building,
  Layers,
  Calendar,
  Shield,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Award,
  Sparkles,
  Lock,
  Edit3,
  X,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

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

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    department: '',
    semester: 1,
  });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await api.profile.get();
      if (res.success) {
        setProfile(res.profile);
        setFormData({
          full_name: res.profile.full_name,
          department: res.profile.department,
          semester: res.profile.semester,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.profile.update({
        full_name: formData.full_name.trim(),
        department: formData.department,
        semester: Number(formData.semester),
      });
      if (res.success) {
        setSuccess('Profile updated successfully.');
        setEditing(false);
        await refreshUser();
        await loadProfile();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading student profile..." className="py-24" />;
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            Academic Identity
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Profile & Reputation
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage your verified university details and monitor peer engagement.
          </p>
        </div>

        <button
          onClick={() => {
            setEditing(!editing);
            setSuccess(null);
            setError(null);
          }}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
            editing
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/10'
          }`}
        >
          {editing ? (
            <>
              <X className="w-3.5 h-3.5" /> Cancel Editing
            </>
          ) : (
            <>
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile
            </>
          )}
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-xs text-red-700 animate-slideDown">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-800 animate-slideDown">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Student Profile Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-blue-100/50 via-indigo-50/20 to-transparent pointer-events-none rounded-bl-full" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-500/20">
            {initials}
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {profile?.full_name}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                <Shield className="w-3 h-3" />
                {profile?.role}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Verified Student
              </span>
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {profile?.email}
            </p>
          </div>
        </div>

        {/* View / Edit Mode Form */}
        {!editing ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-500" /> Department
              </span>
              <p className="text-xs font-bold text-slate-800 leading-snug">
                {profile?.department}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" /> Current Standing
              </span>
              <p className="text-xs font-bold text-slate-800">
                Semester {profile?.semester}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Member Since
              </span>
              <p className="text-xs font-bold text-slate-800">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" /> Contributor Tier
              </span>
              <p className="text-xs font-bold text-slate-800">
                {profile?.stats?.uploads_count > 5
                  ? 'Master Scholar'
                  : profile?.stats?.uploads_count > 0
                  ? 'Active Contributor'
                  : 'Junior Scholar'}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5 animate-fadeIn">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Legal / College Name
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g. Shreya Lokhande"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Academic Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition cursor-pointer"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Current Semester Standing
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/10 transition cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Save Profile Details
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Contribution Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex items-center gap-5 hover:shadow-md transition">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Contributed Course Notes
            </span>
            <p className="text-3xl font-extrabold text-slate-900 mt-0.5">
              {profile?.stats?.uploads_count || 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Course units and slide decks uploaded
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex items-center gap-5 hover:shadow-md transition">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Download className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Total Peer Downloads
            </span>
            <p className="text-3xl font-extrabold text-slate-900 mt-0.5">
              {profile?.stats?.total_downloads_received || 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Classmates helped with your materials
            </p>
          </div>
        </div>
      </div>

      {/* Cloud Security & Privacy Box */}
      <div className="p-5 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-slate-900/10">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-cyan-300">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">
              Data Privacy & Academic Isolation
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              Your account sessions are secured using encrypted HTTP-only cookies and passwords are hash-protected with Argon2id. Documents uploaded to CloudNoteBridge remain encrypted in cloud object storage.
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            AES-256 Storage
          </span>
        </div>
      </div>
    </div>
  );
};
