-- Create a function to check trivia answer without exposing correct_answer to client
CREATE OR REPLACE FUNCTION public.check_trivia_answer(
  p_trivia_id uuid,
  p_selected_answer integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_trivia RECORD;
  v_is_correct boolean;
BEGIN
  -- Get the trivia
  SELECT correct_answer, explanation, fun_fact, energy_reward 
  INTO v_trivia
  FROM public.daily_trivias
  WHERE id = p_trivia_id
  AND status = 'approved'
  AND scheduled_date <= CURRENT_DATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Trivia not found or not available');
  END IF;
  
  v_is_correct := (p_selected_answer = v_trivia.correct_answer);
  
  RETURN jsonb_build_object(
    'is_correct', v_is_correct,
    'correct_answer', v_trivia.correct_answer,
    'explanation', v_trivia.explanation,
    'fun_fact', v_trivia.fun_fact,
    'energy_reward', CASE WHEN v_is_correct THEN v_trivia.energy_reward ELSE 0 END
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_trivia_answer(uuid, integer) TO authenticated;