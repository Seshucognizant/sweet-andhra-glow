import { useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
}

export const usePerformanceMonitor = () => {
  const reportMetrics = useCallback((metrics: PerformanceMetrics) => {
    // Report to analytics service (Google Analytics, etc.)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_timing', {
        name: 'load_time',
        value: Math.round(metrics.loadTime),
      });

      if (metrics.firstContentfulPaint) {
        window.gtag('event', 'page_timing', {
          name: 'first_contentful_paint',
          value: Math.round(metrics.firstContentfulPaint),
        });
      }

      if (metrics.largestContentfulPaint) {
        window.gtag('event', 'page_timing', {
          name: 'largest_contentful_paint',
          value: Math.round(metrics.largestContentfulPaint),
        });
      }
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('Performance Metrics');
      console.log('Load Time:', `${metrics.loadTime}ms`);
      console.log('DOM Content Loaded:', `${metrics.domContentLoaded}ms`);
      if (metrics.firstContentfulPaint) {
        console.log('First Contentful Paint:', `${metrics.firstContentfulPaint}ms`);
      }
      if (metrics.largestContentfulPaint) {
        console.log('Largest Contentful Paint:', `${metrics.largestContentfulPaint}ms`);
      }
      if (metrics.firstInputDelay) {
        console.log('First Input Delay:', `${metrics.firstInputDelay}ms`);
      }
      if (metrics.cumulativeLayoutShift) {
        console.log('Cumulative Layout Shift:', metrics.cumulativeLayoutShift);
      }
      console.groupEnd();
    }
  }, []);

  const measureWebVitals = useCallback(() => {
    if (typeof window === 'undefined' || !window.performance) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    const metrics: PerformanceMetrics = {
      loadTime: navigation.loadEventEnd - navigation.fetchStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
    };

    // Get Core Web Vitals using Performance Observer
    if ('PerformanceObserver' in window) {
      // First Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            metrics.firstContentfulPaint = entry.startTime;
          }
        });
      }).observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metrics.largestContentfulPaint = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          metrics.firstInputDelay = entry.processingStart - entry.startTime;
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            metrics.cumulativeLayoutShift = clsValue;
          }
        });
      }).observe({ entryTypes: ['layout-shift'] });
    }

    // Report metrics after a delay to allow all measurements to complete
    setTimeout(() => reportMetrics(metrics), 0);
  }, [reportMetrics]);

  useEffect(() => {
    if (document.readyState === 'complete') {
      measureWebVitals();
    } else {
      window.addEventListener('load', measureWebVitals);
      return () => window.removeEventListener('load', measureWebVitals);
    }
  }, [measureWebVitals]);

  return { measureWebVitals };
};

// Hook to measure component render times
export const useRenderTime = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
      }
    };
  });
};