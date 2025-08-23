import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone) {
        setIsInstalled(true);
      }
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  }, [deferredPrompt]);

  const shareContent = useCallback(async (data: ShareData) => {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
    
    // Fallback: copy to clipboard
    if (data.url && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(data.url);
        return true;
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
    
    return false;
  }, []);

  return {
    isInstallable,
    isInstalled,
    isOnline,
    installApp,
    shareContent,
  };
};

// Hook for service worker management
export const useServiceWorker = () => {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          setRegistration(reg);
          
          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          setUpdateAvailable(true);
        }
      });
    }
  }, []);

  const updateApp = useCallback(async () => {
    if (!registration) return false;

    setIsLoading(true);
    
    try {
      if (registration.waiting) {
        // Tell the waiting service worker to skip waiting and become active
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Reload the page to use the new service worker
        window.location.reload();
        return true;
      }
      
      // Try to update
      await registration.update();
      return true;
    } catch (error) {
      console.error('Error updating app:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [registration]);

  const unregisterSW = useCallback(async () => {
    if (registration) {
      const result = await registration.unregister();
      if (result) {
        setRegistration(null);
        setUpdateAvailable(false);
      }
      return result;
    }
    return false;
  }, [registration]);

  return {
    registration,
    updateAvailable,
    isLoading,
    updateApp,
    unregisterSW,
  };
};