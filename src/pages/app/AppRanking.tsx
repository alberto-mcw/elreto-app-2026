import { useState } from 'react';
import { MobileAppLayout } from '@/components/app/MobileAppLayout';
import { SecondaryHeader } from '@/components/app/SecondaryHeader';
import { Trophy, TrendingUp, Zap, MapPin, Instagram, Target, Video, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useRanking, formatEnergy, formatTotalEnergy, countryFlag, countryName, type RankedItem, type ProfileStats } from '@/hooks/useRanking';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const AppRanking = () => {
  const {
    profiles, loading, stats, currentPage, totalPages, totalCount,
    searchQuery, myPosition, highlightUserId, user,
    handleSearch, goToPage, jumpToMyPosition, setRowRef,
  } = useRanking();

  const [selectedProfile, setSelectedProfile] = useState<RankedItem | null>(null);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const handleSelectProfile = async (profile: RankedItem) => {
    setSelectedProfile(profile);
    setLoadingStats(true);
    try {
      const [{ data: triviaCompletions }, { data: submissions }] = await Promise.all([
        supabase.from('trivia_completions').select('is_correct').eq('user_id', profile.userId),
        supabase.from('challenge_submissions').select('id').eq('user_id', profile.userId).eq('status', 'approved'),
      ]);
      const triviaTotal = triviaCompletions?.length || 0;
      const triviaCorrect = triviaCompletions?.filter(t => t.is_correct).length || 0;
      setProfileStats({ triviaCorrect, triviaTotal, challengesCompleted: submissions?.length || 0 });
    } catch { setProfileStats(null); }
    finally { setLoadingStats(false); }
  };

  return (
    <MobileAppLayout showNav={false}>
      <SecondaryHeader />

      <div className="px-4 py-4 space-y-4">
        {/* Page title */}
        <h1 className="app-section-title">Ranking</h1>

        {/* My Rank Card */}
        {user && myPosition && (
          <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-3">
            <div>
              <p className="app-caption">Tu posición</p>
              <p className="text-xl font-black text-primary">
                #{myPosition.rank}
                <span className="text-xs font-normal text-muted-foreground ml-2 inline-flex items-center gap-1">{formatEnergy(myPosition.energy)} <Zap className="w-3 h-3 text-primary" strokeWidth={2.5} /></span>
              </p>
            </div>
            <button onClick={jumpToMyPosition} className="btn-sm">
              Ver en lista
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-2xl p-3 text-center">
            <Trophy className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{formatTotalEnergy(stats.topEnergy)}</p>
            <p className="app-caption">Top</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-3 text-center">
            <Zap className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{formatTotalEnergy(stats.totalEnergy)}</p>
            <p className="app-caption">Total</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-3 text-center">
            <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.totalParticipants}</p>
            <p className="app-caption">Usuarios</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            placeholder="Buscar chef..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-10 bg-card border border-border rounded-xl pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Ranking List */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground text-sm">Cargando ranking...</div>
          ) : profiles.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              {searchQuery ? 'Sin resultados' : 'No hay participantes aún'}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {profiles.map((profile) => {
                const pos = profile.rankIndex;
                const isMe = user && profile.userId === user.id;
                const isHighlighted = profile.userId === highlightUserId;
                return (
                  <div 
                    key={profile.id}
                    ref={(el) => setRowRef(profile.userId, el)}
                    onClick={() => handleSelectProfile(profile)}
                    className={`flex items-center gap-3 p-3 transition-all duration-500 active:bg-card/80 ${
                      isHighlighted ? "border-l-4 border-l-primary bg-primary/5 animate-pulse" :
                      isMe ? "border-l-4 border-l-primary bg-primary/5" : ""
                    }`}
                  >
                    <div className="relative w-8 flex-shrink-0">
                      <span className={`relative z-10 text-lg font-black block text-center ${
                        pos <= 3 ? "text-primary" : "text-muted-foreground"
                      }`}>
                        {pos}
                      </span>
                    </div>
                    
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                      {profile.avatarUrl?.startsWith('http') ? (
                        <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        profile.avatarUrl || '👨‍🍳'
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-foreground">
                        {profile.alias || 'Chef Anónimo'}
                        {isMe && <span className="ml-1 text-[10px] text-primary font-bold">(Tú)</span>}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {countryFlag(profile.country)} {profile.level}
                      </p>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-primary">{formatEnergy(profile.energy)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl" disabled={currentPage <= 1} onClick={() => goToPage(currentPage - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground px-2">{currentPage} / {totalPages}</span>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl" disabled={currentPage >= totalPages} onClick={() => goToPage(currentPage + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Profile Dialog */}
      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="max-w-[90vw] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Perfil del usuario</DialogTitle>
          </DialogHeader>
          
          {selectedProfile && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-3xl mx-auto mb-3 overflow-hidden">
                {selectedProfile.avatarUrl?.startsWith('http') ? (
                  <img src={selectedProfile.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  selectedProfile.avatarUrl || '👨‍🍳'
                )}
              </div>
              <h3 className="app-heading mb-1">{selectedProfile.alias || 'Chef Anónimo'}</h3>
              <p className="text-primary text-sm font-bold mb-1">Nivel {selectedProfile.level}</p>
              {selectedProfile.country && (
                <p className="text-xs text-muted-foreground mb-2">{countryFlag(selectedProfile.country)} {countryName(selectedProfile.country)}</p>
              )}
              <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-3 py-1.5 mb-4">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary">{formatEnergy(selectedProfile.energy)} puntos</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-secondary/50 rounded-xl p-2">
                  <Target className="w-4 h-4 text-primary mx-auto mb-1" />
                  {loadingStats ? <p className="text-xs text-muted-foreground">...</p> : profileStats ? (
                    <>
                      <p className="font-bold">{profileStats.triviaTotal > 0 ? Math.round((profileStats.triviaCorrect / profileStats.triviaTotal) * 100) : 0}%</p>
                      <p className="app-caption">Mini Retos</p>
                    </>
                  ) : null}
                </div>
                <div className="bg-secondary/50 rounded-xl p-2">
                  <Video className="w-4 h-4 text-primary mx-auto mb-1" />
                  {loadingStats ? <p className="text-xs text-muted-foreground">...</p> : profileStats ? (
                    <>
                      <p className="font-bold">{profileStats.challengesCompleted}</p>
                      <p className="app-caption">Desafíos</p>
                    </>
                  ) : null}
                </div>
              </div>
              
              {selectedProfile.city && (
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-3">
                  <MapPin className="w-3 h-3" />
                  <span className="text-xs">{selectedProfile.city}</span>
                </div>
              )}
              
              {(selectedProfile.instagramHandle || selectedProfile.tiktokHandle) && (
                <div className="flex items-center justify-center gap-3 pt-3 border-t border-border">
                  {selectedProfile.instagramHandle && (
                    <a href={`https://instagram.com/${selectedProfile.instagramHandle}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                      <Instagram className="w-3 h-3" />@{selectedProfile.instagramHandle}
                    </a>
                  )}
                  {selectedProfile.tiktokHandle && (
                    <a href={`https://tiktok.com/@${selectedProfile.tiktokHandle}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                      @{selectedProfile.tiktokHandle}
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MobileAppLayout>
  );
};

export default AppRanking;
