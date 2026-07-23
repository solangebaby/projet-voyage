import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed';

  const variants: Record<string, string> = {
    primary:   'bg-primary-500 hover:bg-primary-600 text-white shadow-sm',
    secondary: 'bg-color3 hover:bg-color4 text-white',
    neutral:   'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger:    'bg-red-500 hover:bg-red-600 text-white',
    outline:   'border-2 border-primary-500 text-primary-500 hover:bg-primary-50',
    ghost:     'text-gray-600 hover:bg-gray-100',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
    </button>
  );
};
