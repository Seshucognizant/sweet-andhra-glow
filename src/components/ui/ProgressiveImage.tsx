import React, { useState } from 'react';
import { useImageLoader } from '@/hooks/useImageLoader';
import { cn } from '@/lib/utils';
import { Loader2, ImageOff } from 'lucide-react';

interface ProgressiveImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError' | 'onLoad'> {
  src: string;
  fallbackSrc?: string;
  placeholderSrc?: string;
  blurDataURL?: string;
  showLoader?: boolean;
  onImageError?: (error: Error) => void;
  onImageLoad?: () => void;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  fallbackSrc = '/images/placeholder.jpg',
  placeholderSrc,
  blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==',
  showLoader = true,
  onImageError,
  onImageLoad,
  className,
  alt = '',
  ...props
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { loading, error, imageSrc } = useImageLoader({
    src,
    fallbackSrc,
  });

  React.useEffect(() => {
    if (error && onImageError) {
      onImageError(new Error('Failed to load image'));
    }
  }, [error, onImageError]);

  React.useEffect(() => {
    if (imageSrc && !loading && onImageLoad) {
      setImageLoaded(true);
      onImageLoad();
    }
  }, [imageSrc, loading, onImageLoad]);

  return (
    <div className={cn('relative overflow-hidden', className)} {...props}>
      {/* Blur placeholder */}
      {(placeholderSrc || blurDataURL) && !imageLoaded && (
        <img
          src={placeholderSrc || blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110 transition-opacity duration-500"
          style={{ filter: 'blur(20px)' }}
        />
      )}

      {/* Loading overlay */}
      {loading && showLoader && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground">
          <ImageOff className="w-12 h-12 mb-2" />
          <span className="text-sm">Failed to load image</span>
        </div>
      )}

      {/* Main image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-all duration-700 ease-out',
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          )}
          onLoad={() => setImageLoaded(true)}
        />
      )}
    </div>
  );
};