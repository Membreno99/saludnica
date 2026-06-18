// Hook para gestionar el prompt de instalación PWA
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalada
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) { setIsInstalled(true); return; }

    // Verificar si el usuario ya descartó el banner
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed) { setIsDismissed(true); }

    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setPromptEvent(null);
  };

  const dismiss = () => {
    localStorage.setItem('pwa-banner-dismissed', '1');
    setIsDismissed(true);
  };

  const canInstall = !!promptEvent && !isInstalled && !isDismissed;
  return { canInstall, isInstalled, install, dismiss };
}
