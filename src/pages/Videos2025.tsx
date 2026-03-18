import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { Star, Calendar, Users, MapPin, ChefHat } from "lucide-react";

const featuredVideos = [
  { id: "cTefyqAcbps", isShort: true },
  { id: "dWTW1yBCqjQ", isShort: true },
  { id: "HQyjT_wmOAg", isShort: true },
  { id: "MeUpJT1o7Xs", isShort: true },
  { id: "KPgBxMTfATA", isShort: true },
  { id: "xUlVN8yRQ6M", isShort: true },
];

const Videos2025 = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-400 mb-4">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">{t('videos2025.season')}</span>
            </div>
            <h1 className="font-unbounded text-4xl md:text-5xl font-bold mb-4">
              {t('videos2025.title')} <span className="text-amber-400">{t('videos2025.titleHighlight')}</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('videos2025.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-12 max-w-xl mx-auto">
            <div className="text-center p-4 rounded-xl bg-card border border-border">
              <Users className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="text-2xl font-bold text-primary">+7000</div>
              <div className="text-xs text-muted-foreground">{t('videos2025.participants')}</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-card border border-border">
              <MapPin className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="text-2xl font-bold text-primary">5</div>
              <div className="text-xs text-muted-foreground">{t('videos2025.liveEvents')}</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-card border border-border">
              <ChefHat className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="text-2xl font-bold text-primary">∞</div>
              <div className="text-xs text-muted-foreground">{t('videos2025.recipes')}</div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="font-unbounded text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
              <Star className="w-6 h-6 text-amber-400" />
              {t('videos2025.highlights')}
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVideos.map((video, index) => (
                <div 
                  key={video.id}
                  className="relative group rounded-2xl overflow-hidden bg-card border border-border hover:border-amber-500/50 transition-all"
                >
                  <div className={`${video.isShort ? 'aspect-[9/16]' : 'aspect-video'} bg-muted`}>
                    <iframe
                      src={`https://www.youtube.com/embed/${video.id}`}
                      title={`${t('videos2025.highlights')} ${index + 1}`}
                      className="w-full h-full"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
            <Star className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="font-unbounded text-xl font-bold mb-2">
              {t('videos2025.thankYou')}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t('videos2025.thankYouDesc')}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Videos2025;
