import { FireCircle } from "./FireCircle";
import { Lock, Unlock, Trophy, Star, Users } from "lucide-react";

const timelineItems = [
  {
    period: "ENERO – ABRIL",
    title: "REGISTRO ABIERTO",
    description: "Inscríbete y prepara tu cocina",
    status: "active",
    icon: Unlock,
    badge: "DISPONIBLE"
  },
  {
    period: "VÍDEO INICIAL",
    title: "ACTIVA LA MANOPLA",
    description: "Presenta tu estilo culinario",
    status: "upcoming",
    icon: Star,
    badge: "DESBLOQUEABLE"
  },
  {
    period: "ENERGÍA ACTIVA",
    title: "EL JUEGO EMPIEZA",
    description: "Comienza a generar puntos",
    status: "upcoming",
    icon: Lock,
    badge: "RANKING"
  },
  {
    period: "CONTINUO",
    title: "RANKING EN TIEMPO REAL",
    description: "Compite cada día por posiciones",
    status: "upcoming",
    icon: Trophy,
    badge: "SIEMPRE ACTIVO"
  },
  {
    period: "TOP 1.000",
    title: "CAJA MISTERIOSA",
    description: "Ingredientes sorpresa en casa",
    status: "locked",
    icon: Lock,
    badge: "SOLO RANKING"
  },
  {
    period: "TOP 100",
    title: "EVENTO PRESENCIAL",
    description: "De lo digital a lo real",
    status: "locked",
    icon: Users,
    badge: "ESTATUS"
  },
  {
    period: "TOP 5",
    title: "MASTERCHEF EXPERIENCE",
    description: "El sueño hecho realidad",
    status: "locked",
    icon: Trophy,
    badge: "ÉLITE"
  }
];

export const TimelineSection = () => {
  return (
    <section className="relative py-20 px-4 bg-gradient-dark overflow-hidden">
      {/* Background fire circle */}
      <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      
      <div className="container max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="badge-fire mb-4 inline-block">EL CAMINO</span>
          <h2 className="section-title mb-4">
            TU <span className="text-gradient-fire">RECORRIDO</span> 2026
          </h2>
          <p className="text-muted-foreground">
            Cada paso te acerca al siguiente nivel
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/50 to-primary/10" />

          <div className="space-y-8">
            {timelineItems.map((item, index) => (
              <div 
                key={index}
                className={`relative flex items-start gap-6 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Fire Circle Marker */}
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10">
                  <div className={`relative ${item.status === "active" ? "animate-pulse-fire" : ""}`}>
                    <div 
                      className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        item.status === "active" 
                          ? "bg-primary glow-fire-intense"
                          : item.status === "upcoming"
                          ? "bg-primary/30 border border-primary/50"
                          : "bg-secondary border border-border"
                      }`}
                    >
                      <item.icon className={`w-6 h-6 ${
                        item.status === "active" ? "text-foreground" : "text-muted-foreground"
                      }`} />
                    </div>
                    {item.status === "active" && (
                      <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-30" />
                    )}
                  </div>
                </div>

                {/* Content Card */}
                <div className={`ml-24 md:ml-0 md:w-[calc(50%-4rem)] ${
                  index % 2 === 0 ? "md:pr-8 md:text-right" : "md:pl-8"
                }`}>
                  <div className={`hud-panel rounded-xl p-5 ${
                    item.status === "active" ? "border-primary/50" : ""
                  }`}>
                    <div className={`flex items-center gap-2 mb-2 ${
                      index % 2 === 0 ? "md:justify-end" : ""
                    }`}>
                      <span className={`${
                        item.status === "active" ? "badge-fire" : "badge-locked"
                      }`}>
                        {item.badge}
                      </span>
                    </div>
                    <span className="text-xs text-primary font-bold uppercase tracking-wider">
                      {item.period}
                    </span>
                    <h3 className="text-lg font-bold uppercase mt-1 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
