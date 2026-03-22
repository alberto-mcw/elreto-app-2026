-- Phase 2: RLS Security Hardening
-- Migration: 20260321000000_rls_security_hardening.sql

-- 2.1 recetario_leads SELECT: restrict to own row by email match
DROP POLICY IF EXISTS "Leads can view own by email" ON public.recetario_leads;
CREATE POLICY "Leads can view own by email" ON public.recetario_leads FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    auth.uid() IS NOT NULL
    AND email = (
      SELECT raw_user_meta_data->>'email'
      FROM auth.users
      WHERE id = auth.uid()
    )
  )
);

-- 2.2 recipe_interactions INSERT: require auth or explicit null user_id (lead flow)
DROP POLICY IF EXISTS "Anyone can insert interactions" ON public.recipe_interactions;
CREATE POLICY "Authenticated or lead can insert interactions" ON public.recipe_interactions
FOR INSERT WITH CHECK (
  (user_id IS NULL OR user_id = auth.uid())
  AND EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id)
);

-- 2.3 recipe_shares INSERT: verify ownership of shared recipe
DROP POLICY IF EXISTS "Authenticated users can create shares" ON public.recipe_shares;
CREATE POLICY "Users can only share own recipes" ON public.recipe_shares FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.recipes
    WHERE id = recipe_id
    AND user_id = auth.uid()
  )
);

-- 2.4 recipe_collection_items: add ownership checks
DROP POLICY IF EXISTS "Anyone can insert collection items" ON public.recipe_collection_items;
DROP POLICY IF EXISTS "Anyone can delete collection items" ON public.recipe_collection_items;

CREATE POLICY "Collection owners can add items" ON public.recipe_collection_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.recipe_collections
    WHERE id = collection_id
    AND (
      auth.uid() = user_id
      OR (lead_id IS NOT NULL AND user_id IS NULL)
    )
  )
);

CREATE POLICY "Collection owners can remove items" ON public.recipe_collection_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.recipe_collections
    WHERE id = collection_id
    AND (
      auth.uid() = user_id
      OR (lead_id IS NOT NULL AND user_id IS NULL)
    )
  )
);
