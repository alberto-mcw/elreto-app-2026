-- RLS-1: Fix social_verifications policies to require authentication
-- Previously: "Anyone can insert" WITH CHECK (true) — open to spam/abuse
DROP POLICY IF EXISTS "Anyone can insert their verification" ON public.social_verifications;
DROP POLICY IF EXISTS "Anyone can view verifications" ON public.social_verifications;

CREATE POLICY "Authenticated users can insert their own verification"
  ON public.social_verifications
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can view their own verifications"
  ON public.social_verifications
  FOR SELECT
  USING (auth.uid() = user_id);


-- RLS-2: Prevent users from updating restricted fields in profiles
-- (total_energy, created_at should only be modified by server-side logic)
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Prevent direct updates to energy and audit fields from client
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    NEW.total_energy := OLD.total_energy;
    NEW.created_at   := OLD.created_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_fields_trigger ON public.profiles;
CREATE TRIGGER protect_profile_fields_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_fields();
