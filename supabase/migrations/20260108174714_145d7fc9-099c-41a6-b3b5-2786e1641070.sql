-- Create table for video likes
CREATE TABLE public.video_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  submission_id uuid NOT NULL REFERENCES public.challenge_submissions(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, submission_id)
);

-- Enable RLS
ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can like videos"
ON public.video_likes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike videos"
ON public.video_likes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view likes"
ON public.video_likes
FOR SELECT
USING (true);

-- Function to award energy when a video receives a like
CREATE OR REPLACE FUNCTION public.award_energy_on_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  video_owner_id uuid;
BEGIN
  -- Get the owner of the video
  SELECT user_id INTO video_owner_id
  FROM public.challenge_submissions
  WHERE id = NEW.submission_id;
  
  -- Award 1 energy point to video owner (not self-likes)
  IF video_owner_id IS NOT NULL AND video_owner_id != NEW.user_id THEN
    UPDATE public.profiles
    SET total_energy = total_energy + 1,
        updated_at = now()
    WHERE user_id = video_owner_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for awarding energy on new like
CREATE TRIGGER on_video_like
  AFTER INSERT ON public.video_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.award_energy_on_like();

-- Add likes_count column to submissions for performance
ALTER TABLE public.challenge_submissions
ADD COLUMN likes_count integer NOT NULL DEFAULT 0;

-- Function to update likes count
CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.challenge_submissions
    SET likes_count = likes_count + 1
    WHERE id = NEW.submission_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.challenge_submissions
    SET likes_count = likes_count - 1
    WHERE id = OLD.submission_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger for updating likes count
CREATE TRIGGER update_submission_likes_count
  AFTER INSERT OR DELETE ON public.video_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_likes_count();