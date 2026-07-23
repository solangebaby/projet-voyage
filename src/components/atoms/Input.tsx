import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  helperText?: string;
  className?: string;
}

export const Input = ({ 
  label, 
  error, 
  leftIcon, 
  helperText, 
  className = '', 
  ...props 
}: InputProps) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          className={`w-full px-4 py-2.5 ${leftIcon ? 'pl-10' : ''} border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition ${error ? 'border-red-400' : 'border-gray-200'} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      {helperText && !error && <p className="text-gray-500 text-xs">{helperText}</p>}
    </div>
  );
};
