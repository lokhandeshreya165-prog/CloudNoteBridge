import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="max-w-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">CloudNoteBridge</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              One place for your college notes. Find them by subject, semester and unit, and share yours with classmates.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-10 gap-y-6 text-sm">
            <div>
              <h4 className="font-bold text-slate-900 mb-3">Notes</h4>
              <ul className="space-y-2 text-slate-500 font-medium">
                <li><Link to="/explore" className="hover:text-blue-600 transition">Find notes</Link></li>
                <li><Link to="/upload" className="hover:text-blue-600 transition">Upload notes</Link></li>
                <li><Link to="/my-uploads" className="hover:text-blue-600 transition">My uploads</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-3">Account</h4>
              <ul className="space-y-2 text-slate-500 font-medium">
                <li><Link to="/login" className="hover:text-blue-600 transition">Log in</Link></li>
                <li><Link to="/register" className="hover:text-blue-600 transition">Sign up free</Link></li>
                <li><Link to="/profile" className="hover:text-blue-600 transition">My profile</Link></li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-2 text-xs text-slate-400">
          <span>© {new Date().getFullYear()} CloudNoteBridge — a college project.</span>
          <span>Notes are shared by students for study. Please upload only your own work.</span>
        </div>
      </div>
    </footer>
  );
};
