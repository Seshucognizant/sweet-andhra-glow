import { useState, useEffect, useCallback } from 'react';

interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class Cache<T = any> {
  private cache = new Map<string, CacheItem<T>>();
  private config: Required<CacheConfig>;

  constructor(config: CacheConfig = {}) {
    this.config = {
      ttl: config.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: config.maxSize || 100,
      storage: config.storage || 'memory',
    };

    // Load from persistent storage if configured
    if (this.config.storage !== 'memory') {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    try {
      const storage = this.config.storage === 'localStorage' ? localStorage : sessionStorage;
      const cached = storage.getItem('app-cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        this.cache = new Map(parsed);
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  private saveToStorage() {
    if (this.config.storage === 'memory') return;

    try {
      const storage = this.config.storage === 'localStorage' ? localStorage : sessionStorage;
      const serialized = JSON.stringify(Array.from(this.cache.entries()));
      storage.setItem('app-cache', serialized);
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  private cleanup() {
    const now = Date.now();
    const expired: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        expired.push(key);
      }
    }

    expired.forEach(key => this.cache.delete(key));

    // Enforce max size
    if (this.cache.size > this.config.maxSize) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = sortedEntries.slice(0, this.cache.size - this.config.maxSize);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  set(key: string, data: T, customTtl?: number): void {
    this.cleanup();
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: customTtl || this.config.ttl,
    });

    this.saveToStorage();
  }

  get(key: string): T | null {
    this.cleanup();
    
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.saveToStorage();
  }

  clear(): void {
    this.cache.clear();
    this.saveToStorage();
  }

  keys(): string[] {
    this.cleanup();
    return Array.from(this.cache.keys());
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }
}

// Global cache instances
const memoryCache = new Cache({ storage: 'memory' });
const persistentCache = new Cache({ storage: 'localStorage', ttl: 24 * 60 * 60 * 1000 }); // 24 hours
const sessionCache = new Cache({ storage: 'sessionStorage' });

export const useCaching = (namespace: string = 'default') => {
  const createKey = useCallback((key: string) => `${namespace}:${key}`, [namespace]);

  const setCache = useCallback((key: string, data: any, options?: { ttl?: number; persistent?: boolean; session?: boolean }) => {
    const fullKey = createKey(key);
    
    if (options?.persistent) {
      persistentCache.set(fullKey, data, options.ttl);
    } else if (options?.session) {
      sessionCache.set(fullKey, data, options.ttl);
    } else {
      memoryCache.set(fullKey, data, options?.ttl);
    }
  }, [createKey]);

  const getCache = useCallback((key: string, options?: { persistent?: boolean; session?: boolean }) => {
    const fullKey = createKey(key);
    
    if (options?.persistent) {
      return persistentCache.get(fullKey);
    } else if (options?.session) {
      return sessionCache.get(fullKey);
    } else {
      return memoryCache.get(fullKey);
    }
  }, [createKey]);

  const hasCache = useCallback((key: string, options?: { persistent?: boolean; session?: boolean }) => {
    const fullKey = createKey(key);
    
    if (options?.persistent) {
      return persistentCache.has(fullKey);
    } else if (options?.session) {
      return sessionCache.has(fullKey);
    } else {
      return memoryCache.has(fullKey);
    }
  }, [createKey]);

  const deleteCache = useCallback((key: string, options?: { persistent?: boolean; session?: boolean; all?: boolean }) => {
    const fullKey = createKey(key);
    
    if (options?.all) {
      memoryCache.delete(fullKey);
      persistentCache.delete(fullKey);
      sessionCache.delete(fullKey);
    } else if (options?.persistent) {
      persistentCache.delete(fullKey);
    } else if (options?.session) {
      sessionCache.delete(fullKey);
    } else {
      memoryCache.delete(fullKey);
    }
  }, [createKey]);

  const clearCache = useCallback((options?: { persistent?: boolean; session?: boolean; all?: boolean }) => {
    if (options?.all) {
      memoryCache.clear();
      persistentCache.clear();
      sessionCache.clear();
    } else if (options?.persistent) {
      persistentCache.clear();
    } else if (options?.session) {
      sessionCache.clear();
    } else {
      memoryCache.clear();
    }
  }, []);

  return {
    setCache,
    getCache,
    hasCache,
    deleteCache,
    clearCache,
  };
};

// Hook for caching API responses with React Query integration
export const useCachedQuery = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: {
    staleTime?: number;
    cacheTime?: number;
    persistent?: boolean;
  }
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { getCache, setCache } = useCaching('query');

  const cacheKey = queryKey.join(':');

  useEffect(() => {
    const cachedData = getCache(cacheKey, { persistent: options?.persistent });
    
    if (cachedData) {
      setData(cachedData);
      return;
    }

    setIsLoading(true);
    setError(null);

    queryFn()
      .then((result) => {
        setData(result);
        setCache(cacheKey, result, {
          ttl: options?.cacheTime,
          persistent: options?.persistent,
        });
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [cacheKey, queryFn, getCache, setCache, options?.cacheTime, options?.persistent]);

  return { data, isLoading, error };
};