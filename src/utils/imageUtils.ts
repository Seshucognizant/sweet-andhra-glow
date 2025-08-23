// Image loading utilities and constants
export const DEFAULT_PLACEHOLDER = '/images/placeholder.jpg';
export const LOADING_BLUR_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

export interface ImageLoadOptions {
  src: string;
  fallbackSrc?: string;
  placeholder?: string;
  retryAttempts?: number;
  retryDelay?: number;
}

export const createImageLoader = (options: ImageLoadOptions) => {
  const {
    src,
    fallbackSrc = DEFAULT_PLACEHOLDER,
    retryAttempts = 3,
    retryDelay = 1000,
  } = options;

  return new Promise<string>((resolve, reject) => {
    let attempts = 0;

    const attemptLoad = () => {
      const img = new Image();
      
      img.onload = () => {
        resolve(src);
      };

      img.onerror = () => {
        attempts++;
        
        if (attempts < retryAttempts) {
          const delay = retryDelay * Math.pow(2, attempts - 1);
          setTimeout(attemptLoad, delay);
        } else if (fallbackSrc && fallbackSrc !== src) {
          // Try fallback image
          const fallbackImg = new Image();
          fallbackImg.onload = () => resolve(fallbackSrc);
          fallbackImg.onerror = () => reject(new Error('Failed to load image and fallback'));
          fallbackImg.src = fallbackSrc;
        } else {
          reject(new Error('Failed to load image after retries'));
        }
      };

      img.src = src;
    };

    attemptLoad();
  });
};

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

export const getOptimizedImageUrl = (
  src: string,
  width?: number,
  quality: number = 85
): string => {
  // For now, return the original src
  // In a real implementation, this would integrate with image optimization services
  return src;
};