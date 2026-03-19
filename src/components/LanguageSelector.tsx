import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'pill' | 'minimal';
  theme?: 'default' | 'recetario';
}

export const LanguageSelector = ({
  className,
  variant = 'pill',
  theme = 'default',
}: LanguageSelectorProps) => {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('en') ? 'en' : 'es';

  const toggle = (lang: 'es' | 'en') => {
    i18n.changeLanguage(lang);
  };

  const styles = {
    default: {
      minimalActive: 'text-primary font-bold',
      minimalInactive: 'text-muted-foreground hover:text-foreground',
      minimalDivider: 'text-border',
      pillWrapper: 'bg-muted border border-border',
      pillActive: 'bg-card text-foreground shadow-sm',
      pillInactive: 'text-muted-foreground hover:text-foreground',
    },
    recetario: {
      minimalActive: 'text-recetario-primary font-bold',
      minimalInactive: 'text-recetario-muted hover:text-recetario-fg',
      minimalDivider: 'text-recetario-border',
      pillWrapper: 'bg-recetario-surface border border-recetario-border',
      pillActive: 'bg-recetario-card text-recetario-fg shadow-sm',
      pillInactive: 'text-recetario-muted hover:text-recetario-fg',
    },
  }[theme];

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-0.5 text-xs font-medium', className)}>
        <button
          onClick={() => toggle('es')}
          className={cn(
            'px-1.5 py-0.5 rounded transition-colors',
            current === 'es' ? styles.minimalActive : styles.minimalInactive
          )}
        >
          ES
        </button>
        <span className={styles.minimalDivider}>/</span>
        <button
          onClick={() => toggle('en')}
          className={cn(
            'px-1.5 py-0.5 rounded transition-colors',
            current === 'en' ? styles.minimalActive : styles.minimalInactive
          )}
        >
          EN
        </button>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center rounded-full p-0.5', styles.pillWrapper, className)}>
      <button
        onClick={() => toggle('es')}
        className={cn(
          'px-2 py-1 rounded-full text-xs font-medium transition-all',
          current === 'es' ? styles.pillActive : styles.pillInactive
        )}
      >
        ES
      </button>
      <button
        onClick={() => toggle('en')}
        className={cn(
          'px-2 py-1 rounded-full text-xs font-medium transition-all',
          current === 'en' ? styles.pillActive : styles.pillInactive
        )}
      >
        EN
      </button>
    </div>
  );
};
