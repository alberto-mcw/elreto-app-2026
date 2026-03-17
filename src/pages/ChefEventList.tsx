import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ChefHat, Clock, Flame, CalendarDays } from 'lucide-react';
import { format, isPast, isFuture } from 'date-fns';
import { es } from 'date-fns/locale';

const ChefEventList = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('chef_events')
        .select('*')
        .in('status', ['published', 'live', 'finished'])
        .order('scheduled_at', { ascending: false });
      setEvents(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const liveEvents = events.filter(e => e.status === 'live');
  const upcomingEvents = events.filter(e => e.status === 'published' && isFuture(new Date(e.scheduled_at)));
  const pastEvents = events.filter(e => e.status === 'finished' || (e.status === 'published' && isPast(new Date(e.scheduled_at))));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-12 container mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-unbounded text-3xl md:text-4xl font-bold mb-2">
            Sigue al <span className="text-gradient-fire">Chef</span>
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Cocina en directo con chefs profesionales. Sigue los pasos, sube tus fotos y consigue puntos.
          </p>
        </div>

        {events.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <ChefHat className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="font-unbounded text-lg font-bold mb-2">Próximamente</h3>
              <p className="text-muted-foreground">Aún no hay eventos programados. ¡Vuelve pronto!</p>
            </CardContent>
          </Card>
        )}

        {/* Live now */}
        {liveEvents.length > 0 && (
          <section className="mb-8">
            <h2 className="font-unbounded text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" /> En directo ahora
            </h2>
            <div className="grid gap-4">
              {liveEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {upcomingEvents.length > 0 && (
          <section className="mb-8">
            <h2 className="font-unbounded text-xl font-bold mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" /> Próximos eventos
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* Past */}
        {pastEvents.length > 0 && (
          <section>
            <h2 className="font-unbounded text-xl font-bold mb-4">Eventos anteriores</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

const EventCard = ({ event }: { event: any }) => {
  const isLive = event.status === 'live';
  const isFinished = event.status === 'finished';
  
  return (
    <Link to={`/sigue-al-chef/${event.id}`}>
      <Card className={`overflow-hidden hover:border-primary/30 transition-colors group ${isLive ? 'border-red-500/30 ring-1 ring-red-500/20' : ''}`}>
        {event.cover_image_url && (
          <div className="h-40 overflow-hidden">
            <img src={event.cover_image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        )}
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            {isLive && <Badge className="bg-red-500 text-white border-0 text-xs">🔴 LIVE</Badge>}
            {isFinished && <Badge variant="outline" className="text-xs">Finalizado</Badge>}
          </div>
          <h3 className="font-unbounded font-bold">{event.title}</h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><ChefHat className="w-3 h-3" /> {event.chef_name}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.duration_minutes} min</span>
            <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-primary" /> +{event.energy_reward}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {format(new Date(event.scheduled_at), "d MMM yyyy · HH:mm'h'", { locale: es })}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ChefEventList;
