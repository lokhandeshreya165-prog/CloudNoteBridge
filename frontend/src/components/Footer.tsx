import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Cloud, Database, Server, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                CloudNoteBridge
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Centralized, cloud-based academic note sharing platform built for college students to organize,
              discover, and download syllabus-aligned materials.
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <span>Made with care for college students</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3.5">
              Platform Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-500 font-medium">
              <li>
                <Link to="/" className="hover:text-blue-600 transition">
                  Home Landing
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-blue-600 transition">
                  Explore Course Notes
                </Link>
              </li>
              <li>
                <Link to="/upload" className="hover:text-blue-600 transition">
                  Upload & Share Notes
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-600 transition">
                  Student Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-blue-600 transition">
                  Register Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture Responsibilities */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3.5">
              System Architecture
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-blue-600" />
                Python Flask Application Factory
              </li>
              <li className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                MySQL Relational Storage
              </li>
              <li className="flex items-center gap-2">
                <Cloud className="w-3.5 h-3.5 text-cyan-600" />
                Amazon S3 Private Bucket
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Argon2 & Session Role Authorization
              </li>
            </ul>
          </div>

          {/* Academic Integrity */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3.5">
              Academic Integrity
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              CloudNoteBridge encourages peer-to-peer knowledge collaboration. All uploaded materials are student-contributed for educational study and unit review.
            </p>
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500">
              © {new Date().getFullYear()} CloudNoteBridge. College Project Implementation.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
