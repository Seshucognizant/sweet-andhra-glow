import React from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useImageLoader } from '@/hooks/useImageLoader';
import { useImageRetry } from '@/hooks/useImageRetry';
import { useImageOptimization } from '@/hooks/useImageOptimization';
import { cn } from '@/lib/utils';
import { Loader2, ImageOff, RotateCcw } from 'lucide-react';

interface LazyImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError' | 'onLoad'> {
  src: string;
  fallbackSrc?: string;
  placeholder?: string;
  threshold?: number;
  rootMargin?: string;
  showRetry?: boolean;
  onImageError?: (error: Error) => void;
  onImageLoad?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  fallbackSrc = '/images/placeholder.jpg',
  placeholder,
  threshold = 0.1,
  rootMargin = '50px',
  showRetry = true,
  onImageError,
  onImageLoad,
  className,
  alt = '',
  ...props
}) => {
  const { optimizeImageUrl, generateSrcSet } = useImageOptimization();
  const { isVisible, elementRef } = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  // Optimize the image URL when visible
  const optimizedSrc = isVisible ? optimizeImageUrl(src, { 
    quality: 85,
    width: props.width ? Number(props.width) : undefined,
    height: props.height ? Number(props.height) : undefined
  }) : '';

  const { loading, error, imageSrc } = useImageLoader({
    src: optimizedSrc,
    fallbackSrc,
  });

  const { retry, retryCount, isRetrying, canRetry } = useImageRetry({
    maxRetries: 3,
    retryDelay: 1000,
  });

  React.useEffect(() => {
    if (error && onImageError) {
      onImageError(new Error('Failed to load image'));
    }
  }, [error, onImageError]);

  React.useEffect(() => {
    if (imageSrc && onImageLoad) {
      onImageLoad();
    }
  }, [imageSrc, onImageLoad]);

  const handleRetry = () => {
    retry(() => {
      // Force re-render by updating the image src
      const img = new Image();
      img.src = src;
    });
  };

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={cn(
        'relative overflow-hidden bg-muted',
        className
      )}
      {...props}
    >
      {!isVisible ? (
        // Placeholder before intersection
        <div className="flex items-center justify-center w-full h-full bg-muted">
          <div className="w-8 h-8 bg-muted-foreground/20 rounded animate-pulse" />
        </div>
      ) : loading || isRetrying ? (
        // Loading state
        <div className="flex items-center justify-center w-full h-full bg-muted animate-pulse">
          <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
        </div>
      ) : error ? (
        // Error state
        <div className="flex flex-col items-center justify-center w-full h-full bg-muted text-muted-foreground">
          <ImageOff className="w-8 h-8 mb-2" />
          <span className="text-xs text-center px-2">Failed to load image</span>
          {showRetry && canRetry && (
            <button
              onClick={handleRetry}
              className="mt-2 flex items-center gap-1 text-xs hover:text-foreground transition-colors"
              disabled={isRetrying}
            >
              <RotateCcw className="w-3 h-3" />
              Retry ({retryCount}/{3})
            </button>
          )}
        </div>
      ) : (
        // Loaded image
        <img
          src={imageSrc || fallbackSrc}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            imageSrc ? 'opacity-100' : 'opacity-0'
          )}
          srcSet={imageSrc ? generateSrcSet(src) : undefined}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
        />
      )}
    </div>
  );
};