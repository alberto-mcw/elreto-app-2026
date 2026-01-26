import { MasterChefLogo, Manopla } from "./MasterChefLogo";
import { Button } from "./ui/button";
import { Download, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-gradient-soft px-4 py-20">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -right-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-40 -left-20 w-80 h-80 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-primary/5" />
      </div>

      <div className="container relative z-10 max-w-6xl mx-auto">
        {/* Logo and Badge */}
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <MasterChefLogo size="lg" />
            <Manopla className="w-14 h-14 animate-float" />
          </div>
          <span className="badge-primary">
            Temporada 2 · 2026
          </span>
        </div>

        {/* Main Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 animate-slide-up text-foreground">
            <span className="text-gradient-primary">Compite.</span>{" "}
            <span>Crea.</span>{" "}
            <span className="text-gradient-primary">Gana energía.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto animate-slide-up stagger-1">
            El mayor reto culinario digital vuelve en 2026
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-3">
          <Button 
            asChild
            size="lg" 
            className="btn-primary w-full sm:w-auto text-base px-8 py-6"
          >
            <Link to="/auth">
              Apúntate al reto 2026
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button 
            asChild
            variant="outline"
            size="lg" 
            className="btn-outline w-full sm:w-auto text-base px-8 py-6"
          >
            <Link to="/descarga">
              <Download className="mr-2 w-5 h-5" />
              Descargar la app
            </Link>
          </Button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in stagger-5">
          <span className="text-xs text-muted-foreground tracking-widest">Descubre más</span>
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center p-2">
            <div className="w-1 h-2 bg-primary rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
};
