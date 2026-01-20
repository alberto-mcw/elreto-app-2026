import { MapPin } from "lucide-react";

const events = [
  {
    city: "Madrid",
    region: "madrid",
    x: 195,
    y: 215,
    events: [
      { name: "Fase 0", date: "Mayo" },
      { name: "Gran Final", date: "Diciembre" },
    ],
  },
  {
    city: "Valencia",
    region: "valencia",
    x: 332,
    y: 280,
    events: [{ name: "Bloque 01", date: "Junio" }],
  },
  {
    city: "Sevilla",
    region: "andalucia",
    x: 115,
    y: 320,
    events: [
      { name: "Bloque 02", date: "Septiembre" },
      { name: "Semifinales", date: "Diciembre" },
    ],
  },
  {
    city: "Santander",
    region: "cantabria",
    x: 182,
    y: 62,
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
        {/* SVG Map of Spain - realistic peninsula based on political map */}
        <svg
          viewBox="0 0 400 380"
          className="w-full h-auto"
          style={{ filter: "drop-shadow(0 4px 20px rgba(249, 115, 22, 0.2))" }}
        >
          {/* Background glow */}
          <defs>
            <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
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

          {/* Realistic Spain map - peninsula only, based on reference */}
          <g className="spain-regions" fill="url(#mapGradient)" stroke="hsl(var(--primary))" strokeWidth="1">
            {/* Galicia */}
            <path d="M28,82 L32,72 L38,62 L48,52 L62,48 L72,52 L78,62 L82,72 L78,82 L72,92 L65,102 L58,112 L48,118 L38,115 L30,108 L25,98 L26,88 Z" className="hover:fill-primary/40 transition-colors" />
            
            {/* Asturias */}
            <path d="M78,62 L92,52 L108,48 L125,45 L142,48 L155,55 L152,68 L140,75 L122,78 L102,78 L85,75 L78,82 L72,72 Z" className="hover:fill-primary/40 transition-colors" />
            
            {/* Cantabria */}
            <path d="M155,55 L175,50 L195,52 L210,58 L208,72 L195,78 L175,75 L158,72 L152,68 Z" className="hover:fill-primary/40 transition-colors" />
            
            {/* País Vasco */}
            <path d="M210,58 L228,52 L248,48 L262,55 L260,70 L248,78 L230,78 L215,75 L208,72 Z" className="hover:fill-primary/40 transition-colors" />
            
            {/* Navarra */}
            <path d="M262,55 L280,50 L298,55 L308,68 L302,85 L288,95 L270,92 L255,85 L260,70 Z" className="hover:fill-primary/40 transition-colors" />
            
            {/* La Rioja */}
            <path d="M215,85 L230,78 L248,78 L260,70 L255,85 L248,98 L235,105 L218,102 L212,92 Z" className="hover:fill-primary/40 transition-colors" />
            
            {/* Aragón */}
            <path d="M270,92 L288,95 L302,85 L320,78 L338,82 L352,95 L358,120 L355,155 L345,190 L328,215 L305,225 L280,218 L265,195 L260,160 L262,125 L265,105 L270,92 Z" className="hover:fill-primary/40 transition-colors" />
            
            {/* Cataluña */}
            <path d="M320,78 L342,68 L365,58 L382,65 L392,82 L388,108 L378,138 L362,165 L345,190 L355,155 L358,120 L352,95 L338,82 Z" className="hover:fill-primary/40 transition-colors" />
            
            {/* Castilla y León */}
            <path d="M72,92 L78,82 L85,75 L102,78 L122,78 L140,75 L152,68 L158,72 L175,75 L195,78 L208,72 L215,75 L230,78 L248,98 L265,105 L262,125 L260,160 L255,175 L238,185 L218,188 L195,185 L168,180 L142,172 L118,162 L98,150 L82,135 L72,118 L65,102 Z" className="hover:fill-primary/40 transition-colors" />
            
            {/* Madrid */}
            <path d="M175,188 L195,185 L218,188 L228,205 L225,225 L210,240 L188,242 L172,230 L168,212 L172,195 Z" className="hover:fill-primary/40 transition-colors cursor-pointer" />
            
            {/* Castilla-La Mancha */}
            <path d="M118,215 L142,205 L168,212 L172,230 L188,242 L210,240 L225,225 L228,205 L238,185 L255,175 L260,160 L265,195 L280,218 L305,225 L318,248 L315,278 L298,308 L268,325 L235,330 L198,322 L165,308 L138,285 L122,255 L115,228 Z" className="hover:fill-primary/40 transition-colors" />
            
            {/* Comunidad Valenciana */}
            <path d="M305,225 L328,215 L345,232 L358,258 L365,292 L358,322 L342,348 L318,340 L298,318 L298,308 L315,278 L318,248 Z" className="hover:fill-primary/40 transition-colors cursor-pointer" />
            
            {/* Murcia */}
            <path d="M268,325 L298,318 L318,340 L315,362 L295,375 L265,370 L248,352 L252,335 Z" className="hover:fill-primary/40 transition-colors" />
            
            {/* Extremadura */}
            <path d="M48,195 L68,178 L95,168 L118,168 L135,178 L148,195 L142,205 L118,215 L115,228 L108,250 L92,268 L68,275 L48,265 L35,245 L32,218 L38,200 Z" className="hover:fill-primary/40 transition-colors" />
            
            {/* Andalucía */}
            <path d="M35,245 L48,265 L68,275 L92,268 L108,250 L122,255 L138,285 L165,308 L198,322 L235,330 L268,325 L252,335 L248,352 L232,368 L205,378 L168,378 L128,372 L92,358 L62,338 L38,312 L25,282 L28,258 Z" className="hover:fill-primary/40 transition-colors cursor-pointer" />
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
            // Calculate percentage positions based on viewBox (400x380)
            const leftPercent = (event.x / 400) * 100;
            const topPercent = (event.y / 380) * 100;
            
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
