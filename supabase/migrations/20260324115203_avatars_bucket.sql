-- Create avatars storage bucket and RLS policies
-- Pattern: same as presentation-videos bucket

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,  -- 5 MB max
  '{"image/jpeg","image/png","image/webp","image/gif"}'
) ON CONFLICT (id) DO NOTHING;

-- Public read: anyone can view avatars
CREATE POLICY "public_read_avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Authenticated users can upload their own avatar (path: {user_id}/avatar.{ext})
CREATE POLICY "users_upload_own_avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = (auth.uid())::text
  );

-- Authenticated users can update their own avatar
CREATE POLICY "users_update_own_avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = (auth.uid())::text
  );

-- Authenticated users can delete their own avatar
CREATE POLICY "users_delete_own_avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = (auth.uid())::text
  );
