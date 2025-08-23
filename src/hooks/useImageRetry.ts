import { useState, useCallback } from 'react';

interface UseImageRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
}

export const useImageRetry = (options: UseImageRetryOptions = {}) => {
  const { maxRetries = 3, retryDelay = 1000 } = options;
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback((callback: () => void) => {
    if (retryCount >= maxRetries) {
      console.warn(`Max retries (${maxRetries}) reached for image loading`);
      return;
    }

    setIsRetrying(true);
    const delay = retryDelay * Math.pow(2, retryCount); // Exponential backoff

    setTimeout(() => {
      setRetryCount(prev => prev + 1);
      setIsRetrying(false);
      callback();
    }, delay);
  }, [retryCount, maxRetries, retryDelay]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    retry,
    reset,
    retryCount,
    isRetrying,
    canRetry: retryCount < maxRetries,
  };
};