import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary' | 'neutral' | 'secondary';
  rounded?: boolean;
  className?: string;
}

export const Badge = ({ 
  children, 
  variant = 'default', 
  rounded = false, 
  className = '' 
}: BadgeProps) => {
  // Map 'neutral' and 'secondary' to 'default'
  const normalizedVariant = variant === 'neutral' || variant === 'secondary' ? 'default' : variant;

  const variants: Record<string, string> = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger:  'bg-red-100 text-red-700',
    info:    'bg-blue-100 text-blue-700',
    primary: 'bg-primary-100 text-primary-700',
    default: 'bg-gray-100 text-gray-600',
  };

  const roundedClass = rounded ? 'rounded-full' : 'rounded-full';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 ${roundedClass} text-xs font-bold ${variants[normalizedVariant]} ${className}`}>
      {children}
    </span>
  );
};
