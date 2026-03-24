-- Allows an authenticated user to permanently delete their own account.
-- SECURITY DEFINER runs as postgres (owns auth schema) so it can delete from auth.users.

CREATE OR REPLACE FUNCTION public.soft_delete_account(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security check: only the account owner can delete their account
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Delete tables without CASCADE first (must precede auth.users deletion)
  DELETE FROM public.admin_audit_log         WHERE admin_user_id = p_user_id OR target_user_id = p_user_id;
  DELETE FROM public.social_verifications    WHERE user_id = p_user_id;
  DELETE FROM public.super_likes             WHERE user_id = p_user_id;
  DELETE FROM public.video_likes             WHERE user_id = p_user_id;
  DELETE FROM public.trivia_completions      WHERE user_id = p_user_id;
  DELETE FROM public.reto_enrollments        WHERE user_id = p_user_id;
  DELETE FROM public.chef_event_participants WHERE user_id = p_user_id; -- cascades scores/submissions/evaluations
  DELETE FROM public.presentation_videos     WHERE user_id = p_user_id;
  DELETE FROM public.recipe_interactions     WHERE user_id = p_user_id;
  DELETE FROM public.recipe_collections      WHERE user_id = p_user_id;
  DELETE FROM public.recipes                 WHERE user_id = p_user_id;
  DELETE FROM public.profiles                WHERE user_id = p_user_id;

  -- Delete auth user — cascades: challenge_completions, challenge_submissions, user_roles
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.soft_delete_account(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.soft_delete_account(uuid) TO authenticated;
