import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Sparkles,
  Users,
  Share2,
  Cloud,
  FileText,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both your college email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('student@college.edu');
    setPassword('StudentPass123!');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-stretch bg-slate-50">
      {/* =========================================================================
          LEFT HERO SECTION (55-60% width on desktop, inspirational study hero)
          ========================================================================= */}
      <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden flex-col justify-between p-12 text-white bg-slate-950">
        {/* Background Image with Fallback and Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/study-hero.jpg"
            alt="University students collaborating and sharing notes in a modern study library"
            className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.05]"
            onError={(e) => {
              // Fallback to high-res Unsplash study photography if local image is unavailable
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80';
            }}
          />
          {/* Multi-layered dark navy overlay for readable white text */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-blue-950/65" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-transparent to-slate-950/40" />
        </div>

        {/* Top Header / Brand Identity */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block">
                CloudNoteBridge
              </span>
              <span className="text-[11px] font-medium text-blue-200/80 tracking-wider uppercase block">
                Academic Knowledge Cloud
              </span>
            </div>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-blue-200 border border-white/15">
            <Cloud className="w-3.5 h-3.5 text-blue-400" />
            <span>Secure Cloud Workspace</span>
          </div>
        </div>

        {/* Center Main Motivational Headline & Features */}
        <div className="relative z-10 my-auto py-12 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-5 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Built For College Students & Peer Learning</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
            Your Knowledge. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-sky-300">
              Their Success.
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-200/90 leading-relaxed font-normal">
            Discover a smarter way to learn together. Share your notes, explore new ideas, and make every study session count.
          </p>

          {/* Three Feature Highlights with Icons */}
          <div className="mt-8 grid grid-cols-1 gap-4 pt-6 border-t border-white/10">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center shrink-0 mt-0.5 text-blue-300">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Learn Together</h4>
                <p className="text-xs text-slate-300/80 leading-relaxed">
                  Connect knowledge with your student community and campus batches.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center shrink-0 mt-0.5 text-indigo-300">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Share Smarter</h4>
                <p className="text-xs text-slate-300/80 leading-relaxed">
                  Make useful academic notes and unit summaries accessible to your peers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-sky-600/30 border border-sky-400/30 flex items-center justify-center shrink-0 mt-0.5 text-sky-300">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Study Anywhere</h4>
                <p className="text-xs text-slate-300/80 leading-relaxed">
                  Access your verified learning resources through a cloud-connected platform.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Sample Document Card Overlay (Tasteful Visual UI Accent) */}
        <div className="relative z-10 flex items-end justify-between">
          <div className="glass-dark rounded-2xl p-4 max-w-sm shadow-2xl backdrop-blur-xl border border-white/15 animate-float-subtle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider">
                    Unit 3 Notes
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-200 border border-red-500/30">
                    PDF Document
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white truncate mt-0.5">
                  Database Management Systems
                </h4>
                <p className="text-[11px] text-slate-300/80 flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Syllabus Verified • Semester 5</span>
                </p>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            Academic Community Platform
          </div>
        </div>
      </div>

      {/* =========================================================================
          RIGHT LOGIN SECTION (40-45% width on desktop, clean premium login form)
          ========================================================================= */}
      <div className="w-full lg:w-[42%] flex flex-col justify-between p-6 sm:p-12 lg:p-14 bg-white shadow-xl lg:shadow-none">
        {/* Mobile Header (Brand Icon for Small Screens) */}
        <div className="lg:hidden flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              CloudNoteBridge
            </span>
          </Link>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
            Student Portal
          </span>
        </div>

        {/* Center Login Form Container */}
        <div className="max-w-md w-full mx-auto my-auto space-y-7">
          {/* Header */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Student & Faculty Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Continue your learning journey with CloudNoteBridge.
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50/90 border border-red-200 flex items-start gap-3 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4.5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                College Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span>Remember me on this browser</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Your Workspace</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Demo Student Account
                </span>
                <button
                  type="button"
                  onClick={fillDemoAccount}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                >
                  Auto-Fill
                </button>
              </div>
              <div className="text-[11px] text-slate-500 space-y-0.5 font-mono">
                <div>Email: <span className="text-slate-800 font-semibold">student@college.edu</span></div>
                <div>Pass: <span className="text-slate-800 font-semibold">StudentPass123!</span></div>
              </div>
            </div>
          </div>

          {/* Link to Register */}
          <div className="text-center text-xs text-slate-600 pt-2">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Register here
            </Link>
          </div>
        </div>

        {/* Small Footer */}
        <div className="pt-8 text-center text-xs text-slate-400 font-medium">
          Learn together. Grow together.
        </div>
      </div>
    </div>
  );
};
