import React from 'react';

interface ImageProps {
  image: string;
  alt: string;
  className?: string;
  as?: 'img' | 'a';
  href?: string;
}

export const Image = ({ image, alt, className = '', as: Tag = 'img', href }: ImageProps) => {
  if (Tag === 'a') {
    return (
      <a href={href || '/'}>
        <img src={image} alt={alt} className={className} />
      </a>
    );
  }
  return <img src={image} alt={alt} className={className} />;
};
