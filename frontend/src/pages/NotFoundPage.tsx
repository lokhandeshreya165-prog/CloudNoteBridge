import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft, ShieldAlert } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-fadeIn">
      <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-sm border border-blue-100">
        <FileQuestion className="w-10 h-10" />
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">
        Error 404
      </span>
      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
        Academic Resource Not Found
      </h1>
      <p className="mt-3 text-sm text-slate-500 max-w-md leading-relaxed">
        The course syllabus unit or route you requested does not exist or may have been reorganized by an instructor.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-lg shadow-blue-500/20 transition transform hover:-translate-y-0.5 active:translate-y-0"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Home Page
      </Link>
    </div>
  );
};

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-fadeIn">
      <div className="w-20 h-20 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mb-6 shadow-sm border border-red-100">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full mb-3">
        Error 403
      </span>
      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
        Access Restricted
      </h1>
      <p className="mt-3 text-sm text-slate-500 max-w-md leading-relaxed">
        You do not hold administrator permissions to access this governance area. Please sign in with an authorized administrator account.
      </p>
      <Link
        to="/dashboard"
        className="mt-8 inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-2xl shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Student Dashboard
      </Link>
    </div>
  );
};
