import React from 'react';
import { BookOpen, ShieldCheck, Cloud, Database, Server } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 tracking-tight text-base">CloudNoteBridge</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Centralized, cloud-based academic note sharing platform built for college students to organize,
              discover, and download syllabus-aligned materials.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><a href="/" className="hover:text-blue-600 transition">Home</a></li>
              <li><a href="/explore" className="hover:text-blue-600 transition">Explore Course Notes</a></li>
              <li><a href="/login" className="hover:text-blue-600 transition">Student Sign In</a></li>
              <li><a href="/register" className="hover:text-blue-600 transition">New Registration</a></li>
            </ul>
          </div>

          {/* Architecture Responsibilities */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Architecture Stack</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-1.5"><Server className="w-3.5 h-3.5 text-blue-500" /> Python Flask App Factory</li>
              <li className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-emerald-500" /> MySQL Relational Database</li>
              <li className="flex items-center gap-1.5"><Cloud className="w-3.5 h-3.5 text-cyan-500" /> Amazon S3 Private Bucket</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Argon2 & Role Authorization</li>
            </ul>
          </div>

          {/* Academic Integrity */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Academic Integrity</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              CloudNoteBridge encourages peer-to-peer knowledge collaboration. All uploaded materials are student-contributed for educational study and unit review.
            </p>
            <div className="mt-3 text-[11px] text-slate-400">
              © {new Date().getFullYear()} CloudNoteBridge. College Project Implementation.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
