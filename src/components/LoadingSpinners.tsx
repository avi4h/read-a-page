import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary', 
  text,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-brand-teal-500',
    secondary: 'text-slate-500 dark:text-slate-400',
    white: 'text-white'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}>
          <svg
            className="w-full h-full"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
      {text && (
        <p className={`mt-2 text-sm ${colorClasses[color]} animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
};

export const DotLoadingSpinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex space-x-1 justify-center items-center ${className}`}>
    <div className="w-2 h-2 bg-brand-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-brand-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-brand-teal-500 rounded-full animate-bounce"></div>
  </div>
);

export const PulseLoadingSpinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex justify-center items-center ${className}`}>
    <div className="w-8 h-8 bg-brand-teal-500 rounded-full animate-pulse"></div>
  </div>
);

export const PageLoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
    <div className="text-center p-8">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  </div>
);

export const ButtonLoadingSpinner: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'sm' }) => (
  <LoadingSpinner size={size} color="white" className="inline-flex" />
);

export const ContentLoadingSpinner: React.FC = () => (
  <div className="w-full max-w-2xl mx-auto space-y-4 animate-pulse">
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
  </div>
);
