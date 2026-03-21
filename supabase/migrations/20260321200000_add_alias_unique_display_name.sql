-- Add alias column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS alias text;

-- Add UNIQUE constraint on display_name (prevent duplicate chef names)
-- First, deduplicate any existing duplicates by appending user_id suffix
DO $$
DECLARE
  dup RECORD;
  suffix INT;
BEGIN
  FOR dup IN
    SELECT display_name
    FROM public.profiles
    WHERE display_name IS NOT NULL
    GROUP BY display_name
    HAVING COUNT(*) > 1
  LOOP
    suffix := 1;
    UPDATE public.profiles
    SET display_name = display_name || '_' || suffix
    WHERE id IN (
      SELECT id FROM public.profiles
      WHERE display_name = dup.display_name
      ORDER BY created_at ASC
      OFFSET 1
    );
  END LOOP;
END;
$$;

-- Now add unique constraint
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_display_name_unique UNIQUE (display_name);

-- Add unique constraint on alias too
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_alias_unique UNIQUE (alias);
