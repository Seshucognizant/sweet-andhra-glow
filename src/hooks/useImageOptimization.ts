import { useState, useCallback, useEffect } from 'react';

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  lazy?: boolean;
}

export const useImageOptimization = () => {
  const [supportsWebP, setSupportsWebP] = useState<boolean | null>(null);
  const [supportsAvif, setSupportsAvif] = useState<boolean | null>(null);

  // Check browser support for modern image formats
  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    };

    const checkAvifSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      try {
        return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
      } catch {
        return false;
      }
    };

    setSupportsWebP(checkWebPSupport());
    setSupportsAvif(checkAvifSupport());
  }, []);

  const optimizeImageUrl = useCallback((
    src: string,
    options: ImageOptimizationOptions = {}
  ): string => {
    const {
      quality = 80,
      format,
      width,
      height
    } = options;

    // If it's already an external URL or data URL, return as-is
    if (src.startsWith('http') || src.startsWith('data:')) {
      return src;
    }

    // For local images, we can add query parameters for optimization services
    // This would work with services like Cloudinary, ImageKit, etc.
    const params = new URLSearchParams();
    
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('q', quality.toString());
    
    // Use modern formats if supported
    if (format) {
      params.append('f', format);
    } else if (supportsAvif) {
      params.append('f', 'avif');
    } else if (supportsWebP) {
      params.append('f', 'webp');
    }

    const queryString = params.toString();
    return queryString ? `${src}?${queryString}` : src;
  }, [supportsWebP, supportsAvif]);

  const generateSrcSet = useCallback((
    src: string,
    sizes: number[] = [480, 768, 1024, 1200, 1920]
  ): string => {
    return sizes
      .map(size => `${optimizeImageUrl(src, { width: size })} ${size}w`)
      .join(', ');
  }, [optimizeImageUrl]);

  const preloadImage = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const preloadImages = useCallback(async (urls: string[]): Promise<HTMLImageElement[]> => {
    try {
      return await Promise.all(urls.map(preloadImage));
    } catch (error) {
      console.error('Error preloading images:', error);
      return [];
    }
  }, [preloadImage]);

  return {
    supportsWebP,
    supportsAvif,
    optimizeImageUrl,
    generateSrcSet,
    preloadImage,
    preloadImages,
  };
};