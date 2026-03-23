import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X, Loader2, Play, LayoutGrid, List, X as Close } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PresentationVideoAdmin {
  id: string;
  user_id: string;
  video_url: string;
  status: string;
  energy_awarded: boolean;
  created_at: string;
  profile?: {
    display_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

// ── Video Modal ────────────────────────────────────────────────────────────────
const VideoModal = ({ video, onClose }: { video: PresentationVideoAdmin; onClose: () => void }) => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Fetch as blob and force correct MIME type — videos uploaded without contentType
  // are stored as application/octet-stream and won't play inline in the browser.
  useEffect(() => {
    let objectUrl: string | null = null;
    fetch(video.video_url)
      .then(r => r.blob())
      .then(blob => {
        const mime = (!blob.type || blob.type === 'application/octet-stream') ? 'video/mp4' : blob.type;
        objectUrl = URL.createObjectURL(new Blob([blob], { type: mime }));
        setSrc(objectUrl);
      })
      .catch(() => setSrc(video.video_url));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [video.video_url]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <div className="relative w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white flex items-center gap-1 text-sm"
        >
          <Close className="w-4 h-4" /> Cerrar
        </button>
        {src ? (
          <video
            src={src}
            controls
            autoPlay
            className="w-full rounded-xl bg-black"
            style={{ maxHeight: '80vh' }}
          />
        ) : (
          <div className="w-full aspect-video rounded-xl bg-black flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white/40" />
          </div>
        )}
        <p className="text-white/60 text-sm mt-2 text-center">
          {video.profile?.display_name || 'Sin nombre'} · {video.profile?.email}
        </p>
      </div>
    </div>
  );
};

// ── Thumbnail with play overlay ───────────────────────────────────────────────
const VideoThumb = ({ video, onClick }: { video: PresentationVideoAdmin; onClick: () => void }) => (
  <div
    className="relative bg-black aspect-video cursor-pointer group flex-shrink-0"
    onClick={onClick}
  >
    <video src={video.video_url} preload="metadata" className="w-full h-full object-contain" />
    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
      </div>
    </div>
  </div>
);

// ── Action buttons ────────────────────────────────────────────────────────────
const Actions = ({
  video,
  onApprove,
  onReject,
  onRevoke,
}: {
  video: PresentationVideoAdmin;
  onApprove: () => void;
  onReject: () => void;
  onRevoke: () => void;
}) => {
  if (video.status === 'pending') return (
    <div className="flex gap-2">
      <Button size="sm" onClick={onApprove} className="gap-1">
        <Check className="w-3 h-3" /> Aprobar
      </Button>
      <Button size="sm" variant="destructive" onClick={onReject} className="gap-1">
        <X className="w-3 h-3" /> Rechazar
      </Button>
    </div>
  );
  if (video.status === 'approved') return (
    <div className="flex items-center gap-2">
      <Badge>Aprobado</Badge>
      <Button size="sm" variant="outline" onClick={onRevoke} className="text-xs">Revocar</Button>
    </div>
  );
  return (
    <div className="flex items-center gap-2">
      <Badge variant="destructive">Rechazado</Badge>
      <Button size="sm" onClick={onApprove} className="gap-1 text-xs">
        <Check className="w-3 h-3" /> Aprobar
      </Button>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
export const AdminPresentationVideos = () => {
  const [videos, setVideos] = useState<PresentationVideoAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [activeVideo, setActiveVideo] = useState<PresentationVideoAdmin | null>(null);
  const { toast } = useToast();

  const fetchVideos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('presentation_videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      const enriched = await Promise.all(
        data.map(async (v: any) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, email, avatar_url')
            .eq('user_id', v.user_id)
            .maybeSingle();
          return { ...v, profile };
        })
      );
      setVideos(enriched);
    }
    setLoading(false);
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleApprove = async (video: PresentationVideoAdmin) => {
    const { error } = await supabase
      .from('presentation_videos')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', video.id);
    if (error) { toast({ title: 'Error al aprobar', variant: 'destructive' }); }
    else { toast({ title: '✅ Vídeo aprobado', description: '+100 puntos otorgados' }); fetchVideos(); }
  };

  const handleReject = async (video: PresentationVideoAdmin) => {
    const { error } = await supabase
      .from('presentation_videos')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', video.id);
    if (error) { toast({ title: 'Error al rechazar', variant: 'destructive' }); }
    else { toast({ title: 'Vídeo rechazado' }); fetchVideos(); }
  };

  const handleRevoke = async (video: PresentationVideoAdmin) => {
    const { error } = await supabase
      .from('presentation_videos')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', video.id);
    if (error) { toast({ title: 'Error al revocar', variant: 'destructive' }); }
    else { toast({ title: 'Aprobación revocada', description: '-100 puntos' }); fetchVideos(); }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  const pending  = videos.filter(v => v.status === 'pending');
  const reviewed = videos.filter(v => v.status !== 'pending');

  const renderSection = (title: string, items: PresentationVideoAdmin[]) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-3">
        <h3 className="font-unbounded font-bold">{title} ({items.length})</h3>

        {/* Grid view */}
        {view === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(video => (
              <Card key={video.id} className="overflow-hidden">
                <VideoThumb video={video} onClick={() => setActiveVideo(video)} />
                <CardContent className="p-3 space-y-2">
                  <p className="font-semibold text-sm">{video.profile?.display_name || 'Sin nombre'}</p>
                  <p className="text-xs text-muted-foreground">{video.profile?.email}</p>
                  <Actions
                    video={video}
                    onApprove={() => handleApprove(video)}
                    onReject={() => handleReject(video)}
                    onRevoke={() => handleRevoke(video)}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* List view */}
        {view === 'list' && (
          <div className="space-y-2">
            {items.map(video => (
              <div key={video.id} className="flex items-center gap-4 border border-border rounded-xl p-3 bg-card">
                {/* Thumbnail */}
                <div className="w-32 flex-shrink-0 rounded-lg overflow-hidden">
                  <VideoThumb video={video} onClick={() => setActiveVideo(video)} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="font-semibold text-sm truncate">{video.profile?.display_name || 'Sin nombre'}</p>
                  <p className="text-xs text-muted-foreground truncate">{video.profile?.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(video.created_at), "d MMM yyyy · HH:mm'h'", { locale: es })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0">
                  <Actions
                    video={video}
                    onApprove={() => handleApprove(video)}
                    onReject={() => handleReject(video)}
                    onRevoke={() => handleRevoke(video)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* View toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setView('grid')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            view === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          <LayoutGrid className="w-4 h-4" /> Mosaico
        </button>
        <button
          onClick={() => setView('list')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            view === 'list' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          <List className="w-4 h-4" /> Lista
        </button>
      </div>

      {renderSection('Pendientes', pending)}
      {renderSection('Revisados', reviewed)}

      {videos.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No hay vídeos de presentación aún</p>
      )}

      {/* Modal */}
      {activeVideo && (
        <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </div>
  );
};
