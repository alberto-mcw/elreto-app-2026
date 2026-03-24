-- Create trigger to automatically create a profile when a new user registers.
-- handle_new_user() already exists in production (SECURITY DEFINER).
-- Without this trigger, profiles were created later via frontend fallback,
-- missing country and GDPR timestamps.

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
