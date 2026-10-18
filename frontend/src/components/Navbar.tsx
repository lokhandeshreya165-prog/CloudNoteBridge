import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Upload,
  Cloud,
  HardDrive,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  FileText,
  Compass,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';

export const Navbar: React.FC = () => {
  const { user, health, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const isAwsS3 = health?.storage.is_aws_s3 ?? false;
  // Storage details are developer/admin information, so students never see them.
  const showStorageInfo = user?.role === 'admin';

  const userInitials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition">
                  CloudNoteBridge
                </span>
                <span className="text-[10px] -mt-1 font-bold text-slate-400 uppercase tracking-widest">
                  Student notes
                </span>
              </div>
            </Link>

            {/* Storage Mode Pill (Truthful & Visible) */}
            {showStorageInfo && (
            <div className="hidden lg:flex items-center">
              {isAwsS3 ? (
                <span
                  title="Files stored in Amazon S3 private bucket with AES-256 server-side encryption."
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <Cloud className="w-3.5 h-3.5" />
                  AWS S3 Active
                </span>
              ) : (
                <span
                  title="Local development file storage mode active. Configured via .env."
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <HardDrive className="w-3.5 h-3.5" />
                  Local Storage
                </span>
              )}
            </div>
            )}
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1.5">
            <Link
              to="/explore"
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition ${
                isActive('/explore')
                  ? 'text-blue-700 bg-blue-50 border border-blue-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Compass className="w-4 h-4" />
              Find Notes
            </Link>

            {user && (
              <>
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition ${
                    isActive('/dashboard')
                      ? 'text-blue-700 bg-blue-50 border border-blue-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                <Link
                  to="/my-uploads"
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition ${
                    isActive('/my-uploads')
                      ? 'text-blue-700 bg-blue-50 border border-blue-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  My Uploads
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition ${
                      isActive('/admin')
                        ? 'text-indigo-700 bg-indigo-50 border border-indigo-200/60'
                        : 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/60'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Desktop Actions & User Profile */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <>
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Notes
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {userInitials}
                    </div>
                    <span className="text-xs font-bold text-slate-800 max-w-[110px] truncate">
                      {user.full_name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-60 bg-white border border-slate-200/90 rounded-2xl shadow-xl py-2 z-50 animate-scaleUp"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-xs font-extrabold text-slate-900 truncate">
                          {user.full_name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-700 uppercase">
                            {user.role}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate">
                            Sem {user.semester}
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          My profile
                        </Link>
                        <Link
                          to="/my-uploads"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <FileText className="w-4 h-4 text-slate-400" />
                          My uploads
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition"
                          >
                            <ShieldCheck className="w-4 h-4 text-indigo-500" />
                            Admin panel
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Sign up free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-4 pb-6 space-y-3 animate-slideDown">
          {showStorageInfo && (
          <div className="pb-2">
            {isAwsS3 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Cloud className="w-3.5 h-3.5" /> AWS S3 Cloud Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <HardDrive className="w-3.5 h-3.5" /> Local Development Storage
              </span>
            )}
          </div>
          )}

          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            <Compass className="w-4 h-4 text-blue-600" />
            Find Notes
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                Dashboard
              </Link>
              <Link
                to="/my-uploads"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                My Uploads
              </Link>
              <Link
                to="/upload"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600"
              >
                <Upload className="w-4 h-4" />
                Upload Notes
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                <UserIcon className="w-4 h-4 text-blue-600" />
                My profile
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-indigo-700 bg-indigo-50"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </>
          ) : (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 text-sm font-bold text-slate-700 border border-slate-200 rounded-xl"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-md"
              >
                Sign up free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
