-- ─────────────────────────────────────────────────────────────────────────────
-- Cleanup duplicate profiles caused by password-reset creating new auth users
-- Pattern: same person, two accounts (personal email + work email, or new session)
-- Rule: keep profile with most energy; if tied, keep oldest
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. alberto.ac@gmail.com — "Misterchef" duplicate (0 pts)
--    Keep:   id=9dca93bf (411 energy, user_id=98eb8939)
--    Delete: id=f2d23ec2 (0 energy,  user_id=9dca93bf)
DELETE FROM public.profiles
WHERE id = 'f2d23ec2-9091-441b-8792-e675a4b47ab3';

-- 2. alberto.nicolas@masterchefworld.app — duplicate (0 pts, 1 day newer)
--    Keep:   id=f4d86b47 (created 2026-03-20, user_id=7e53ae96)
--    Delete: id=a68ff823 (created 2026-03-21, user_id=f4d86b47)
DELETE FROM public.profiles
WHERE id = 'a68ff823-874f-4e39-b5d2-52dfa60a0c81';

-- 3. Javi Flores — same person, two emails:
--    javier.flores@masterchefworld.app (2026-03-04) ← keep (older)
--    javier.flores.duran@gmail.com     (2026-03-17) ← delete
DELETE FROM public.profiles
WHERE id = 'd7354f21-6c1f-4e64-aee3-7bba388a7c33';
