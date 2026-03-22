-- Phase 6: Admin Audit Log
-- Migration: 20260322000000_admin_audit_log.sql

-- 6.1 Create admin_audit_log table
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES auth.users(id),
  action text NOT NULL CHECK (action IN ('ban_user', 'unban_user', 'grant_admin', 'revoke_admin')),
  target_user_id uuid NOT NULL REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log" ON public.admin_audit_log FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 6.2 SECURITY DEFINER function for ban/unban
CREATE OR REPLACE FUNCTION public.admin_ban_user(
  p_admin_id uuid,
  p_target_user_id uuid,
  p_ban boolean,
  p_reason text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: caller is not an admin';
  END IF;

  -- Apply ban/unban
  UPDATE public.profiles
  SET banned_at = CASE WHEN p_ban THEN now() ELSE NULL END
  WHERE user_id = p_target_user_id;

  -- Log the action
  INSERT INTO public.admin_audit_log (admin_user_id, action, target_user_id, metadata)
  VALUES (
    p_admin_id,
    CASE WHEN p_ban THEN 'ban_user' ELSE 'unban_user' END,
    p_target_user_id,
    jsonb_build_object('reason', p_reason)
  );
END;
$$;

-- 6.2 SECURITY DEFINER function for admin role toggle
CREATE OR REPLACE FUNCTION public.admin_toggle_role(
  p_admin_id uuid,
  p_target_user_id uuid,
  p_grant boolean
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: caller is not an admin';
  END IF;

  IF p_grant THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (p_target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    DELETE FROM public.user_roles
    WHERE user_id = p_target_user_id AND role = 'admin';
  END IF;

  -- Log the action
  INSERT INTO public.admin_audit_log (admin_user_id, action, target_user_id, metadata)
  VALUES (
    p_admin_id,
    CASE WHEN p_grant THEN 'grant_admin' ELSE 'revoke_admin' END,
    p_target_user_id,
    '{}'::jsonb
  );
END;
$$;
