-- Fix: remove duplicate trigger on trivia_completions
-- Both on_trivia_completed and on_trivia_completion_insert existed in production
-- firing the same function (award_trivia_energy) on every INSERT → double points.
-- Keep the original on_trivia_completed, drop the duplicate.

DROP TRIGGER IF EXISTS on_trivia_completion_insert ON public.trivia_completions;
