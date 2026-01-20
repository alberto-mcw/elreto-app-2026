import { MapPin } from "lucide-react";

const events = [
  {
    city: "Madrid",
    region: "madrid",
    x: 245,
    y: 255,
    events: [
      { name: "Fase 0", date: "Mayo" },
      { name: "Gran Final", date: "Diciembre" },
    ],
  },
  {
    city: "Valencia",
    region: "valencia",
    x: 430,
    y: 340,
    events: [{ name: "Bloque 01", date: "Junio" }],
  },
  {
    city: "Sevilla",
    region: "andalucia",
    x: 145,
    y: 400,
    events: [
      { name: "Bloque 02", date: "Septiembre" },
      { name: "Semifinales", date: "Diciembre" },
    ],
  },
  {
    city: "Santander",
    region: "cantabria",
    x: 220,
    y: 75,
    events: [{ name: "Bloque 03", date: "Noviembre" }],
  },
];

export const SpainEventsMap = () => {
  return (
    <div className="mb-12">
      <h2 className="font-unbounded text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
        <MapPin className="w-6 h-6 text-primary" />
        Eventos Presenciales
      </h2>

      <div className="relative max-w-3xl mx-auto">
        {/* SVG Map of Spain with autonomous communities - realistic geography */}
        <svg
          viewBox="0 0 550 480"
          className="w-full h-auto"
          style={{ filter: "drop-shadow(0 4px 20px rgba(249, 115, 22, 0.2))" }}
        >
          {/* Background glow */}
          <defs>
            <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.08" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Realistic Spain map with autonomous communities */}
          <g className="spain-regions" fill="url(#mapGradient)" stroke="hsl(var(--primary))" strokeWidth="1.5">
            {/* Galicia */}
            <path d="M20,95 L35,75 L55,65 L75,70 L95,60 L105,75 L100,95 L95,115 L85,135 L70,150 L55,160 L40,155 L25,140 L15,120 Z" className="hover:fill-primary/40 transition-colors" />
            
            {/* Asturias */}
            <path d="M95,60 L120,50 L145,45 L170,50 L185,60 L180,80 L165,90 L140,95 L115,90 L100,95 L105,75 Z" className="hover:fill-primary/40 transition-colors" />
            
            {/* Cantabria */}
            <path d="M185,60 L210,55 L235,60 L250,70 L245,85 L225,95 L200,90 L180,80 Z" className="hover:fill-primary/40 transition-colors" />
            
            {/* País Vasco */}
            <path d="M250,70 L275,60 L300,55 L315,65 L310,85 L290,95 L265,90 L245,85 Z" className="hover:fill-primary/40 transition-colors" />
            
            {/* Navarra */}
            <path d="M315,65 L340,60 L365,70 L375,90 L365,115 L340,120 L315,110 L310,85 Z" className="hover:fill-primary/40 transition-colors" />
            
            {/* La Rioja */}
            <path d="M265,95 L290,95 L310,85 L315,110 L300,125 L275,130 L255,120 L255,105 Z" className="hover:fill-primary/40 transition-colors" />
            
            {/* Aragón */}
            <path d="M340,120 L365,115 L375,90 L400,85 L430,95 L450,120 L455,160 L445,210 L420,250 L385,260 L350,245 L335,210 L330,170 L335,140 Z" className="hover:fill-primary/40 transition-colors" />
            
            {/* Cataluña */}
            <path d="M400,85 L430,70 L465,60 L500,70 L520,95 L525,130 L515,170 L490,195 L455,210 L445,210 L455,160 L450,120 L430,95 Z" className="hover:fill-primary/40 transition-colors" />
            
            {/* Castilla y León */}
            <path d="M95,115 L100,95 L115,90 L140,95 L165,90 L180,80 L200,90 L225,95 L245,85 L265,90 L255,105 L255,120 L275,130 L300,125 L315,110 L340,120 L335,140 L330,170 L315,195 L285,210 L255,215 L220,210 L185,200 L150,190 L120,175 L100,155 L85,135 Z" className="hover:fill-primary/40 transition-colors" />
            
            {/* Madrid */}
            <path d="M220,210 L255,215 L275,230 L280,260 L265,285 L235,290 L210,275 L205,245 L210,220 Z" className="hover:fill-primary/40 transition-colors cursor-pointer" />
            
            {/* Castilla-La Mancha */}
            <path d="M150,250 L185,240 L205,245 L210,275 L235,290 L265,285 L280,260 L275,230 L285,210 L315,195 L330,170 L335,210 L350,245 L385,260 L400,290 L395,330 L375,365 L340,380 L295,385 L255,375 L220,360 L190,340 L165,310 L150,280 Z" className="hover:fill-primary/40 transition-colors" />
            
            {/* Comunidad Valenciana */}
            <path d="M385,260 L420,250 L445,270 L465,300 L475,340 L470,380 L450,410 L420,395 L395,365 L375,365 L395,330 L400,290 Z" className="hover:fill-primary/40 transition-colors cursor-pointer" />
            
            {/* Murcia */}
            <path d="M340,380 L375,365 L395,365 L420,395 L415,425 L390,445 L355,440 L330,420 L325,395 Z" className="hover:fill-primary/40 transition-colors" />
            
            {/* Extremadura */}
            <path d="M55,230 L85,210 L120,200 L150,200 L170,215 L185,240 L150,250 L150,280 L140,310 L120,330 L90,340 L60,330 L40,300 L45,265 Z" className="hover:fill-primary/40 transition-colors" />
            
            {/* Andalucía */}
            <path d="M40,300 L60,330 L90,340 L120,330 L140,310 L150,280 L165,310 L190,340 L220,360 L255,375 L295,385 L340,380 L325,395 L330,420 L310,445 L275,460 L230,465 L180,455 L130,440 L85,420 L55,390 L35,360 L30,330 Z" className="hover:fill-primary/40 transition-colors cursor-pointer" />
          </g>

          {/* Event markers */}
          {events.map((event) => (
            <g key={event.city} className="event-marker">
              {/* Pulsing circle */}
              <circle
                cx={event.x}
                cy={event.y}
                r="12"
                fill="hsl(var(--primary))"
                className="animate-pulse"
                opacity="0.4"
              />
              {/* Main marker */}
              <circle
                cx={event.x}
                cy={event.y}
                r="8"
                fill="hsl(var(--primary))"
                stroke="hsl(var(--background))"
                strokeWidth="2"
                filter="url(#glow)"
              />
            </g>
          ))}
        </svg>

        {/* Event labels positioned absolutely */}
        <div className="absolute inset-0 pointer-events-none">
          {events.map((event) => {
            // Calculate percentage positions based on viewBox (550x480)
            const leftPercent = (event.x / 550) * 100;
            const topPercent = (event.y / 480) * 100;
            
            return (
              <div
                key={event.city}
                className="absolute pointer-events-auto"
                style={{
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  transform: event.city === "Santander" ? "translate(-50%, -120%)" : 
                             event.city === "Valencia" ? "translate(10%, -50%)" :
                             event.city === "Sevilla" ? "translate(-110%, -50%)" :
                             "translate(-50%, 20%)",
                }}
              >
                <div className="bg-card/95 backdrop-blur-sm border border-primary/30 rounded-lg p-2 shadow-lg min-w-[120px]">
                  <div className="text-xs font-bold text-primary mb-1">{event.city}</div>
                  {event.events.map((e, i) => (
                    <div key={i} className="text-[10px] text-muted-foreground leading-tight">
                      <span className="text-foreground font-medium">{e.name}</span>
                      <span className="text-muted-foreground"> • {e.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center mt-6 gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          <span>Sede del evento</span>
        </div>
      </div>
    </div>
  );
};
