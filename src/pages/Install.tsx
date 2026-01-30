import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Check, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoLight from '@/assets/logo-light.png';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center gap-4">
        <Link to="/" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <img src={logoLight} alt="MasterChef World" className="h-8" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {isInstalled ? (
          <>
            <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-6">
              <Check className="w-10 h-10 text-accent-foreground" />
            </div>
            <h1 className="font-unbounded text-2xl font-bold mb-3">
              ¡App instalada!
            </h1>
            <p className="text-muted-foreground mb-8">
              Ya puedes abrir la app desde tu pantalla de inicio.
            </p>
            <Button asChild size="lg">
              <Link to="/app">Abrir la app</Link>
            </Button>
          </>
        ) : isIOS ? (
          <>
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Smartphone className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-unbounded text-2xl font-bold mb-3">
              Instala la app
            </h1>
            <p className="text-muted-foreground mb-8 max-w-sm">
              Para instalar en iPhone/iPad:
            </p>
            
            <div className="bg-card border border-border rounded-2xl p-6 text-left space-y-4 max-w-sm w-full mb-8">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">1</span>
                <p className="text-sm pt-1">Pulsa el botón <strong>Compartir</strong> en la barra del navegador</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">2</span>
                <p className="text-sm pt-1">Busca y pulsa <strong>"Añadir a pantalla de inicio"</strong></p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">3</span>
                <p className="text-sm pt-1">Confirma pulsando <strong>"Añadir"</strong></p>
              </div>
            </div>

            <Button asChild variant="outline" size="lg">
              <Link to="/app">Continuar en navegador</Link>
            </Button>
          </>
        ) : deferredPrompt ? (
          <>
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Download className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-unbounded text-2xl font-bold mb-3">
              Instala la app
            </h1>
            <p className="text-muted-foreground mb-8 max-w-sm">
              Añade MasterChef World App a tu pantalla de inicio para una mejor experiencia.
            </p>
            
            <div className="space-y-4 w-full max-w-xs">
              <Button onClick={handleInstall} size="lg" className="w-full gap-2">
                <Download className="w-5 h-5" />
                Instalar ahora
              </Button>
              <Button asChild variant="ghost" size="lg" className="w-full">
                <Link to="/app">Continuar en navegador</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Smartphone className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-unbounded text-2xl font-bold mb-3">
              Instala la app
            </h1>
            <p className="text-muted-foreground mb-8 max-w-sm">
              Para instalar en Android, abre el menú del navegador (⋮) y selecciona "Instalar app" o "Añadir a pantalla de inicio".
            </p>
            
            <Button asChild variant="outline" size="lg">
              <Link to="/app">Continuar en navegador</Link>
            </Button>
          </>
        )}
      </main>

      {/* Features */}
      {!isInstalled && (
        <div className="p-6 bg-card border-t border-border">
          <h2 className="font-unbounded text-sm font-bold mb-4 text-center">Ventajas de instalar</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl mb-1">⚡</div>
              <p className="text-xs text-muted-foreground">Acceso rápido</p>
            </div>
            <div>
              <div className="text-2xl mb-1">📱</div>
              <p className="text-xs text-muted-foreground">Como app nativa</p>
            </div>
            <div>
              <div className="text-2xl mb-1">🔔</div>
              <p className="text-xs text-muted-foreground">Notificaciones</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Install;
