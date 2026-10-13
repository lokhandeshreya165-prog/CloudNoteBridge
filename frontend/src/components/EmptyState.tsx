import React from 'react';
import { LucideIcon, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = BookOpen,
  title,
  description,
  actionText,
  actionLink,
  onAction,
  onActionClick,
}) => {
  const handleAction = onAction || onActionClick;

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center bg-white border border-slate-200/80 rounded-3xl shadow-xs">
      <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-3xl bg-blue-50 text-blue-600 shadow-2xs">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
      <p className="max-w-md mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">{description}</p>
      {actionText && (actionLink || handleAction) && (
        <div className="mt-6">
          {actionLink ? (
            <Link
              to={actionLink}
              className="inline-flex items-center px-5 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-700 transition transform hover:-translate-y-0.5"
            >
              {actionText}
            </Link>
          ) : (
            <button
              onClick={handleAction}
              className="inline-flex items-center px-5 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-700 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
