-- Allow leads and authenticated users to delete their own recipes
CREATE POLICY "Users can delete own recipes"
ON public.recipes
FOR DELETE
USING (
  (auth.uid() = user_id)
  OR
  (lead_id IS NOT NULL AND lead_id IN (
    SELECT id FROM recetario_leads
  ))
);