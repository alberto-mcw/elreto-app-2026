import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ChefHat, Clock, Flame, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ChefEventLobby = () => {
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
      const now = new Date().getTime();
      const target = new Date(event.scheduled_at).getTime();
      const diff = target - now;
      if (diff <= 0) {
        setCountdown('¡EN DIRECTO!');
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
    setLoading(true);
    const { data: eventData } = await supabase.from('chef_events').select('*').eq('id', id).single();
    const { data: stepsData } = await supabase.from('chef_event_steps').select('*').eq('event_id', id).order('step_number');
    setEvent(eventData);
    setSteps(stepsData || []);
    setLoading(false);
  };

  const checkParticipation = async () => {
    const { data } = await supabase
      .from('chef_event_participants')
      .select('*')
      .eq('event_id', id)
      .eq('user_id', user!.id)
      .maybeSingle();
    setParticipation(data);
  };

  const handleJoin = async () => {
    if (!user) { navigate('/auth'); return; }
    setJoining(true);
    const { error } = await supabase
      .from('chef_event_participants')
      .insert({ event_id: id, user_id: user.id });
    if (!error) {
      await checkParticipation();
    }
    setJoining(false);
  };

  const canEnterLive = event && (event.status === 'live' || event.status === 'published');

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12 container mx-auto px-4 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Evento no encontrado</p>
        </main>
      </div>
    );
  }

  const scheduledDate = new Date(event.scheduled_at);
  const isLive = event.status === 'live';
  const isPast = event.status === 'finished';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        {/* Hero */}
        <div className="relative">
          {event.cover_image_url ? (
            <div className="h-56 md:h-72 relative overflow-hidden">
              <img src={event.cover_image_url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            </div>
          ) : (
            <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5" />
          )}

          <div className="container mx-auto px-4 -mt-16 relative z-10">
            <Button variant="ghost" size="sm" className="mb-4 gap-1.5" onClick={() => navigate('/sigue-al-chef')}>
              <ArrowLeft className="w-4 h-4" /> Volver
            </Button>

            <div className="flex items-start gap-4">
              {isLive && (
                <Badge className="bg-red-500 text-white border-0 animate-pulse text-sm px-3 py-1">
                  🔴 EN DIRECTO
                </Badge>
              )}
              {isPast && <Badge variant="outline">Finalizado</Badge>}
            </div>

            <h1 className="font-unbounded text-3xl md:text-4xl font-bold mt-3 mb-2">{event.title}</h1>
            
            <div className="flex items-center gap-3 text-muted-foreground mb-4">
              <ChefHat className="w-4 h-4 text-primary" />
              <span className="font-medium">{event.chef_name}</span>
              <span>·</span>
              <Clock className="w-4 h-4" />
              <span>{event.duration_minutes} min</span>
              <span>·</span>
              <Flame className="w-4 h-4 text-primary" />
              <span>+{event.energy_reward} pts</span>
            </div>

            {/* Countdown */}
            {!isPast && (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-1">
                  {format(scheduledDate, "EEEE d 'de' MMMM, HH:mm'h'", { locale: es })}
                </p>
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
                  <span className="font-unbounded text-lg font-bold text-primary">{countdown}</span>
                </div>
              </div>
            )}

            {event.description && (
              <p className="text-muted-foreground max-w-2xl mb-6">{event.description}</p>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 mt-8 grid md:grid-cols-3 gap-6">
          {/* Left: info */}
          <div className="md:col-span-2 space-y-6">
            {/* Ingredients */}
            {event.ingredients?.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-unbounded font-bold mb-3">🧂 Ingredientes</h3>
                  <ul className="grid grid-cols-2 gap-2">
                    {event.ingredients.map((ing: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" /> {ing}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Utensils */}
            {event.utensils?.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-unbounded font-bold mb-3">🍳 Utensilios</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.utensils.map((ut: string, i: number) => (
                      <Badge key={i} variant="secondary">{ut}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Steps preview */}
            {steps.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-unbounded font-bold mb-3">📋 {steps.length} pasos de la receta</h3>
                  <div className="space-y-3">
                    {steps.map((step, i) => (
                      <div key={step.id} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{step.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.floor(step.duration_seconds / 60)} min
                            {step.photo_required && ' · 📸 Foto obligatoria'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rules */}
            {event.rules && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-unbounded font-bold mb-3">📏 Normas</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{event.rules}</p>
                </CardContent>
              </Card>
            )}

            {/* Evaluation criteria */}
            {event.evaluation_criteria && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-unbounded font-bold mb-3">⭐ Criterios de evaluación</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{event.evaluation_criteria}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: CTA */}
          <div className="space-y-4">
            {event.final_dish_image_url && (
              <Card className="overflow-hidden">
                <img src={event.final_dish_image_url} alt="Plato final" className="w-full aspect-square object-cover" />
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">Resultado esperado</p>
                </CardContent>
              </Card>
            )}

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-5 text-center space-y-4">
                {participation ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
                    <p className="font-unbounded font-bold">¡Estás inscrito!</p>
                    {canEnterLive && (
                      <Button className="w-full gap-2" size="lg" onClick={() => navigate(`/sigue-al-chef/${id}/live`)}>
                        🔴 Entrar al directo
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Flame className="w-8 h-8 text-primary mx-auto" />
                    <p className="font-unbounded font-bold">¿Preparado para cocinar?</p>
                    <p className="text-sm text-muted-foreground">Apúntate y cocina en directo con {event.chef_name}</p>
                    <Button className="w-full gap-2" size="lg" onClick={handleJoin} disabled={joining || isPast}>
                      {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                      {isPast ? 'Evento finalizado' : 'Entrar al reto'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChefEventLobby;
