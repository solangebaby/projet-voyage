import React from 'react';

type TextTag = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div' | 'small' | 'q' | 'blockquote' | 'label';

interface TextProps {
  children: React.ReactNode;
  className?: string;
  as?: TextTag;
  [key: string]: any;
}

export const Text = ({ children, className = '', as: Tag = 'p', ...rest }: TextProps) => {
  return <Tag className={className} {...rest}>{children}</Tag>;
};
