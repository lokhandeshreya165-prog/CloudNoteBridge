import React from 'react';

export const NoteCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col justify-between bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs animate-pulse">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-24 bg-slate-200 rounded-md" />
          <div className="flex gap-2">
            <div className="h-5 w-16 bg-slate-100 rounded-md" />
            <div className="h-5 w-12 bg-slate-100 rounded-md" />
          </div>
        </div>

        {/* Title & Desc */}
        <div className="h-5 w-3/4 bg-slate-200 rounded-md mb-2" />
        <div className="h-4 w-1/2 bg-slate-100 rounded-md mb-4" />
        <div className="h-3 w-full bg-slate-100 rounded-md mb-1.5" />
        <div className="h-3 w-4/5 bg-slate-100 rounded-md mb-4" />

        {/* Meta */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="h-3 w-28 bg-slate-100 rounded-md" />
          <div className="h-3 w-16 bg-slate-100 rounded-md" />
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="h-7 w-16 bg-slate-100 rounded-lg" />
        <div className="h-7 w-24 bg-slate-200 rounded-lg" />
      </div>
    </div>
  );
};

export const GridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <NoteCardSkeleton key={i} />
      ))}
    </div>
  );
};
