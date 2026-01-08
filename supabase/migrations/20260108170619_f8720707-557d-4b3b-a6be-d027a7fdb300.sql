-- Create videos storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('challenge-videos', 'challenge-videos', true);

-- Storage policies for videos
CREATE POLICY "Videos are publicly viewable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'challenge-videos');

CREATE POLICY "Authenticated users can upload videos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'challenge-videos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own videos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'challenge-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Challenge submissions table
CREATE TABLE public.challenge_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_id)
);

ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved submissions
CREATE POLICY "Anyone can view approved submissions"
ON public.challenge_submissions
FOR SELECT
USING (status = 'approved' OR auth.uid() = user_id);

-- Users can submit their own
CREATE POLICY "Users can submit their videos"
ON public.challenge_submissions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their pending submissions
CREATE POLICY "Users can update their pending submissions"
ON public.challenge_submissions
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Admins can manage all submissions
CREATE POLICY "Admins can manage submissions"
ON public.challenge_submissions
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));