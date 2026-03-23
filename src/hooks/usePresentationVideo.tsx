import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PresentationVideo {
  id: string;
  user_id: string;
  video_url: string;
  status: string;
  energy_awarded: boolean;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const MIME_TO_EXT: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
};
const EXT_TO_MIME: Record<string, string> = {
  'mp4': 'video/mp4',
  'mov': 'video/quicktime',
  'webm': 'video/webm',
};

// iOS/Android often omit file.type for videos picked from the library.
// Fall back to extension-based detection when MIME is empty.
const resolveVideoMime = (file: File): string => {
  if (file.type && ALLOWED_VIDEO_TYPES.includes(file.type)) return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return EXT_TO_MIME[ext] ?? file.type;
};

export const usePresentationVideo = () => {
  const { user } = useAuth();
  const [video, setVideo] = useState<PresentationVideo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVideo = async () => {
    if (!user) { setVideo(null); setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('presentation_videos')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      setVideo(data);
    } catch (e) {
      if (import.meta.env.DEV) { console.error('Error fetching presentation video:', e); }
    } finally {
      setLoading(false);
    }
  };

  const uploadVideo = async (file: File) => {
    if (!user) return { error: new Error('No user') };

    // Resolve MIME — iOS/Android may leave file.type empty for library videos
    const resolvedMime = resolveVideoMime(file);

    // Validate MIME type
    if (!ALLOWED_VIDEO_TYPES.includes(resolvedMime)) {
      return { error: new Error('Tipo de vídeo no permitido. Usa MP4, MOV o WebM.') };
    }

    try {
      const safeExt = MIME_TO_EXT[resolvedMime] ?? 'mp4';
      const filePath = `${user.id}/presentation.${safeExt}`;

      const { error: uploadError } = await supabase.storage
        .from('presentation-videos')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('presentation-videos')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('presentation_videos')
        .upsert({ user_id: user.id, video_url: publicUrl, status: 'pending' }, { onConflict: 'user_id' });
      if (insertError) throw insertError;

      await fetchVideo();
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  useEffect(() => { fetchVideo(); }, [user]);

  return { video, loading, uploadVideo, refetch: fetchVideo };
};
