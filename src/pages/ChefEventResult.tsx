import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Trophy, Clock, Eye, Star, CheckCircle2, Share2, ArrowLeft } from 'lucide-react';

const ChefEventResult = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [participation, setParticipation] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [score, setScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) loadData();
  }, [id, user]);

  const loadData = async () => {
    setLoading(true);
    const [{ data: ev }, { data: st }, { data: part }] = await Promise.all([
      supabase.from('chef_events').select('*').eq('id', id).single(),
      supabase.from('chef_event_steps').select('*').eq('event_id', id).order('step_number'),
      supabase.from('chef_event_participants').select('*').eq('event_id', id).eq('user_id', user!.id).maybeSingle(),
    ]);
    setEvent(ev);
    setSteps(st || []);
    setParticipation(part);

    if (part) {
      const { data: subs } = await supabase.from('chef_step_submissions').select('*').eq('participant_id', part.id);
      setSubmissions(subs || []);

      const subIds = (subs || []).map(s => s.id);
      if (subIds.length > 0) {
        const { data: evals } = await supabase.from('chef_ai_evaluations').select('*').in('submission_id', subIds);
        setEvaluations(evals || []);
      }

      const { data: sc } = await supabase.from('chef_event_scores').select('*').eq('participant_id', part.id).maybeSingle();
      setScore(sc);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event || !participation) {
    navigate(`/sigue-al-chef/${id}`);
    return null;
  }

  const totalScore = score?.total_score ?? null;
  const stepsCompleted = submissions.length;
  const hasScore = totalScore !== null;

  // Calculate average timing
  const avgTimingPercent = steps.length > 0
    ? submissions.reduce((acc, sub) => {
        const step = steps.find((s: any) => s.id === sub.step_id);
        if (!step || !sub.time_taken_seconds) return acc;
        return acc + Math.min(100, (step.duration_seconds / sub.time_taken_seconds) * 100);
      }, 0) / Math.max(1, submissions.length)
    : 0;

  const getBadgeEmoji = () => {
    if (!hasScore) return null;
    if (totalScore >= 90) return { emoji: '👨‍🍳', label: 'Ritmo del Chef' };
    if (totalScore >= 75) return { emoji: '🏆', label: 'Emplatado Top' };
    if (totalScore >= 50) return { emoji: '⏱️', label: 'Puntual' };
    return { emoji: '🔥', label: 'Participante' };
  };

  const badge = getBadgeEmoji();

  const motivationalMessage = () => {
    if (!hasScore) return 'Tu evaluación está en proceso. ¡Pronto tendrás tu puntuación!';
    if (totalScore >= 90) return '¡Espectacular! Has cocinado como un verdadero chef profesional.';
    if (totalScore >= 75) return '¡Gran trabajo! Tu plato tiene muy buena pinta.';
    if (totalScore >= 50) return 'Buen intento, sigue practicando y mejorarás.';
    return 'No te rindas, cada intento te hace mejor cocinero.';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-12 container mx-auto px-4 max-w-2xl">
        <Button variant="ghost" size="sm" className="mb-6 gap-1.5" onClick={() => navigate(`/sigue-al-chef/${id}`)}>
          <ArrowLeft className="w-4 h-4" /> Volver al evento
        </Button>

        {/* Score Hero */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent mb-6 overflow-hidden">
          <CardContent className="p-6 text-center space-y-4">
            {badge && (
              <div className="text-6xl mb-2">{badge.emoji}</div>
            )}
            <h1 className="font-unbounded text-2xl font-bold">
              {hasScore ? `${totalScore} / 100` : 'Evaluando...'}
            </h1>
            {badge && <Badge className="text-sm">{badge.label}</Badge>}
            <p className="text-muted-foreground">{motivationalMessage()}</p>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        {hasScore && (
          <Card className="mb-6">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-unbounded font-bold">Desglose de puntuación</h3>
              
              <ScoreBar label="Fidelidad visual" value={score.visual_fidelity} icon="👁️" />
              <ScoreBar label="Tiempo" value={score.timing} icon="⏱️" />
              <ScoreBar label="Presentación" value={score.presentation} icon="🍽️" />
              <ScoreBar label="Completitud" value={score.completeness} icon="✅" />
            </CardContent>
          </Card>
        )}

        {/* Steps Timeline */}
        <Card className="mb-6">
          <CardContent className="p-5">
            <h3 className="font-unbounded font-bold mb-4">Tu recorrido</h3>
            <div className="space-y-4">
              {steps.map((step: any, i: number) => {
                const sub = submissions.find(s => s.step_id === step.id);
                const evaluation = sub ? evaluations.find(e => e.submission_id === sub.id) : null;
                
                return (
                  <div key={step.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        sub ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {sub ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                      </div>
                      {i < steps.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium text-sm">{step.title}</p>
                      {sub && (
                        <div className="mt-2 space-y-2">
                          {sub.photo_url && (
                            <img src={sub.photo_url} alt="" className="rounded-lg w-32 h-32 object-cover" />
                          )}
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.floor((sub.time_taken_seconds || 0) / 60)}m {(sub.time_taken_seconds || 0) % 60}s
                          </p>
                          {evaluation && (
                            <p className="text-xs text-muted-foreground italic">"{evaluation.reasoning}"</p>
                          )}
                        </div>
                      )}
                      {!sub && <p className="text-xs text-muted-foreground">No completado</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Gallery */}
        {submissions.filter(s => s.photo_url).length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-5">
              <h3 className="font-unbounded font-bold mb-3">Tu galería</h3>
              <div className="grid grid-cols-3 gap-2">
                {submissions.filter(s => s.photo_url).map(sub => (
                  <img key={sub.id} src={sub.photo_url} alt="" className="rounded-lg aspect-square object-cover" />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Energy awarded */}
        {score?.energy_awarded > 0 && (
          <Card className="border-primary/20 bg-primary/5 mb-6">
            <CardContent className="p-5 text-center">
              <p className="font-unbounded font-bold text-primary text-xl">+{score.energy_awarded} ⚡</p>
              <p className="text-sm text-muted-foreground">Puntos de energía obtenidos</p>
            </CardContent>
          </Card>
        )}

        {/* Share */}
        <Button variant="outline" className="w-full gap-2" onClick={() => {
          if (navigator.share) {
            navigator.share({ title: `Mi resultado en ${event.title}`, text: `He conseguido ${totalScore}/100 en el reto "Sigue al Chef"`, url: window.location.href });
          }
        }}>
          <Share2 className="w-4 h-4" /> Compartir resultado
        </Button>
      </main>
    </div>
  );
};

const ScoreBar = ({ label, value, icon }: { label: string; value: number; icon: string }) => (
  <div>
    <div className="flex items-center justify-between text-sm mb-1">
      <span className="flex items-center gap-1.5">{icon} {label}</span>
      <span className="font-bold">{value}/25</span>
    </div>
    <Progress value={(value / 25) * 100} className="h-2" />
  </div>
);

export default ChefEventResult;
