import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MobileAppLayout } from '@/components/app/MobileAppLayout';
import { SecondaryHeader } from '@/components/app/SecondaryHeader';
import { Loader2, ChefHat, Clock, Flame, CheckCircle2, AlertCircle } from 'lucide-react';

const COVER_PLACEHOLDER = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AppChefLobby = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [participation, setParticipation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (id) fetchEvent();
  }, [id]);

  useEffect(() => {
    if (!event) return;
    const interval = setInterval(() => {
      const diff = new Date(event.scheduled_at).getTime() - Date.now();
      if (diff <= 0) {
        setCountdown('¡Ya ha empezado!');
        clearInterval(interval);
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h > 0 ? h + 'h ' : ''}${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [event]);

  useEffect(() => {
    if (user && id) checkParticipation();
  }, [user, id]);

  const fetchEvent = async () => {
    const [{ data: ev }, { data: st }] = await Promise.all([
      supabase.from('chef_events').select('*').eq('id', id!).single(),
      supabase.from('chef_event_steps').select('*').eq('event_id', id!).order('step_number'),
    ]);
    setEvent(ev);
    setSteps(st || []);
    setLoading(false);
  };

  const checkParticipation = async () => {
    const { data } = await supabase
      .from('chef_event_participants')
      .select('*')
      .eq('event_id', id!)
      .eq('user_id', user!.id)
      .maybeSingle();
    setParticipation(data);
  };

  const handleJoin = async () => {
    if (!user) { navigate('/app/auth'); return; }
    setJoining(true);
    const { data, error } = await supabase
      .from('chef_event_participants')
      .insert({ event_id: id!, user_id: user.id })
      .select()
      .single();
    if (!error) setParticipation(data);
    setJoining(false);
  };

  const handleEnterLive = () => navigate(`/app/sigue-al-chef/${id}/live`);

  if (loading || authLoading) {
    return (
      <MobileAppLayout showNav={false}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileAppLayout>
    );
  }

  if (!event) {
    return (
      <MobileAppLayout showNav={false}>
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <AlertCircle className="w-10 h-10 text-white/30 mb-3" />
          <p className="app-body-sm text-white/50">Evento no encontrado</p>
          <button className="mt-4 app-caption text-primary" onClick={() => navigate('/app/sigue-al-chef')}>
            Volver
          </button>
        </div>
      </MobileAppLayout>
    );
  }

  const ingredients = Array.isArray(event.ingredients) ? event.ingredients : [];
  const utensils = Array.isArray(event.utensils) ? event.utensils : [];
  const isLiveOrPast = event.status === 'live' || event.status === 'finished';

  return (
    <MobileAppLayout showNav={false}>
      <SecondaryHeader title={event.title} onBack={() => navigate('/app')} />

      {/* Cover image — full bleed below header */}
      <div className="relative w-full h-52">
        <img
          src={event.cover_image_url || COVER_PLACEHOLDER}
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Gradient fade at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black to-transparent" />
        {event.status === 'live' && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-destructive text-white text-xs font-bold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            EN DIRECTO
          </div>
        )}
      </div>

      <div className="px-4 pb-24 space-y-3 -mt-4 relative z-10">

        {/* Chef info card */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h1 className="app-heading text-lg leading-snug">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 app-caption">
              <ChefHat className="w-3.5 h-3.5" strokeWidth={1.5} />
              {event.chef_name}
            </span>
            <span className="flex items-center gap-1.5 app-caption">
              <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
              {event.duration_minutes} min
            </span>
            <span className="flex items-center gap-1.5 app-caption text-primary">
              <Flame className="w-3.5 h-3.5" strokeWidth={1.5} />
              +{event.energy_reward} pts
            </span>
          </div>
          {event.description && (
            <p className="app-body-sm text-white/50">{event.description}</p>
          )}
        </div>

        {/* Countdown */}
        {!isLiveOrPast && countdown && (
          <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 text-center">
            <p className="app-caption text-white/50 mb-1">Empieza en</p>
            <p className="font-unbounded text-2xl font-bold text-primary">{countdown}</p>
          </div>
        )}

        {/* CTA */}
        {participation ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 app-body-sm text-green-400 justify-center">
              <CheckCircle2 className="w-4 h-4" />
              Estás inscrito
            </div>
            {(event.status === 'live' || event.status === 'published') && (
              <button onClick={handleEnterLive} className="btn-primary w-full">
                🔥 Entrar al directo
              </button>
            )}
          </div>
        ) : (
          <button onClick={handleJoin} disabled={joining} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
            {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
            Unirme al reto
          </button>
        )}

        {/* Date */}
        <div className="bg-card rounded-2xl px-4 py-3 space-y-1">
          <p className="app-caption text-white/40 uppercase tracking-widest">📅 Fecha y hora</p>
          <p className="app-body-sm">
            {format(new Date(event.scheduled_at), "EEEE d 'de' MMMM yyyy · HH:mm'h'", { locale: es })}
          </p>
        </div>

        {/* Steps */}
        {steps.length > 0 && (
          <div className="bg-card rounded-2xl p-4 space-y-3">
            <p className="app-caption text-white/40 uppercase tracking-widest">📋 {steps.length} pasos</p>
            {steps.map(step => (
              <div key={step.id} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {step.step_number}
                </div>
                <div>
                  <p className="app-body-sm font-medium">{step.title}</p>
                  <p className="app-caption text-white/40">{Math.round(step.duration_seconds / 60)} min</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <div className="bg-card rounded-2xl p-4 space-y-2">
            <p className="app-caption text-white/40 uppercase tracking-widest">🛒 Ingredientes</p>
            <ul className="space-y-1.5">
              {ingredients.map((ing: string, i: number) => (
                <li key={i} className="flex items-start gap-2 app-body-sm text-white/70">
                  <span className="text-primary mt-0.5">•</span> {ing}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Utensils */}
        {utensils.length > 0 && (
          <div className="bg-card rounded-2xl p-4 space-y-2">
            <p className="app-caption text-white/40 uppercase tracking-widest">🍳 Utensilios</p>
            <ul className="space-y-1.5">
              {utensils.map((u: string, i: number) => (
                <li key={i} className="flex items-start gap-2 app-body-sm text-white/70">
                  <span className="text-primary mt-0.5">•</span> {u}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rules */}
        {event.rules && (
          <div className="bg-card rounded-2xl p-4 space-y-2">
            <p className="app-caption text-white/40 uppercase tracking-widest">📏 Normas</p>
            <p className="app-body-sm text-white/70 whitespace-pre-line">{event.rules}</p>
          </div>
        )}

        {/* Evaluation */}
        {event.evaluation_criteria && (
          <div className="bg-card rounded-2xl p-4 space-y-2">
            <p className="app-caption text-white/40 uppercase tracking-widest">⭐ Criterios de evaluación</p>
            <p className="app-body-sm text-white/70 whitespace-pre-line">{event.evaluation_criteria}</p>
          </div>
        )}

      </div>
    </MobileAppLayout>
  );
};

export default AppChefLobby;
