import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, Check, Clock, ChevronRight, ArrowLeft, AlertTriangle, Lightbulb, Trophy } from 'lucide-react';

const AppChefLive = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [event, setEvent] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [participation, setParticipation] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepTimers, setStepTimers] = useState<Record<number, number>>({});
  const [globalTimer, setGlobalTimer] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [tipsDialogOpen, setTipsDialogOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const globalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (id && user) loadData();
    return () => {
      if (globalTimerRef.current) clearInterval(globalTimerRef.current);
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, [id, user]);

  useEffect(() => {
    if (event) {
      globalTimerRef.current = setInterval(() => setGlobalTimer(prev => prev + 1), 1000);
    }
  }, [event]);

  useEffect(() => {
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    stepTimerRef.current = setInterval(() => {
      setStepTimers(prev => ({ ...prev, [currentStepIndex]: (prev[currentStepIndex] || 0) + 1 }));
    }, 1000);
    return () => { if (stepTimerRef.current) clearInterval(stepTimerRef.current); };
  }, [currentStepIndex]);

  const loadData = async () => {
    const [{ data: ev }, { data: st }, { data: part }] = await Promise.all([
      supabase.from('chef_events').select('*').eq('id', id!).single(),
      supabase.from('chef_event_steps').select('*').eq('event_id', id!).order('step_number'),
      supabase.from('chef_event_participants').select('*').eq('event_id', id!).eq('user_id', user!.id).maybeSingle(),
    ]);
    setEvent(ev);
    setSteps(st || []);
    setParticipation(part);
    if (part) {
      const { data: subs } = await supabase.from('chef_step_submissions').select('*').eq('participant_id', part.id);
      setSubmissions(subs || []);
      setCurrentStepIndex(Math.min(part.current_step || 0, (st || []).length - 1));
    }
    setLoading(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!ALLOWED.includes(file.type)) {
      toast({ title: 'Formato no permitido', description: 'Solo JPEG, PNG o WebP', variant: 'destructive' });
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast({ title: 'Imagen demasiado grande', description: 'Máximo 15MB', variant: 'destructive' });
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => { setPhotoPreview(ev.target?.result as string); setPhotoDialogOpen(true); };
    reader.readAsDataURL(file);
  }, [toast]);

  const handleUploadPhoto = async () => {
    if (!photoFile || !participation || !steps[currentStepIndex]) return;
    setUploading(true);
    const ext = photoFile.type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
    const path = `${event.id}/${user!.id}/${steps[currentStepIndex].id}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('chef-events').upload(path, photoFile, { upsert: true });
    if (uploadError) { toast({ title: 'Error al subir la foto', variant: 'destructive' }); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('chef-events').getPublicUrl(path);
    await supabase.from('chef_step_submissions').insert({
      participant_id: participation.id,
      step_id: steps[currentStepIndex].id,
      photo_url: urlData.publicUrl,
      time_taken_seconds: stepTimers[currentStepIndex] || 0,
    });
    setSubmissions(prev => [...prev, { step_id: steps[currentStepIndex].id, photo_url: urlData.publicUrl }]);
    toast({ title: '📸 ¡Foto subida!', description: 'Buen trabajo, sigue así' });
    setPhotoDialogOpen(false);
    setPhotoPreview(null);
    setPhotoFile(null);
    setUploading(false);
  };

  const handleCompleteStep = async () => {
    if (currentStepIndex < steps.length - 1) {
      const next = currentStepIndex + 1;
      setCurrentStepIndex(next);
      await supabase.from('chef_event_participants').update({ current_step: next }).eq('id', participation.id);
      toast({ title: `✅ Paso ${currentStepIndex + 1} completado` });
    } else {
      await supabase.from('chef_event_participants').update({ status: 'finished', finished_at: new Date().toISOString() }).eq('id', participation.id);
      navigate(`/app/sigue-al-chef/${id}/resultado`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];
  const stepSubmitted = submissions.some(s => s.step_id === currentStep?.id);
  const progress = ((currentStepIndex + (stepSubmitted ? 1 : 0)) / steps.length) * 100;
  const stepTime = stepTimers[currentStepIndex] || 0;
  const isOverTime = currentStep && stepTime > currentStep.duration_seconds;
  const isLastStep = currentStepIndex === steps.length - 1;
  const twitchChannel = event?.twitch_url?.match(/twitch\.tv\/(\w+)/)?.[1] || '';

  return (
    <div className="min-h-screen bg-black flex flex-col app-typography">

      {/* ── Fixed header ── */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-black" style={{ height: 'var(--sat)' }} />
        <div
          className="relative pb-10"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.95) 40%, transparent 100%)' }}
        >
          <div className="grid grid-cols-3 items-center py-3 px-4">
            {/* Back */}
            <button
              onClick={() => navigate(`/app/sigue-al-chef/${id}`)}
              className="flex items-center justify-center w-9 h-9 rounded-[12px] bg-white active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-5 h-5 text-black" strokeWidth={2} />
            </button>
            {/* Global timer */}
            <div className="flex justify-center">
              <div className="flex items-center gap-1.5 bg-white/8 border border-white/10 rounded-full px-3 py-1.5">
                <Clock className="w-3.5 h-3.5 text-white/40" strokeWidth={1.5} />
                <span className="font-unbounded text-sm font-bold tabular-nums">{formatTime(globalTimer)}</span>
              </div>
            </div>
            {/* Step counter */}
            <div className="flex justify-end">
              <span className="app-caption bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1.5">
                {currentStepIndex + 1}/{steps.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Twitch embed (below safe area + header ~52px) ── */}
      <div style={{ paddingTop: 'calc(var(--sat) + 52px)' }}>
        <div className="sticky top-0 z-30 bg-black w-full aspect-video">
          {twitchChannel ? (
            <iframe
              src={`https://player.twitch.tv/?channel=${twitchChannel}&parent=${window.location.hostname}&muted=false`}
              className="w-full h-full"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="app-body-sm text-white/30">Directo no disponible</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="w-full h-0.5 bg-white/8">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 px-4 pt-4 pb-36 space-y-2">

        {/* Current step card */}
        {currentStep && (
          <div className={`bg-card rounded-2xl p-4 space-y-3 ${isOverTime ? 'ring-1 ring-destructive/50' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="app-heading leading-snug">
                Paso {currentStep.step_number}: {currentStep.title}
              </h2>
              {isOverTime && (
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              )}
            </div>

            {currentStep.description && (
              <p className="app-body-sm text-white/50">{currentStep.description}</p>
            )}

            {/* Timer row */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className={`flex items-center gap-1.5 ${isOverTime ? 'text-destructive' : 'text-white/40'}`}>
                <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="font-unbounded text-xs font-bold tabular-nums">
                  {formatTime(stepTime)}
                </span>
                <span className="app-caption">/ {formatTime(currentStep.duration_seconds)}</span>
              </div>
              {currentStep.photo_required && !stepSubmitted && (
                <span className="app-caption text-primary">📷 Foto obligatoria</span>
              )}
              {stepSubmitted && (
                <span className="app-caption text-green-400 flex items-center gap-1">
                  <Check className="w-3 h-3" strokeWidth={2.5} /> Foto subida
                </span>
              )}
            </div>

            {/* Tips */}
            {currentStep.tips && (
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex gap-2">
                <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <p className="app-body-sm text-white/60">{currentStep.tips}</p>
              </div>
            )}

            {currentStep.reference_image_url && (
              <img
                src={currentStep.reference_image_url}
                alt=""
                className="w-full rounded-xl max-h-44 object-cover"
              />
            )}
          </div>
        )}

        {/* Steps list */}
        <div className="flex flex-col gap-[2px] bg-black rounded-2xl p-[2px]">
          {steps.map((step, idx) => {
            const done = submissions.some(s => s.step_id === step.id);
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 px-3 py-3 rounded-[14px] transition-colors
                  ${isCurrent ? 'bg-primary/10' : 'bg-card'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${done ? 'bg-green-500/15 text-green-400' : isCurrent ? 'bg-primary text-black' : 'bg-white/8 text-white/30'}`}>
                  {done ? <Check className="w-3 h-3" strokeWidth={2.5} /> : step.step_number}
                </div>
                <span className={`flex-1 app-body-sm ${isCurrent ? 'text-white font-semibold' : done ? 'text-white/30' : 'text-white/50'}`}>
                  {step.title}
                </span>
                {isCurrent && <ChevronRight className="w-4 h-4 text-primary" strokeWidth={1.5} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Fixed bottom actions ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 px-4 pt-3 bg-black"
        style={{ paddingBottom: 'max(calc(var(--sab) + 12px), 20px)' }}
      >
        {/* Fade separator */}
        <div className="absolute inset-x-0 -top-8 h-8 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, black)' }} />
        <div className="flex gap-3">
          {!stepSubmitted && (
            <button
              onClick={() => setTipsDialogOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl bg-white/10 text-white font-medium text-sm active:bg-white/15 transition-colors"
            >
              <Camera className="w-5 h-5" strokeWidth={1.5} />
              Subir foto
            </button>
          )}
          <button
            onClick={handleCompleteStep}
            disabled={!!(currentStep?.photo_required && !stepSubmitted)}
            className="flex-1 btn-primary h-14 gap-2 flex items-center justify-center disabled:opacity-40"
          >
            {isLastStep
              ? <><Trophy className="w-5 h-5" strokeWidth={1.5} /> Finalizar</>
              : <><Check className="w-5 h-5" strokeWidth={1.5} /> Completar</>
            }
          </button>
        </div>
      </div>

      {/* ── Tips bottom sheet ── */}
      {tipsDialogOpen && (
        <div className="fixed inset-0 z-[60] flex items-end">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setTipsDialogOpen(false)}
          />
          <div
            className="relative w-full bg-card rounded-t-3xl px-5 pt-4 space-y-4"
            style={{ paddingBottom: 'max(calc(var(--sab) + 24px), 32px)' }}
          >
            <div className="w-10 h-1 rounded-full bg-white/15 mx-auto" />
            <h3 className="app-heading text-center">📸 Tips para la foto</h3>
            <div className="space-y-2.5">
              {[
                '💡 Buena iluminación natural',
                '📐 Plano cenital o a 45°',
                '🚫 Sin filtros ni edición',
                '✅ Que se vea bien el resultado',
              ].map((tip, i) => (
                <p key={i} className="app-body-sm text-white/50">{tip}</p>
              ))}
            </div>
            <button
              onClick={() => { setTipsDialogOpen(false); fileInputRef.current?.click(); }}
              className="btn-primary w-full gap-2 flex items-center justify-center"
            >
              <Camera className="w-4 h-4" strokeWidth={1.5} />
              Tomar foto
            </button>
          </div>
        </div>
      )}

      {/* ── Photo preview bottom sheet ── */}
      {photoDialogOpen && (
        <div className="fixed inset-0 z-[60] flex items-end">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => { setPhotoDialogOpen(false); setPhotoPreview(null); }}
          />
          <div
            className="relative w-full bg-card rounded-t-3xl px-4 pt-4 space-y-4"
            style={{ paddingBottom: 'max(calc(var(--sab) + 24px), 32px)' }}
          >
            <div className="w-10 h-1 rounded-full bg-white/15 mx-auto" />
            <h3 className="app-heading">Vista previa</h3>
            {photoPreview && (
              <img src={photoPreview} alt="" className="w-full rounded-2xl max-h-64 object-cover" />
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setPhotoDialogOpen(false); setPhotoPreview(null); }}
                className="flex-1 h-12 rounded-2xl bg-white/10 text-white font-medium text-sm active:bg-white/15 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUploadPhoto}
                disabled={uploading}
                className="flex-1 btn-primary h-12 gap-2 flex items-center justify-center disabled:opacity-60"
              >
                {uploading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Check className="w-4 h-4" strokeWidth={2} />
                }
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default AppChefLive;
