import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MasterChefLogo, Manopla } from "./MasterChefLogo";
import { ChevronRight, Check } from "lucide-react";

export const RegistrationSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="registro" className="relative py-20 px-4 bg-background overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-primary/3 blur-3xl" />
        <div className="absolute top-1/4 -left-20 w-60 h-60 rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="container max-w-xl mx-auto relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <MasterChefLogo size="md" />
          <Manopla className="w-10 h-10" />
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="section-title mb-4">
            <span className="text-gradient-primary">Entra</span> al reto
          </h2>
          <p className="text-muted-foreground">
            Cuanto antes entres, más energía acumulas.
          </p>
        </div>

        {submitted ? (
          /* Success State */
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-primary glow-warm-intense mb-6">
              <Check className="w-10 h-10 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground">¡Estás dentro!</h3>
            <p className="text-muted-foreground mb-6">
              Revisa tu email para activar tu cuenta y empezar a generar energía.
            </p>
            <Button className="btn-primary px-8 py-6">
              Descargar la app
            </Button>
          </div>
        ) : (
          /* Registration Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="feature-panel p-6 md:p-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold tracking-wider mb-2 text-foreground">
                    Nombre
                  </label>
                  <Input
                    type="text"
                    placeholder="Tu nombre de chef"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-muted/50 border-border h-12 text-base placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold tracking-wider mb-2 text-foreground">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-muted/50 border-border h-12 text-base placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold tracking-wider mb-2 text-foreground">
                    Teléfono
                  </label>
                  <Input
                    type="tel"
                    placeholder="+34 600 000 000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-muted/50 border-border h-12 text-base placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit"
              className="btn-primary w-full py-6 text-lg"
            >
              Entrar al reto
              <ChevronRight className="ml-2 w-6 h-6" />
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Al registrarte, aceptas los{" "}
              <a href="#" className="text-primary hover:underline">términos y condiciones</a>
              {" "}y la{" "}
              <a href="#" className="text-primary hover:underline">política de privacidad</a>.
            </p>
          </form>
        )}
      </div>
    </section>
  );
};
