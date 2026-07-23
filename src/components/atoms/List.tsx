import React from 'react';

interface ListProps {
  children: React.ReactNode;
  className?: string;
}

export const List = ({ children, className = '' }: ListProps) => {
  return <li className={className}>{children}</li>;
};
