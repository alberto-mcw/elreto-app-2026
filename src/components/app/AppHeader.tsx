import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useAdmin } from '@/hooks/useAdmin';
import { Zap, ChefHat, Shield } from 'lucide-react';
import logoCompact from '@/assets/logo-m-masterchef.svg';

interface AppHeaderProps {
  rightAction?: ReactNode;
  className?: string;
  noBorder?: boolean;
  bare?: boolean;
  avatarReplacement?: ReactNode;
}

const EMOJI_AVATARS = ['🍕', '🍷', '🥐', '🍣', '☕', '🍞', '🍾', '🍜', '🦪', '🍰', '🔪', '🍏', '🌯', '🍫', '🍔', '🧋', '🍝', '🍦', '🥘', '🍪'];

export const AppHeader = ({ rightAction, className, noBorder, bare, avatarReplacement }: AppHeaderProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { isAdmin } = useAdmin();

  const avatarUrl = profile?.avatar_url;
  const isEmoji = avatarUrl && EMOJI_AVATARS.includes(avatarUrl);

  const renderAvatar = () => {
    if (isEmoji) {
      return (
        <Link to="/app/perfil" className="w-8 h-8 rounded-full bg-white/5 border border-black flex items-center justify-center">
          <span className="text-lg">{avatarUrl}</span>
        </Link>
      );
    }
    if (avatarUrl?.startsWith('http')) {
      return (
        <Link to="/app/perfil" className="w-8 h-8 rounded-full overflow-hidden bg-white/5 border border-black">
          <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
        </Link>
      );
    }
    return (
      <Link to="/app/perfil" className="w-8 h-8 rounded-full bg-white/5 border border-black flex items-center justify-center">
        <ChefHat className="w-4 h-4 text-primary" />
      </Link>
    );
  };

  return (
    <header
      className={cn(
        bare ? '' : 'fixed top-0 left-0 right-0 z-40 w-full',
        className
      )}
    >
      {/* iOS safe area spacer */}
      <div className={bare ? '' : 'bg-black'} style={{ height: 'var(--sat)' }} />
      {/* Gradient fade — no blur */}
      <div
        className={bare ? 'relative' : 'relative pb-12'}
        style={bare ? {} : {
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.95) 30%, transparent 100%)',
        }}
      >
        <div className="grid grid-cols-3 items-center py-3 px-4">
          {/* Left — avatar or back button */}
          <div className="flex items-center">
            {user && (avatarReplacement ?? renderAvatar())}
          </div>

          {/* Center — logo */}
          <div className="flex justify-center">
            <img
              src={logoCompact}
              alt="MasterChef"
              className="h-9 w-auto object-contain"
            />
          </div>

          {/* Right — points + admin */}
          <div className="flex items-center justify-end gap-2">
            {user && (
              <>
                {isAdmin && (
                  <Link
                    to="/admin/usuarios"
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-black"
                  >
                    <Shield className="w-3.5 h-3.5 text-primary" />
                  </Link>
                )}
                <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-1">
                  <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
                  <span className="text-sm font-bold text-primary tabular-nums">
                    {profile?.total_energy?.toLocaleString() || 0}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {rightAction && (
          <div className="flex items-center justify-end pb-2 px-4">
            {rightAction}
          </div>
        )}
      </div>
    </header>
  );
};
