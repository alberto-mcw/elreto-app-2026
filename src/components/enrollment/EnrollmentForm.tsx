import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COMMON_PREFIXES, getPhonePrefixForCountry } from '@/lib/phonePrefix';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import {
  MapPin, Phone, Calendar, ChevronRight, ChevronLeft, Loader2, Home, Hash, Building, Mail as MailIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const addressSchema = z.object({
  street: z.string().min(3, 'Introduce tu calle'),
  street_number: z.string().min(1, 'Introduce el número'),
  address_city: z.string().min(2, 'Introduce tu ciudad'),
  postal_code: z.string().min(4, 'Introduce el código postal'),
});

const contactSchema = z.object({
  phone: z.string().min(6, 'Introduce un teléfono válido'),
  date_of_birth: z.string().refine(val => {
    const dob = new Date(val);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    return age >= 18;
  }, 'Debes ser mayor de 18 años'),
});

const legalSchema = z.object({
  acceptBases: z.literal(true, { errorMap: () => ({ message: 'Debes aceptar las bases legales' }) }),
});

interface EnrollmentFormProps {
  userCountry?: string | null;
  onSubmit: (data: {
    street: string;
    street_number: string;
    address_city: string;
    postal_code: string;
    phone_prefix: string;
    phone: string;
    date_of_birth: string;
    accepted_legal_bases: boolean;
  }) => Promise<{ error: Error | null }>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export const EnrollmentForm = ({ userCountry, onSubmit, onCancel, isSubmitting = false }: EnrollmentFormProps) => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fields
  const [street, setStreet] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phonePrefix, setPhonePrefix] = useState(() => getPhonePrefixForCountry(userCountry));
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [acceptBases, setAcceptBases] = useState(false);

  useEffect(() => {
    setPhonePrefix(getPhonePrefixForCountry(userCountry));
  }, [userCountry]);

  const validateStep1 = () => {
    try {
      addressSchema.parse({ street, street_number: streetNumber, address_city: addressCity, postal_code: postalCode });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => { if (err.path[0]) newErrors[err.path[0] as string] = err.message; });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const validateStep2 = () => {
    try {
      contactSchema.parse({ phone, date_of_birth: dateOfBirth });
      legalSchema.parse({ acceptBases });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => { if (err.path[0]) newErrors[err.path[0] as string] = err.message; });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setErrors({});
    if (step === 2) setStep(1);
    else onCancel?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    
    await onSubmit({
      street,
      street_number: streetNumber,
      address_city: addressCity,
      postal_code: postalCode,
      phone_prefix: phonePrefix,
      phone,
      date_of_birth: dateOfBirth,
      accepted_legal_bases: true,
    });
  };

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {[1, 2].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
              step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>{s}</div>
            {s < 2 && <div className={cn("w-8 h-0.5 rounded-full", step > s ? "bg-primary" : "bg-muted")} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="addr" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                <MapPin className="w-4 h-4 text-primary" /> Dirección postal
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="street" className="text-xs flex items-center gap-1"><Home className="w-3 h-3" />Calle</Label>
                <Input id="street" value={street} onChange={e => setStreet(e.target.value)} placeholder="Nombre de la calle" className="bg-background h-9" />
                {errors.street && <p className="text-xs text-destructive">{errors.street}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="street_number" className="text-xs flex items-center gap-1"><Hash className="w-3 h-3" />Número / Piso</Label>
                  <Input id="street_number" value={streetNumber} onChange={e => setStreetNumber(e.target.value)} placeholder="Ej: 5, 2ºA" className="bg-background h-9" />
                  {errors.street_number && <p className="text-xs text-destructive">{errors.street_number}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="postal_code" className="text-xs flex items-center gap-1"><MailIcon className="w-3 h-3" />Código postal</Label>
                  <Input id="postal_code" value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="28001" className="bg-background h-9" />
                  {errors.postal_code && <p className="text-xs text-destructive">{errors.postal_code}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address_city" className="text-xs flex items-center gap-1"><Building className="w-3 h-3" />Ciudad</Label>
                <Input id="address_city" value={addressCity} onChange={e => setAddressCity(e.target.value)} placeholder="Tu ciudad" className="bg-background h-9" />
                {errors.address_city && <p className="text-xs text-destructive">{errors.address_city}</p>}
              </div>

              <div className="flex gap-2 pt-2">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={handleBack} className="gap-1">
                    <ChevronLeft className="w-4 h-4" /> Atrás
                  </Button>
                )}
                <Button type="button" onClick={handleNext} className="flex-1 gap-1">
                  Siguiente <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                <Phone className="w-4 h-4 text-primary" /> Contacto y datos personales
              </p>

              <div className="space-y-1.5">
                <Label className="text-xs">Teléfono</Label>
                <div className="flex gap-2">
                  <Select value={phonePrefix} onValueChange={setPhonePrefix}>
                    <SelectTrigger className="w-[110px] bg-background h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_PREFIXES.map(p => (
                        <SelectItem key={p.prefix} value={p.prefix} className="text-xs">
                          {p.prefix} {p.country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="600 000 000"
                    className="bg-background h-9 flex-1"
                  />
                </div>
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dob" className="text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Fecha de nacimiento
                </Label>
                <Input id="dob" type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className="bg-background h-9" />
                {errors.date_of_birth && <p className="text-xs text-destructive">{errors.date_of_birth}</p>}
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2">
                  <Checkbox checked={acceptBases} onCheckedChange={v => setAcceptBases(v === true)} id="enroll-bases" />
                  <label htmlFor="enroll-bases" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                    He leído y acepto las <a href="https://elreto-app-2026.vercel.app/bases" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Bases Legales de El Reto 2026</a>
                  </label>
                </div>
                {errors.acceptBases && <p className="text-xs text-destructive">{errors.acceptBases}</p>}
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={handleBack} className="gap-1">
                  <ChevronLeft className="w-4 h-4" /> Atrás
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 gap-1">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                  Completar inscripción
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
