-- Allow users to update their own presentation_videos record
-- Needed for upsert (re-upload after rejection) and PostgREST upsert behavior
CREATE POLICY "Users can update own presentation video"
  ON public.presentation_videos
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Allow users to delete their own file in storage (needed for upsert compatibility)
CREATE POLICY "users_delete_own_presentation_video" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'presentation-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
