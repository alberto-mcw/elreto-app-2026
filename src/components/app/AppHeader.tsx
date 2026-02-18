import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';
import { Zap, ChefHat } from 'lucide-react';
import logoLight from '@/assets/logo-light.png';
import { AnimatedGlow } from './AnimatedGlow';

interface AppHeaderProps {
  rightAction?: ReactNode;
  className?: string;
}

const EMOJI_AVATARS = ['🍕', '🍷', '🥐', '🍣', '☕', '🍞', '🍾', '🍜', '🦪', '🍰', '🔪', '🍏', '🌯', '🍫', '🍔', '🧋', '🍝', '🍦', '🥘', '🍪'];

export const AppHeader = ({ rightAction, className }: AppHeaderProps) => {
  const { profile } = useProfile();

  const avatarUrl = profile?.avatar_url;
  const isEmoji = avatarUrl && EMOJI_AVATARS.includes(avatarUrl);

  const renderAvatar = () => {
    if (isEmoji) {
      return (
        <Link to="/app/perfil" className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center flex-shrink-0">
          <span className="text-xl">{avatarUrl}</span>
        </Link>
      );
    }
    if (avatarUrl?.startsWith('http')) {
      return (
        <Link to="/app/perfil" className="w-9 h-9 rounded-full overflow-hidden bg-muted flex-shrink-0">
          <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
        </Link>
      );
    }
    return (
      <Link to="/app/perfil" className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center flex-shrink-0">
        <ChefHat className="w-5 h-5 text-primary" />
      </Link>
    );
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 px-4 overflow-hidden",
        className
      )}
      style={{ paddingTop: 'calc(8px + env(safe-area-inset-top, 0px))' }}
    >
      <AnimatedGlow />

      {/* Floating pill bar */}
      <div className="relative z-10 py-2">
        <div className="flex items-center justify-between bg-white backdrop-blur-xl rounded-full pl-2 pr-1.5 py-1.5 shadow-lg border border-black/5">
          {/* Logo — invert the light logo so it appears dark on white pill */}
          <div className="flex-shrink-0 h-9 w-auto flex items-center">
            <img
              src={logoLight}
              alt="El Reto"
              className="h-8 w-auto object-contain invert"
            />
          </div>

          {/* Right side: energy + avatar */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 px-2">
              <Zap className="w-4 h-4 text-primary fill-primary" />
              <span className="text-base font-black text-[hsl(220,15%,8%)] tabular-nums font-display">
                {profile?.total_energy?.toLocaleString() || 0}
              </span>
            </div>
            {renderAvatar()}
          </div>
        </div>
      </div>

      {/* Optional right action */}
      {rightAction && (
        <div className="relative z-10 flex items-center justify-end pb-2">
          {rightAction}
        </div>
      )}
    </header>
  );
};
