// Banner de instalación PWA — SaludGO
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone } from 'lucide-react';

export default function PWAInstallBanner() {
  const { canInstall, install, dismiss } = usePWAInstall();
  const navigate = useNavigate();
  const [installing, setInstalling] = useState(false);

  // Siempre mostrar el banner salvo que el usuario lo cierre
  // (canInstall = Android/Chrome con prompt; sin prompt → mostramos guía manual)
  const [closed, setClosed] = useState(() =>
    localStorage.getItem('pwa-banner-dismissed') === '1'
  );

  if (closed) return null;

  const handleInstall = async () => {
    if (canInstall) {
      setInstalling(true);
      await install();
      setInstalling(false);
    } else {
      navigate('/instalar');
    }
  };

  const handleDismiss = () => {
    dismiss();
    setClosed(true);
  };

  return (
    <div className="fixed bottom-16 left-3 right-3 z-50 md:bottom-6 md:left-auto md:right-6 md:max-w-sm">
      <div className="bg-primary text-primary-foreground rounded-2xl shadow-xl p-4 flex items-start gap-3">
        {/* Ícono */}
        <div className="w-11 h-11 rounded-xl bg-primary-foreground/15 flex items-center justify-center shrink-0">
          <Smartphone className="w-6 h-6 text-primary-foreground" />
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-primary-foreground">
            📲 Instala SaludGO en tu celular
          </p>
          <p className="text-xs text-primary-foreground/80 mt-0.5 text-pretty">
            Sin Play Store ni App Store. Gratis y en segundos.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              onClick={handleInstall}
              disabled={installing}
              variant="secondary"
              className="h-8 text-xs font-semibold gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              {installing ? 'Instalando…' : canInstall ? 'Instalar app' : 'Cómo instalar'}
            </Button>
            <button
              onClick={handleDismiss}
              className="text-xs text-primary-foreground/70 hover:text-primary-foreground"
            >
              Ahora no
            </button>
          </div>
        </div>

        {/* Cerrar */}
        <button
          onClick={handleDismiss}
          className="shrink-0 text-primary-foreground/60 hover:text-primary-foreground"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
