import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, Trophy, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    icon: () => (
      /* Stylized "R" matching the DS reference */
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M7 20V4h5.5a4.5 4.5 0 0 1 0 9H7" />
        <path d="M12.5 13 18 20" />
      </svg>
    ),
    label: 'El Reto',
    path: '/app',
  },
  {
    icon: CalendarDays,
    label: 'Calendario',
    path: '/app/calendario',
  },
  {
    icon: Trophy,
    label: 'Retos',
    path: '/app/galeria',
  },
  {
    icon: Flame,
    label: 'Galería',
    path: '/app/perfil',
  },
];

export const BottomNav = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/app') {
      return location.pathname === '/app' || location.pathname === '/app/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 px-3"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)' }}
    >
      <div className="bg-card/90 dark:bg-card/80 backdrop-blur-xl border border-border/30 rounded-2xl shadow-lg">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {/* Active glow ring behind icon */}
                {active && (
                  <span
                    aria-hidden
                    className="absolute top-2 w-10 h-10 rounded-full border-2 border-primary/60 bg-primary/10 blur-[2px]"
                  />
                )}
                <span className="relative z-10">
                  <Icon
                    className="w-6 h-6"
                    strokeWidth={active ? 2.2 : 1.5}
                  />
                </span>
                <span className={cn(
                  "relative z-10 text-[10px] leading-none",
                  active ? "font-bold" : "font-medium"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
