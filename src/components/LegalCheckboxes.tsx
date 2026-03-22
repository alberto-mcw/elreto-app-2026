import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';

// Opens URL in system browser on Capacitor native; falls back to out-of-scope
// navigation for PWA (iOS/Android scope mechanism hands it to Safari/Chrome).
function openExternal(url: string) {
  const cap = (window as any).Capacitor;
  if (cap?.isNativePlatform?.()) {
    window.open(url, '_system');
  } else {
    window.location.href = url;
  }
}

interface LegalCheckboxesProps {
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  onTermsChange: (checked: boolean) => void;
  onPrivacyChange: (checked: boolean) => void;
  errors?: { acceptTerms?: string; acceptPrivacy?: string };
}

export const LegalCheckboxes = ({
  acceptTerms,
  acceptPrivacy,
  onTermsChange,
  onPrivacyChange,
  errors,
}: LegalCheckboxesProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-start gap-2">
        <Checkbox
          checked={acceptTerms}
          onCheckedChange={(v) => onTermsChange(v === true)}
          id="accept-terms"
        />
        <label htmlFor="accept-terms" className="text-xs text-muted-foreground leading-tight cursor-pointer">
          {t('legal.acceptTerms')}{' '}
          <button type="button" onClick={() => openExternal('https://elretomcw.vercel.app/bases')} className="text-primary hover:underline">
            {t('legal.termsAndConditions')}
          </button>
        </label>
      </div>
      {errors?.acceptTerms && (
        <p className="text-xs text-destructive">{errors.acceptTerms}</p>
      )}

      <div className="flex items-start gap-2">
        <Checkbox
          checked={acceptPrivacy}
          onCheckedChange={(v) => onPrivacyChange(v === true)}
          id="accept-privacy"
        />
        <label htmlFor="accept-privacy" className="text-xs text-muted-foreground leading-tight cursor-pointer">
          {t('legal.acceptPrivacy')}{' '}
          <button type="button" onClick={() => openExternal('https://elretomcw.vercel.app/bases')} className="text-primary hover:underline">
            {t('legal.privacyPolicy')}
          </button>
        </label>
      </div>
      {errors?.acceptPrivacy && (
        <p className="text-xs text-destructive">{errors.acceptPrivacy}</p>
      )}
    </div>
  );
};
