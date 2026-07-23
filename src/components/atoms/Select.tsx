import React from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  options?: SelectOption[];
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
}

export const Select = ({ 
  label, 
  error, 
  leftIcon, 
  options, 
  placeholder, 
  className = '', 
  children, 
  ...props 
}: SelectProps) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 flex items-center pointer-events-none z-10">
            {leftIcon}
          </div>
        )}
        <select
          className={`w-full px-4 py-2.5 ${leftIcon ? 'pl-10' : ''} border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition bg-white ${error ? 'border-red-400' : 'border-gray-200'} ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options ? (
            options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          ) : (
            children
          )}
        </select>
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};
