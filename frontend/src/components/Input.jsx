import React, { forwardRef } from 'react';

/**
 * Reusable premium Input component with support for labels, error state, and icon prefixes
 */
export const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  type = 'text',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`w-full flex flex-col space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-slate-700 tracking-wide"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-5 h-5 flex-shrink-0" />
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          type={type}
          className={`
            block w-full rounded-xl transition-all duration-200 text-sm py-3
            ${Icon ? 'pl-11' : 'pl-4'} pr-4
            bg-white border text-slate-900 placeholder:text-slate-400
            focus:ring-2 focus:ring-offset-0 focus:outline-none
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'
            }
            disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs font-medium text-red-600 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
