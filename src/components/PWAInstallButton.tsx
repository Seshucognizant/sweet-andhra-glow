import React from 'react';
import { Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { useToast } from '@/hooks/use-toast';

interface PWAInstallButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'outline',
  size = 'default',
  className
}) => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const { toast } = useToast();

  const handleInstall = async () => {
    try {
      const installed = await installApp();
      if (installed) {
        toast({
          title: 'App Installed!',
          description: 'Andhra Sweets has been added to your home screen.',
        });
      } else {
        toast({
          title: 'Installation Cancelled',
          description: 'You can install the app later from your browser menu.',
        });
      }
    } catch (error) {
      toast({
        title: 'Installation Failed',
        description: 'There was an error installing the app. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Don't show button if already installed or not installable
  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <Button
      onClick={handleInstall}
      variant={variant}
      size={size}
      className={className}
    >
      <Download className="w-4 h-4 mr-2" />
      <span className="hidden sm:inline">Install App</span>
      <Smartphone className="w-4 h-4 sm:hidden" />
    </Button>
  );
};