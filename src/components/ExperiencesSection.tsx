import { FireCircle } from "./FireCircle";
import { Trophy, Package, MapPin } from "lucide-react";

const experiences = [
  {
    icon: Trophy,
    title: "MASTERCHEF EXPERIENCE",
    subtitle: "TOP 5",
    description: "Vive la experiencia completa. Cocina con los mejores. El sueño hecho realidad.",
    badge: "ÉLITE",
    highlight: true
  },
  {
    icon: Package,
    title: "CAJA MISTERIOSA",
    subtitle: "TOP 1.000",
    description: "Recibe ingredientes sorpresa en tu casa y demuestra tu talento ante miles.",
    badge: "PRIMER CORTE"
  },
  {
    icon: MapPin,
    title: "EVENTO PRESENCIAL",
    subtitle: "TOP 100",
    description: "De lo digital a lo real. Conoce a la comunidad y compite cara a cara.",
    badge: "SALTO REAL"
  }
];

export const ExperiencesSection = () => {
  return (
    <section className="relative py-20 px-4 bg-background overflow-hidden">
      <div className="container max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="badge-fire mb-4 inline-block">RECOMPENSAS</span>
          <h2 className="section-title mb-4">
            HITOS DE <span className="text-gradient-fire">ESTATUS</span>
          </h2>
          <p className="text-muted-foreground">
            Tu energía desbloquea experiencias únicas
          </p>
        </div>

        {/* Experience Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {experiences.map((exp, index) => (
            <div 
              key={index}
              className={`relative group ${exp.highlight ? "md:-mt-4 md:mb-4" : ""}`}
            >
              {exp.highlight && (
                <div className="absolute -inset-1 rounded-2xl bg-gradient-fire opacity-20 blur-lg group-hover:opacity-30 transition-opacity" />
              )}
              
              <div className={`relative h-full hud-panel rounded-2xl p-6 text-center ${
                exp.highlight ? "border-primary/50" : ""
              }`}>
                {/* Icon with Fire Effect */}
                <div className="relative inline-flex mb-6">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    exp.highlight 
                      ? "bg-gradient-fire glow-fire-intense" 
                      : "bg-primary/20 glow-fire"
                  }`}>
                    <exp.icon className="w-10 h-10 text-foreground" />
                  </div>
                  {exp.highlight && (
                    <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-ping opacity-30" />
                  )}
                </div>

                {/* Badge */}
                <span className={exp.highlight ? "badge-fire" : "badge-locked"}>
                  {exp.badge}
                </span>

                {/* Subtitle */}
                <p className="text-sm text-primary font-bold mt-4 uppercase">
                  {exp.subtitle}
                </p>

                {/* Title */}
                <h3 className="text-xl font-bold uppercase my-2">
                  {exp.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground">
                  {exp.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
