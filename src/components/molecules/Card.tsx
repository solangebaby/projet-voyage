import { Image } from '../atoms/Image';

interface CardProps {
  cardClass?: string;
  imageWrapperClass?: string;
  imageSrc?: string;
  imageAlt?: string;
  cover?: string;
  textWrapperClass?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export const Card: React.FC<CardProps> = ({
  cardClass,
  imageWrapperClass,
  imageSrc,
  imageAlt,
  cover,
  textWrapperClass,
  children,
  ...props
}) => {
  return (
    <div className={cardClass} {...props}>
      {imageSrc && (
        <div className={imageWrapperClass}>
          <Image 
            image={imageSrc} 
            alt={imageAlt || 'Card image'} 
            className={cover}
          />
        </div>
      )}
      {textWrapperClass && children ? (
        <div className={textWrapperClass}>
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
};
