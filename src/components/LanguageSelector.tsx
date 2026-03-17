import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'pill' | 'minimal';
}

export const LanguageSelector = ({ className, variant = 'pill' }: LanguageSelectorProps) => {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('en') ? 'en' : 'es';

  const toggle = (lang: 'es' | 'en') => {
    i18n.changeLanguage(lang);
  };

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-0.5 text-xs font-medium", className)}>
        <button
          onClick={() => toggle('es')}
          className={cn(
            "px-1.5 py-0.5 rounded transition-colors",
            current === 'es' ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
          )}
        >
          ES
        </button>
        <span className="text-border">/</span>
        <button
          onClick={() => toggle('en')}
          className={cn(
            "px-1.5 py-0.5 rounded transition-colors",
            current === 'en' ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
          )}
        >
          EN
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center bg-muted rounded-full p-0.5 border border-border", className)}>
      <button
        onClick={() => toggle('es')}
        className={cn(
          "px-2 py-1 rounded-full text-xs font-medium transition-all",
          current === 'es'
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        ES
      </button>
      <button
        onClick={() => toggle('en')}
        className={cn(
          "px-2 py-1 rounded-full text-xs font-medium transition-all",
          current === 'en'
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </button>
    </div>
  );
};
