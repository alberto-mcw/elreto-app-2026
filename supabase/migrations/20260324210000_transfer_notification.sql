-- Stores a pending transfer notification on the recipient's profile row.
-- Shown once on next app open, then cleared by the frontend.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pending_transfer_notification jsonb DEFAULT NULL;

-- Update transfer_energy to also store the notification on the recipient
CREATE OR REPLACE FUNCTION public.transfer_energy(p_to_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from_user_id uuid := auth.uid();
  v_from_energy  integer;
  v_from_name    text;
BEGIN
  IF v_from_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF v_from_user_id = p_to_user_id THEN
    RAISE EXCEPTION 'Cannot transfer to yourself';
  END IF;

  SELECT total_energy, COALESCE(alias, display_name, 'Chef Anónimo')
    INTO v_from_energy, v_from_name
  FROM public.profiles
  WHERE user_id = v_from_user_id;

  IF v_from_energy IS NULL OR v_from_energy <= 0 THEN
    RAISE EXCEPTION 'No points to transfer';
  END IF;

  -- Atomic transfer + store notification on recipient
  UPDATE public.profiles
    SET total_energy = total_energy + v_from_energy,
        pending_transfer_notification = jsonb_build_object('from_name', v_from_name, 'amount', v_from_energy),
        updated_at = now()
  WHERE user_id = p_to_user_id;

  UPDATE public.profiles
    SET total_energy = 0,
        updated_at   = now()
  WHERE user_id = v_from_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.transfer_energy(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transfer_energy(uuid) TO authenticated;
