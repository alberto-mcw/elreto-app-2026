-- ─────────────────────────────────────────────────────────────────────────────
-- Cleanup duplicate profiles caused by password-reset creating new auth users
-- Safe to run: only deletes 0-energy duplicates with confirmed originals
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. alberto.ac@gmail.com — "Misterchef" duplicate (0 pts)
--    Keep:   id=9dca93bf (411 energy, user_id=98eb8939)
--    Delete: id=f2d23ec2 (0 energy,  user_id=9dca93bf)
DELETE FROM public.profiles
WHERE id = 'f2d23ec2-9091-441b-8792-e675a4b47ab3'
  AND total_energy = 0;

-- 2. alberto.nicolas@masterchefworld.app — duplicate (0 pts, 1 day newer)
--    Keep:   id=f4d86b47 (created 2026-03-20, user_id=7e53ae96)
--    Delete: id=a68ff823 (created 2026-03-21, user_id=f4d86b47)
DELETE FROM public.profiles
WHERE id = 'a68ff823-874f-4e39-b5d2-52dfa60a0c81'
  AND total_energy = 0;

-- ─────────────────────────────────────────────────────────────────────────────
-- Also clean up the orphan auth users (run from Supabase Dashboard → Auth → Users)
-- or via service_role API:
--   DELETE FROM auth.users WHERE id = '9dca93bf-ee6b-4e55-bfcf-d78944c99bbc';
--   DELETE FROM auth.users WHERE id = 'f4d86b47-ba61-4af7-b914-7a882e4556c4';
-- ─────────────────────────────────────────────────────────────────────────────
