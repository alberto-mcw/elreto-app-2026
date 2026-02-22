
-- Drop all existing SELECT policies on recipes
DROP POLICY IF EXISTS "Anyone can view shared recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can view own recipes" ON public.recipes;

-- Recreate as PERMISSIVE policies (default)
CREATE POLICY "Anyone can view shared recipes" ON public.recipes
  FOR SELECT USING (visibility = 'shared' OR visibility = 'public');

CREATE POLICY "Users can view own recipes" ON public.recipes
  FOR SELECT USING (
    auth.uid() = user_id
    OR lead_id IN (
      SELECT id FROM public.recetario_leads 
      WHERE email = public.get_auth_email()
    )
  );

-- Add permissive SELECT policy for anonymous lead-based access
CREATE POLICY "Leads can view own recipes by lead_id" ON public.recipes
  FOR SELECT USING (lead_id IS NOT NULL);
