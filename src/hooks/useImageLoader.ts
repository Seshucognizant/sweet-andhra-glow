import { useState, useEffect } from 'react';

interface UseImageLoaderOptions {
  src: string;
  fallbackSrc?: string;
}

export const useImageLoader = ({ src, fallbackSrc }: UseImageLoaderOptions) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;

    setLoading(true);
    setError(false);
    setImageSrc(null);

    const img = new Image();
    
    const handleLoad = () => {
      setImageSrc(src);
      setLoading(false);
      setError(false);
    };

    const handleError = () => {
      if (fallbackSrc && fallbackSrc !== src) {
        setImageSrc(fallbackSrc);
        setLoading(false);
        setError(false);
      } else {
        setLoading(false);
        setError(true);
      }
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallbackSrc]);

  return { loading, error, imageSrc };
};