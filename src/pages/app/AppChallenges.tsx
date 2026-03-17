import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MobileAppLayout } from '@/components/app/MobileAppLayout';
import { AppHeader } from '@/components/app/AppHeader';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { DailyTrivia } from '@/components/dashboard/DailyTrivia';
import { PastTrivias } from '@/components/dashboard/PastTrivias';
import { WeeklyChallenges } from '@/components/dashboard/WeeklyChallenges';
import { SuperLikeNotification } from '@/components/dashboard/SuperLikeNotification';
import { Zap, Trophy } from 'lucide-react';
import logoVerticalLight from '@/assets/logo-vertical-light.png';

const AppChallenges = () => {
  const { user } = useAuth();
  const { profile, refetch } = useProfile();
  const [localEnergy, setLocalEnergy] = useState(0);

  useEffect(() => {
    if (profile) {
      setLocalEnergy(profile.total_energy);
    }
  }, [profile]);

  const handleEnergyEarned = (amount: number) => {
    setLocalEnergy(prev => prev + amount);
    setTimeout(() => refetch(), 1000);
  };

  return (
    <MobileAppLayout>
      {user && <SuperLikeNotification userId={user.id} />}
      
      <AppHeader />

      {/* Hero section */}
      <div className="px-4 pt-6 pb-6">
        <div className="flex flex-col items-center text-center">
          <img
            src={logoVerticalLight}
            alt="El Reto"
            className="h-24 w-auto object-contain mb-4"
          />
          <h1 className="app-title mb-2">
            Enciende los fogones
          </h1>
          <p className="app-body max-w-xs">
            En MasterChef estamos cambiando las reglas del juego: todo comienza en tu cocina. ¿Estás preparad@?
          </p>
          <p className="text-sm text-muted-foreground mt-3 max-w-xs">
            Tendrás <strong className="text-foreground">4 oportunidades</strong> para completar las 4 fases. Si lo logras, estarás en el último casting televisado, donde solo <strong className="text-foreground">15 aspirantes</strong> se ganarán su lugar en MasterChef.
          </p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Energy Summary Card */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary fill-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Tus puntos</p>
                <p className="text-2xl font-bold text-primary tabular-nums">
                  {localEnergy.toLocaleString()}
                </p>
              </div>
            </div>
            <Link to="/app/ranking" className="btn-primary px-5 py-3 text-sm flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Ver Ranking
            </Link>
          </div>
        </div>

        {/* Daily Trivia */}
        <section>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-3">
            ⚡ Mini reto diario
          </h2>
          <DailyTrivia onEnergyEarned={handleEnergyEarned} />
        </section>

        {/* Past Trivias */}
        <PastTrivias onEnergyEarned={handleEnergyEarned} />

        {/* Weekly Challenges */}
        <section>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-3">
            🏆 Desafíos semanales
          </h2>
          <WeeklyChallenges />
        </section>

        {/* Info Card */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="text-base font-semibold mb-3 text-foreground">📱 ¿Cómo ganar más puntos?</h3>
          <ul className="space-y-2.5 text-sm text-foreground">
            <li className="flex items-center gap-2">
              <span className="text-primary">•</span>
              Mini Reto Diario a tiempo: +30 acertando, +2 fallando
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">•</span>
              Desafío Semanal a tiempo: +100 puntos
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">•</span>
              Recibir likes en tus vídeos: +1 por like
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">•</span>
              SuperLike recibido: +50 puntos
            </li>
          </ul>
        </div>
      </div>
    </MobileAppLayout>
  );
};

export default AppChallenges;
