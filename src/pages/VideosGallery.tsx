import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Loader2, 
  Trophy, 
  User,
  Calendar,
  ArrowRight
} from 'lucide-react';

interface Submission {
  id: string;
  video_url: string;
  description: string | null;
  created_at: string;
  challenge_id: string;
  user_id: string;
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
}

const VideosGallery = () => {
  const [submissions, setSubmissions] = useState<SubmissionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<SubmissionWithProfile | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      // Fetch submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('challenge_submissions')
        .select(`
          id,
          video_url,
          description,
          created_at,
          challenge_id,
          user_id,
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

      // Merge submissions with profiles
      const submissionsWithProfiles = submissionsData.map(submission => ({
        ...submission,
        profile: profiles?.find(p => p.user_id === submission.user_id) || null
      }));

      setSubmissions(submissionsWithProfiles);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {submissions.map((submission) => (
                <div 
                  key={submission.id}
                  className="bg-card border border-border rounded-2xl overflow-hidden group hover:border-primary/50 transition-all"
                >
                  {/* Video Thumbnail/Player */}
                  <div className="relative aspect-video bg-muted">
                    <video
                      src={submission.video_url}
                      className="w-full h-full object-cover"
                      onClick={() => setSelectedVideo(submission)}
                    />
                    <button
                      onClick={() => setSelectedVideo(submission)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </div>
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                        {submission.profile?.avatar_url ? (
                          <img 
                            src={submission.profile.avatar_url} 
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
                          {submission.profile?.display_name || 'Chef Anónimo'}
                        </p>
                        {submission.profile?.city && (
                          <p className="text-xs text-muted-foreground">
                            📍 {submission.profile.city}
                          </p>
                        )}
                      </div>
                    </div>

                    {submission.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {submission.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(submission.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                      {submission.challenges && (
                        <>
                          <span>•</span>
                          <span className="text-primary">{submission.challenges.title}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={selectedVideo.video_url}
              controls
              autoPlay
              className="w-full rounded-xl"
              style={{ maxHeight: '80vh' }}
            />
            <div className="mt-4 flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
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
                  <p className="text-sm text-white/70">{selectedVideo.description}</p>
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
