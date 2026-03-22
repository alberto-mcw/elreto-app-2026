import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Loader2, Clock, ChevronRight } from 'lucide-react';
import { usePresentationVideo } from '@/hooks/usePresentationVideo';
import { useToast } from '@/hooks/use-toast';
import { MobileAppLayout } from '@/components/app/MobileAppLayout';
import concentricSvg from '@/assets/concentric-circles.svg';
import logoVertical from '@/assets/logo-elreto-vertical.svg';

const AppOnboarding = () => {
  const navigate = useNavigate();
  const { video, loading, uploadVideo } = usePresentationVideo();
  const [uploading, setUploading] = useState(false);
  const [bgOpacity, setBgOpacity] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const onScroll = () =>
      setBgOpacity(Math.max(0, 1 - window.scrollY / 260));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-redirect if approved
  useEffect(() => {
    if (!loading && video?.status === 'approved') {
      navigate('/app', { replace: true });
    }
  }, [video, loading, navigate]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      toast({ title: 'Archivo demasiado grande', description: 'Máximo 100MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    const { error } = await uploadVideo(file);
    setUploading(false);

    if (error) {
      toast({ title: 'Error al subir el vídeo', variant: 'destructive' });
    } else {
      sessionStorage.setItem('onboarding_seen', '1');
      toast({ title: '🎬 ¡Vídeo enviado!', description: 'Un admin lo revisará pronto' });
    }
  };

  const isPending = video?.status === 'pending';

  if (loading) return null;

  return (
    <MobileAppLayout>
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Concentric circles — fixed, fade on scroll */}
      <img
        src={concentricSvg}
        aria-hidden
        className="pointer-events-none fixed left-1/2 -translate-x-1/2 w-[200vw] max-w-[900px]"
        style={{
          opacity: bgOpacity,
          top: 'calc(-10% - 20px)',
          transition: 'opacity 80ms linear',
          zIndex: 0,
        }}
      />

      <div className="relative z-10 flex flex-col app-typography">
        {/* Safe area top */}
        <div style={{ height: 'var(--sat)' }} />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="fixed left-4 w-9 h-9 rounded-[12px] bg-white flex items-center justify-center z-50 active:scale-95 transition-transform"
          style={{ top: 'calc(16px + var(--sat))' }}
        >
          <ArrowLeft className="w-5 h-5 text-black" strokeWidth={2} />
        </button>

        {/* Content */}
        <div className="flex-1 px-5 pb-12 pt-8">
          <div className="flex flex-col items-center mb-8">
            <img
              src={logoVertical}
              alt="El Reto - MasterChef World App"
              className="h-[12.964rem] w-auto object-contain mb-3"
            />
            <h1 className="app-title text-center">
              {isPending ? 'Vídeo en revisión' : 'Preséntate al mundo'}
            </h1>
            <p className="app-body-sm text-center mt-1 max-w-xs">
              {isPending
                ? 'Tu vídeo de presentación está siendo revisado por el equipo.'
                : 'Graba un vídeo contándonos quién eres y tu conexión con la cocina. Es tu carta de presentación para El Reto.'}
            </p>
          </div>

          {isPending ? (
            /* Pending state */
            <div className="space-y-4">
              <div className="border border-white/10 rounded-2xl p-5 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-yellow-500/15 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
                <p className="text-sm font-semibold text-white">En revisión</p>
                <p className="text-xs text-white/50">
                  El equipo revisará tu vídeo en las próximas horas. Te avisaremos cuando esté aprobado.
                </p>
              </div>

              <button
                onClick={() => { sessionStorage.setItem('onboarding_seen', '1'); navigate('/app', { replace: true }); }}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Continuar a la app
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* No video / rejected state */
            <div className="space-y-4">
              <div className="bg-gradient-primary rounded-[2rem] p-5 text-primary-foreground">
                <p className="text-sm font-bold mb-1">🎬 Casting App — Fase 0</p>
                <p className="text-xs opacity-80 mb-4">
                  Cuéntanos quién eres y tu conexión con la cocina y MasterChef. Solo puedes subirlo una vez. Gana +100 puntos al ser aprobado.
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 bg-white text-black rounded-xl py-2.5 text-sm font-semibold active:scale-[0.98] transition-transform disabled:opacity-60"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {uploading ? 'Subiendo...' : 'Subir vídeo de presentación'}
                </button>
              </div>

              <button
                onClick={() => { sessionStorage.setItem('onboarding_seen', '1'); navigate('/app', { replace: true }); }}
                className="w-full text-sm text-white/40 py-2 hover:text-white/60 transition-colors"
              >
                Saltar por ahora
              </button>

            </div>
          )}
        </div>
      </div>
    </div>
    </MobileAppLayout>
  );
};

export default AppOnboarding;
