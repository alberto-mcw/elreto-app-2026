import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ReactNode } from 'react';

interface SecondaryHeaderProps {
  title?: string;
  titleLarge?: boolean;
  rightAction?: ReactNode;
  onBack?: () => void;
  transparent?: boolean;
}

export const SecondaryHeader = ({ title, titleLarge, rightAction, onBack, transparent }: SecondaryHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      {/* Fixed header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 pb-12"
        style={transparent ? {} : {
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.95) 30%, transparent 100%)',
        }}
      >
        {/* iOS safe area spacer */}
        <div style={{ height: 'var(--sat)' }} />
        <div className="flex items-center justify-between py-3 px-4 min-h-[48px]">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-9 h-9 rounded-[12px] bg-white active:scale-95 transition-transform"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </button>
          {title && !titleLarge && (
            <span className="text-sm font-semibold text-foreground absolute left-1/2 -translate-x-1/2">
              {title}
            </span>
          )}
          <div className="w-9">
            {rightAction}
          </div>
        </div>
        {titleLarge && title && (
          <div className="px-4 pb-2 pt-1">
            <h1 className="app-section-title">{title}</h1>
          </div>
        )}
      </header>
    </>
  );
};
