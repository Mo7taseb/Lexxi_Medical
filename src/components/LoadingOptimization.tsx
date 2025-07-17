'use client';

import React from 'react';

// Pre-load critical icons to reduce loading time
const CriticalIcons = () => {
  return (
    <div className="hidden">
      {/* Pre-render critical icons */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
};

// Optimized loading skeleton
export const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded-lg mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  </div>
);

// Fast loading spinner
export const FastLoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-6 h-6 bg-blue-600 rounded-full animate-pulse"></div>
      </div>
    </div>
    <span className="mr-4 text-gray-600 font-medium">جاري التحميل...</span>
  </div>
);

// Progressive loading component
export const ProgressiveLoader = ({ progress = 0 }: { progress?: number }) => (
  <div className="flex flex-col items-center justify-center p-8">
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">تحميل التطبيق</span>
        <span className="text-sm font-medium text-blue-600">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
    <p className="text-gray-500 text-sm mt-4">يتم تحضير الواجهة...</p>
  </div>
);

export default CriticalIcons;
