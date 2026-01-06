import { HeroSection } from "@/components/HeroSection";
import { WhatIsSection } from "@/components/WhatIsSection";
import { TimelineSection } from "@/components/TimelineSection";
import { EnergySection } from "@/components/EnergySection";
import { RankingSection } from "@/components/RankingSection";
import { ExperiencesSection } from "@/components/ExperiencesSection";
import { AppSection } from "@/components/AppSection";
import { RegistrationSection } from "@/components/RegistrationSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <WhatIsSection />
      <TimelineSection />
      <EnergySection />
      <RankingSection />
      <ExperiencesSection />
      <AppSection />
      <RegistrationSection />
      <Footer />
    </main>
  );
};

export default Index;
