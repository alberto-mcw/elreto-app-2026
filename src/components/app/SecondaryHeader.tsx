import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ReactNode } from 'react';
import logoCompact from '@/assets/logo-m-masterchef.svg';

interface SecondaryHeaderProps {
  title?: string;
  titleLarge?: boolean;
  hideLogo?: boolean;
  rightAction?: ReactNode;
  onBack?: () => void;
  transparent?: boolean;
}

export const SecondaryHeader = ({ title, titleLarge, hideLogo, rightAction, onBack, transparent }: SecondaryHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 pb-12"
      style={transparent ? {} : {
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.95) 30%, transparent 100%)',
      }}
    >
      {/* iOS safe area spacer */}
      <div className="bg-black" style={{ height: 'var(--sat)' }} />
      {/* Same 3-column grid as AppHeader so the M logo is always in the same spot */}
      <div className="grid grid-cols-3 items-center py-3 px-4">
        {/* Left — back button + optional large title */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-9 h-9 rounded-[12px] bg-white active:scale-95 transition-transform flex-shrink-0"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </button>
          {titleLarge && title && (
            <h1 className="app-section-title leading-none">{title}</h1>
          )}
        </div>

        {/* Center — logo M or title */}
        <div className="flex justify-center">
          {hideLogo && title ? (
            <span className="app-section-title">{title}</span>
          ) : (
            <img
              src={logoCompact}
              alt="MasterChef"
              className="h-9 w-auto object-contain"
            />
          )}
        </div>

        {/* Right — action or spacer */}
        <div className="flex items-center justify-end">
          {rightAction ?? <div className="w-9" />}
        </div>
      </div>
    </header>
  );
};
