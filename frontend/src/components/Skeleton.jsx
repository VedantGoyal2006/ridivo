import React from 'react';

/**
 * Reusable loading state Skeleton placeholder
 */
export const Skeleton = ({ className = '', variant = 'text', ...props }) => {
  const baseClass = 'bg-slate-200 animate-pulse rounded';
  
  let variantClass = '';
  switch (variant) {
    case 'circle':
      variantClass = 'rounded-full';
      break;
    case 'rect':
      variantClass = 'rounded-lg';
      break;
    case 'text':
    default:
      variantClass = 'h-4 w-full';
      break;
  }

  return (
    <div 
      className={`${baseClass} ${variantClass} ${className}`} 
      {...props}
    />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="border border-slate-100 bg-white rounded-2xl p-6 shadow-sm flex flex-col space-y-4">
      <div className="flex items-center space-x-3">
        <Skeleton variant="circle" className="h-12 w-12" />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" className="w-1/3 h-5" />
          <Skeleton variant="text" className="w-1/4 h-3" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton variant="text" className="w-5/6 h-4" />
        <Skeleton variant="text" className="w-4/5 h-4" />
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-slate-50">
        <Skeleton variant="text" className="w-1/4 h-4" />
        <Skeleton variant="rect" className="w-20 h-8" />
      </div>
    </div>
  );
};
