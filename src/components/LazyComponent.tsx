import React, { Suspense, lazy, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from './ErrorBoundary';

interface LazyComponentProps {
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

// Generic lazy component wrapper with error boundary and loading state
export const createLazyComponent = <P extends Record<string, any>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFn);

  return (props: P & LazyComponentProps) => {
    const { fallback: customFallback, errorFallback, ...componentProps } = props;
    
    const defaultFallback = (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );

    return (
      <ErrorBoundary fallback={errorFallback}>
        <Suspense fallback={customFallback || fallback || defaultFallback}>
          <LazyComponent {...(componentProps as any)} />
        </Suspense>
      </ErrorBoundary>
    );
  };
};

// Prebuilt lazy components for common use cases
export const LazyProductDetail = createLazyComponent(
  () => import('@/components/ProductDetail').then(mod => ({ default: mod.default })),
  <div className="glass rounded-lg p-6 animate-pulse">
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="flex space-x-2">
          <Skeleton className="w-16 h-16 rounded" />
          <Skeleton className="w-16 h-16 rounded" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  </div>
);

export const LazyAdvancedSearchModal = createLazyComponent(
  () => import('@/components/AdvancedSearchModal').then(mod => ({ default: mod.AdvancedSearchModal })),
  <Skeleton className="h-96 w-full rounded-lg" />
);

export const LazyRecommendedProducts = createLazyComponent(
  () => import('@/components/RecommendedProducts').then(mod => ({ default: mod.RecommendedProducts })),
  <div className="space-y-6">
    <Skeleton className="h-8 w-48" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  </div>
);

export const LazyRecentlyViewed = createLazyComponent(
  () => import('@/components/RecentlyViewed').then(mod => ({ default: mod.RecentlyViewed })),
  <div className="space-y-6">
    <Skeleton className="h-8 w-48" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  </div>
);