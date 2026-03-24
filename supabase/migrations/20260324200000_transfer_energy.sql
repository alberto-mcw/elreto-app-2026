-- Allows an authenticated user to transfer all their energy points to another user.
-- Uses auth.uid() as the sender — never a parameter — to prevent impersonation.

CREATE OR REPLACE FUNCTION public.transfer_energy(p_to_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from_user_id uuid := auth.uid();
  v_from_energy  integer;
BEGIN
  -- Must be authenticated
  IF v_from_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Cannot transfer to yourself
  IF v_from_user_id = p_to_user_id THEN
    RAISE EXCEPTION 'Cannot transfer to yourself';
  END IF;

  -- Get sender's current energy
  SELECT total_energy INTO v_from_energy
  FROM public.profiles
  WHERE user_id = v_from_user_id;

  IF v_from_energy IS NULL OR v_from_energy <= 0 THEN
    RAISE EXCEPTION 'No points to transfer';
  END IF;

  -- Atomic transfer
  UPDATE public.profiles SET total_energy = total_energy + v_from_energy, updated_at = now() WHERE user_id = p_to_user_id;
  UPDATE public.profiles SET total_energy = 0,                            updated_at = now() WHERE user_id = v_from_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.transfer_energy(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transfer_energy(uuid) TO authenticated;
