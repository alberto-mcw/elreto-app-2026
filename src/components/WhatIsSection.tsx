import { Zap, TrendingUp, Battery } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "TODO SUMA",
    description: "Cada acción cuenta. Cada reto completado. Cada interacción."
  },
  {
    icon: TrendingUp,
    title: "NO EMPIEZAS DE CERO",
    description: "Tu progreso se acumula. Entra antes y empieza con ventaja."
  },
  {
    icon: Battery,
    title: "LA ENERGÍA SE CONSERVA",
    description: "Lo que construyes hoy te impulsa mañana. Sin resets."
  }
];

export const WhatIsSection = () => {
  return (
    <section className="relative py-20 px-4 bg-background">
      <div className="container max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="badge-fire mb-4 inline-block">EL RETO</span>
          <h2 className="section-title mb-4">
            ¿QUÉ ES <span className="text-gradient-fire">EL RETO</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No es un casting puntual.{" "}
            <span className="text-foreground font-semibold">
              Es un recorrido progresivo.
            </span>
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="hud-panel rounded-2xl p-8 text-center transition-transform hover:-translate-y-1"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6 glow-fire">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold uppercase mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
