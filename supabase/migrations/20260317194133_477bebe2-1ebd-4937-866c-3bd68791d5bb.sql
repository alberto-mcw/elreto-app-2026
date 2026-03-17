
-- ============================================
-- FASE 1: Unified Identity Model Migration
-- ============================================

-- 1. Add new columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS auth_provider text DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS accepted_terms_at timestamptz,
  ADD COLUMN IF NOT EXISTS accepted_privacy_at timestamptz;

-- 2. Add accepted_bases_at to reto_enrollments
ALTER TABLE public.reto_enrollments
  ADD COLUMN IF NOT EXISTS accepted_bases_at timestamptz;

-- 3. Migrate existing boolean acceptance data to timestamps
-- For profiles: if accepted_terms = true, set accepted_terms_at to created_at
UPDATE public.profiles 
SET accepted_terms_at = created_at 
WHERE accepted_terms = true AND accepted_terms_at IS NULL;

UPDATE public.profiles 
SET accepted_privacy_at = created_at 
WHERE accepted_privacy = true AND accepted_privacy_at IS NULL;

-- For reto_enrollments: if accepted_legal_bases = true, set accepted_bases_at to enrolled_at
UPDATE public.reto_enrollments
SET accepted_bases_at = enrolled_at
WHERE accepted_legal_bases = true AND accepted_bases_at IS NULL;

-- 4. Update handle_new_user trigger to detect auth provider
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name, avatar_url, country, auth_provider)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.raw_user_meta_data ->> 'country',
    CASE 
      WHEN NEW.raw_app_meta_data ->> 'provider' = 'google' THEN 'google'
      WHEN NEW.raw_app_meta_data ->> 'provider' = 'apple' THEN 'apple'
      ELSE 'email'
    END
  );
  RETURN NEW;
END;
$$;

-- 5. Detect auth_provider for existing users (backfill)
-- This sets auth_provider based on what's in auth metadata
-- For now, all existing users are email-based
UPDATE public.profiles
SET auth_provider = 'email'
WHERE auth_provider IS NULL;
