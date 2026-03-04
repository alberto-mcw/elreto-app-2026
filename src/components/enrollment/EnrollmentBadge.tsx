import { CheckCircle2 } from 'lucide-react';

export const EnrollmentBadge = () => (
  <div className="flex items-center gap-2 px-4 py-3 bg-primary/10 border border-primary/20 rounded-xl">
    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
    <span className="text-sm font-medium text-primary">
      Estás inscrito en "El Reto" 2026
    </span>
  </div>
);
