-- Create dedicated bucket for casting/presentation videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'presentation-videos',
  'presentation-videos',
  true,
  104857600,
  ARRAY['video/mp4','video/quicktime','video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: authenticated users can upload only to their own uid folder
CREATE POLICY "users_upload_own_presentation_video" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'presentation-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- RLS: anyone can read (public bucket for admin review, etc.)
CREATE POLICY "public_read_presentation_videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'presentation-videos');
