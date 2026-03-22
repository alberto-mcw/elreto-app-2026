import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const topPlayers = [
  { pos: 1, name: "ChefMaster_Pro", energy: "24,580", change: "+320" },
  { pos: 2, name: "CocinaFusion", energy: "22,340", change: "+180" },
  { pos: 3, name: "SaborIntens0", energy: "21,890", change: "-45" },
  { pos: 4, name: "RecetasXtrema", energy: "19,450", change: "+520" },
  { pos: 5, name: "ElCocinillas", energy: "18,920", change: "+95" },
];

export const RankingSection = () => {
  return (
    <section className="relative py-20 px-4 bg-card overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/3 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="container max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="badge-primary mb-4 inline-block">Competición</span>
          <h2 className="section-title mb-4">
            El <span className="text-gradient-primary">ranking</span> nunca duerme
          </h2>
          <p className="text-muted-foreground">
            Actualizado en tiempo real · 24/7
          </p>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-bold tracking-wider text-foreground">En vivo</span>
        </div>

        {/* Ranking Table */}
        <div className="card overflow-hidden mb-8 p-0">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-muted-foreground">Top global</span>
            <span className="text-xs text-muted-foreground">Última actualización: hace 2 min</span>
          </div>
          
          <div className="divide-y divide-border">
            {topPlayers.map((player, index) => (
              <div 
                key={index}
                className={`flex items-center gap-4 p-4 transition-colors hover:bg-primary/5 ${
                  index === 0 ? "bg-primary/5" : ""
                }`}
              >
                {/* Position */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${
                  index === 0 
                    ? "bg-gradient-primary text-primary-foreground glow-warm" 
                    : index < 3
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {player.pos}
                </div>

                {/* Name */}
                <div className="flex-1">
                  <span className="font-bold text-foreground">{player.name}</span>
                </div>

                {/* Change */}
                <span className={`text-sm font-bold ${
                  player.change.startsWith("+") ? "text-green-600" : "text-red-500"
                }`}>
                  {player.change}
                </span>

                {/* Energy */}
                <span className="ranking-number text-xl font-black w-24 text-right">
                  {player.energy}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild className="btn-primary px-8 py-6 text-base">
            <Link to="/ranking">
              Ver ranking en la app
              <ExternalLink className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
