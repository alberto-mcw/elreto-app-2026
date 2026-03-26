-- Add pending_admin_points_notification column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pending_admin_points_notification jsonb DEFAULT NULL;

-- Function: admin_assign_points
-- Assigns free points to a user with a custom concept. Admin-only (SECURITY DEFINER).
CREATE OR REPLACE FUNCTION public.admin_assign_points(
  p_target_user_id uuid,
  p_amount integer,
  p_concept text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;

  -- Increment energy and set pending notification
  UPDATE public.profiles
    SET total_energy = total_energy + p_amount,
        updated_at = now(),
        pending_admin_points_notification = jsonb_build_object(
          'amount', p_amount,
          'concept', p_concept
        )
    WHERE user_id = p_target_user_id;

  -- Write to audit log
  INSERT INTO public.admin_audit_log (admin_user_id, target_user_id, action, metadata)
    VALUES (
      auth.uid(),
      p_target_user_id,
      'assign_points',
      jsonb_build_object('amount', p_amount, 'concept', p_concept)
    );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_assign_points(uuid, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_assign_points(uuid, integer, text) TO authenticated;
