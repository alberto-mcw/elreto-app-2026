import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";

const topPlayers = [
  { pos: 1, name: "ChefMaster_Pro", energy: "24,580", change: "+320" },
  { pos: 2, name: "CocinaFusion", energy: "22,340", change: "+180" },
  { pos: 3, name: "SaborIntens0", energy: "21,890", change: "-45" },
  { pos: 4, name: "RecetasXtrema", energy: "19,450", change: "+520" },
  { pos: 5, name: "ElCocinillas", energy: "18,920", change: "+95" },
];

export const RankingSection = () => {
  return (
    <section className="relative py-20 px-4 bg-gradient-dark overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="badge-fire mb-4 inline-block">COMPETICIÓN</span>
          <h2 className="section-title mb-4">
            EL <span className="text-gradient-fire">RANKING</span> NUNCA DUERME
          </h2>
          <p className="text-muted-foreground">
            Actualizado en tiempo real · 24/7
          </p>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-bold uppercase tracking-wider">En Vivo</span>
        </div>

        {/* Ranking Table */}
        <div className="hud-panel rounded-2xl overflow-hidden mb-8">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Top Global</span>
            <span className="text-xs text-muted-foreground">Última actualización: hace 2 min</span>
          </div>
          
          <div className="divide-y divide-border">
            {topPlayers.map((player, index) => (
              <div 
                key={index}
                className={`flex items-center gap-4 p-4 transition-colors hover:bg-primary/5 ${
                  index === 0 ? "bg-primary/10" : ""
                }`}
              >
                {/* Position */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${
                  index === 0 
                    ? "bg-gradient-fire text-foreground glow-fire" 
                    : index < 3
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-muted-foreground"
                }`}>
                  {player.pos}
                </div>

                {/* Name */}
                <div className="flex-1">
                  <span className="font-bold">{player.name}</span>
                </div>

                {/* Change */}
                <span className={`text-sm font-bold ${
                  player.change.startsWith("+") ? "text-green-400" : "text-red-400"
                }`}>
                  {player.change}
                </span>

                {/* Energy */}
                <span className="ranking-number text-xl font-black text-primary w-24 text-right">
                  {player.energy}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button className="btn-fire px-8 py-6 text-base rounded-xl">
            VER RANKING EN LA APP
            <ExternalLink className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};
