import { useEffect, useRef, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionTitleProps {
  topLabel?: string;
  title: string;
  subtitle?: string;
  className?: string;
  children?: ReactNode;
}

export const SectionTitle = ({ topLabel, title, subtitle, className, children }: SectionTitleProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setProgress(1 - entry.intersectionRatio);
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn('px-4 pt-4 pb-3', className)}>
      <div
        style={{
          opacity: 1 - progress,
          transform: `translateY(${-progress * 16}px)`,
          transition: 'opacity 0.1s ease-out, transform 0.1s ease-out',
        }}
      >
        {topLabel && (
          <span className="block text-[2rem] font-normal leading-none text-foreground" style={{ letterSpacing: '-0.5px' }}>
            {topLabel}
          </span>
        )}
        <span className="app-title block">
          {title}
        </span>
        {subtitle && (
          <p className="mt-2 app-body">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  );
};
