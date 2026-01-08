import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Loader2, 
  Trophy, 
  User,
  Calendar,
  ArrowRight,
  Heart,
  Zap
} from 'lucide-react';

interface Submission {
  id: string;
  video_url: string;
  description: string | null;
  created_at: string;
  challenge_id: string;
  user_id: string;
  likes_count: number;
  challenges: {
    title: string;
    ends_at: string;
  } | null;
}

interface Profile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  city: string | null;
}

interface SubmissionWithProfile extends Submission {
  profile?: Profile | null;
  hasLiked?: boolean;
}

const VideosGallery = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<SubmissionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<SubmissionWithProfile | null>(null);
  const [likingIds, setLikingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSubmissions();
  }, [user]);

  const fetchSubmissions = async () => {
    try {
      // Fetch submissions with likes_count
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('challenge_submissions')
        .select(`
          id,
          video_url,
          description,
          created_at,
          challenge_id,
          user_id,
          likes_count,
          challenges (
            title,
            ends_at
          )
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (submissionsError) throw submissionsError;
      
      if (!submissionsData || submissionsData.length === 0) {
        setSubmissions([]);
        setLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(submissionsData.map(s => s.user_id))];

      // Fetch profiles for these users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, city')
        .in('user_id', userIds);

      // Fetch user's likes if logged in
      let userLikes: string[] = [];
      if (user) {
        const { data: likesData } = await supabase
          .from('video_likes')
          .select('submission_id')
          .eq('user_id', user.id);
        
        userLikes = likesData?.map(l => l.submission_id) || [];
      }

      // Merge submissions with profiles and like status
      const submissionsWithProfiles = submissionsData.map(submission => ({
        ...submission,
        profile: profiles?.find(p => p.user_id === submission.user_id) || null,
        hasLiked: userLikes.includes(submission.id)
      }));

      setSubmissions(submissionsWithProfiles);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (submissionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: 'Inicia sesión',
        description: 'Necesitas iniciar sesión para dar likes',
        variant: 'destructive'
      });
      return;
    }

    if (likingIds.has(submissionId)) return;

    setLikingIds(prev => new Set(prev).add(submissionId));

    try {
      const submission = submissions.find(s => s.id === submissionId);
      if (!submission) return;

      if (submission.hasLiked) {
        // Remove like
        await supabase
          .from('video_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('submission_id', submissionId);

        setSubmissions(prev => prev.map(s => 
          s.id === submissionId 
            ? { ...s, hasLiked: false, likes_count: Math.max(0, s.likes_count - 1) }
            : s
        ));
        
        if (selectedVideo?.id === submissionId) {
          setSelectedVideo(prev => prev ? { 
            ...prev, 
            hasLiked: false, 
            likes_count: Math.max(0, prev.likes_count - 1) 
          } : null);
        }
      } else {
        // Add like
        const { error } = await supabase
          .from('video_likes')
          .insert({ user_id: user.id, submission_id: submissionId });

        if (error) throw error;

        setSubmissions(prev => prev.map(s => 
          s.id === submissionId 
            ? { ...s, hasLiked: true, likes_count: s.likes_count + 1 }
            : s
        ));

        if (selectedVideo?.id === submissionId) {
          setSelectedVideo(prev => prev ? { 
            ...prev, 
            hasLiked: true, 
            likes_count: prev.likes_count + 1 
          } : null);
        }

        // Show toast if not self-like
        if (submission.user_id !== user.id) {
          toast({
            title: '❤️ ¡Like enviado!',
            description: 'El chef recibirá +1 de energía'
          });
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Error',
        description: 'No se pudo procesar el like',
        variant: 'destructive'
      });
    } finally {
      setLikingIds(prev => {
        const next = new Set(prev);
        next.delete(submissionId);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-unbounded text-3xl md:text-4xl font-bold mb-2">
              🎬 <span className="text-gradient-fire">Galería de Vídeos</span>
            </h1>
            <p className="text-muted-foreground">
              Descubre las creaciones de nuestros chefs participantes
            </p>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500" />
              Da like para que el chef gane +1 de energía
              <Zap className="w-4 h-4 text-primary" />
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="font-unbounded text-xl font-bold mb-2">
                Aún no hay vídeos
              </h2>
              <p className="text-muted-foreground mb-6">
                Sé el primero en participar en el desafío semanal
              </p>
              <Button asChild className="gap-2">
                <Link to="/dashboard">
                  Ir al Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {submissions.map((submission) => (
                <div 
                  key={submission.id}
                  className="bg-card border border-border rounded-2xl overflow-hidden group hover:border-primary/50 transition-all"
                >
                  {/* Video Thumbnail/Player - 9:16 aspect ratio */}
                  <div className="relative aspect-[9/16] bg-black">
                    <video
                      src={submission.video_url}
                      className="w-full h-full object-contain"
                      onClick={() => setSelectedVideo(submission)}
                    />
                    <button
                      onClick={() => setSelectedVideo(submission)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                        <Play className="w-5 h-5 text-white ml-1" />
                      </div>
                    </button>
                    
                    {/* Like button overlay */}
                    <button
                      onClick={(e) => handleLike(submission.id, e)}
                      disabled={likingIds.has(submission.id)}
                      className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 hover:bg-black/80 transition-colors"
                    >
                      <Heart 
                        className={`w-4 h-4 transition-colors ${
                          submission.hasLiked 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-white'
                        }`} 
                      />
                      <span className="text-white text-sm font-medium">
                        {submission.likes_count}
                      </span>
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        {submission.profile?.avatar_url ? (
                          <img 
                            src={submission.profile.avatar_url} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {submission.profile?.display_name || 'Chef Anónimo'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(submission.created_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Video Modal - 9:16 aspect ratio */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="flex flex-col items-center max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[9/16] h-[70vh] max-w-full bg-black rounded-xl overflow-hidden">
              <video
                src={selectedVideo.video_url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
              
              {/* Like button in modal */}
              <button
                onClick={(e) => handleLike(selectedVideo.id, e)}
                disabled={likingIds.has(selectedVideo.id)}
                className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-black/90 transition-colors"
              >
                <Heart 
                  className={`w-5 h-5 transition-all ${
                    selectedVideo.hasLiked 
                      ? 'fill-red-500 text-red-500 scale-110' 
                      : 'text-white hover:scale-110'
                  }`} 
                />
                <span className="text-white font-medium">
                  {selectedVideo.likes_count}
                </span>
              </button>
            </div>
            <div className="mt-4 flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                {selectedVideo.profile?.avatar_url ? (
                  <img 
                    src={selectedVideo.profile.avatar_url} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium">
                  {selectedVideo.profile?.display_name || 'Chef Anónimo'}
                </p>
                {selectedVideo.description && (
                  <p className="text-sm text-white/70 max-w-md">{selectedVideo.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default VideosGallery;