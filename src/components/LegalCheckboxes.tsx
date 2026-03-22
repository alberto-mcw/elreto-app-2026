import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';

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
          <a href="https://elretomcw.vercel.app/bases" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            {t('legal.termsAndConditions')}
          </a>
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
          <a href="https://elretomcw.vercel.app/bases" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            {t('legal.privacyPolicy')}
          </a>
        </label>
      </div>
      {errors?.acceptPrivacy && (
        <p className="text-xs text-destructive">{errors.acceptPrivacy}</p>
      )}
    </div>
  );
};
