import { useLayoutEffect, useRef, useState } from 'react';
import { MobileAppLayout } from '@/components/app/MobileAppLayout';
import { AppHeader } from '@/components/app/AppHeader';
import { Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AppCalendar = () => {
  const { t } = useTranslation();
  const lineContainerRef = useRef<HTMLDivElement>(null);
  const lastOrangeDotRef = useRef<HTMLDivElement>(null);
  const [orangeHeight, setOrangeHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      if (!lineContainerRef.current || !lastOrangeDotRef.current) return;
      const containerTop = lineContainerRef.current.getBoundingClientRect().top;
      const dotRect = lastOrangeDotRef.current.getBoundingClientRect();
      setOrangeHeight(dotRect.top + dotRect.height / 2 - containerTop);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const timelineEvents = [
    { period: t('timeline.janApr'),    title: t('timeline.registrationOpen'),  description: t('timeline.registrationDesc'),    status: 'active',   unlocked: true  },
    { period: t('timeline.afterReg'),  title: t('timeline.presentationVideo'), description: t('timeline.presentationDesc'),    status: 'upcoming', unlocked: true  },
    { period: t('timeline.continuous'),title: t('timeline.activeEnergy'),      description: t('timeline.activeEnergyDesc'),    status: 'upcoming', unlocked: true  },
    { period: t('timeline.always'),    title: t('timeline.liveRanking'),       description: t('timeline.liveRankingDesc'),     status: 'upcoming', unlocked: true  },
    { period: t('timeline.top1000'),   title: t('timeline.mysteryBox'),        description: t('timeline.mysteryBoxDesc'),      status: 'locked',   unlocked: false },
    { period: t('timeline.top100'),    title: t('timeline.liveEvent'),         description: t('timeline.liveEventDesc'),       status: 'locked',   unlocked: false },
    { period: t('timeline.top5'),      title: t('timeline.mcExperience'),      description: t('timeline.mcExperienceDesc'),    status: 'locked',   unlocked: false },
  ];

  return (
    <MobileAppLayout>
      <AppHeader />

      <div className="px-4 pb-6 text-center" style={{ paddingTop: 'calc(var(--sat) + 100px)' }}>
        <h1 className="app-hero">{t('appCalendar.title')}</h1>
        <p className="app-body-sm mt-2">{t('appCalendar.subtitle')}</p>
      </div>

      <div className="px-4 py-4">
        <div className="relative" ref={lineContainerRef}>
          {/* Grey full-height base line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-zinc-700" />
          {/* Orange line up to center of last orange dot */}
          {orangeHeight !== null && (
            <div className="absolute left-5 top-0 w-0.5 bg-primary" style={{ height: orangeHeight }} />
          )}

          {timelineEvents.map((event, index) => (
            <div key={index} className="relative flex items-center gap-4 mb-4">
              <div className="relative z-10 flex-shrink-0">
                <div className="relative" ref={index === 3 ? lastOrangeDotRef : undefined}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    event.unlocked ? 'bg-primary text-primary-foreground' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {index === 0 ? (
                      <span className="text-lg font-black">1</span>
                    ) : index === 1 ? (
                      <span className="text-lg font-black">2</span>
                    ) : index === 2 || index === 3 ? (
                      <span className="text-xl font-bold">∞</span>
                    ) : (
                      <Lock className="w-4 h-4" strokeWidth={1.5} />
                    )}
                  </div>
                </div>
              </div>

              <div className={`flex-1 border rounded-2xl p-4 ${
                event.unlocked ? 'bg-card border-primary/30' : 'bg-card border-black'
              }`}>
                <span className={`app-caption mb-1 block ${event.unlocked ? 'text-primary' : ''}`}>
                  {event.period}
                </span>
                <h3 className={`text-sm font-semibold mb-1 ${event.unlocked ? 'text-primary' : 'text-white/40'}`}>{event.title}</h3>
                <p className="app-body-sm">{event.description}</p>

                {!event.unlocked && (
                  <div className="mt-2 inline-flex items-center gap-1 app-caption bg-white/5 rounded-full px-2 py-0.5">
                    <Lock className="w-2.5 h-2.5" strokeWidth={1.5} />
                    {t('timeline.byRanking')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileAppLayout>
  );
};

export default AppCalendar;
