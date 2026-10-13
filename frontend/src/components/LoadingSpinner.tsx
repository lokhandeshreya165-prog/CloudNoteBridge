import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...', className = 'py-12' }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      {message && <p className="mt-3 text-sm font-medium text-slate-500">{message}</p>}
    </div>
  );
};
