
ALTER TABLE public.reto_enrollments 
  ADD COLUMN street text,
  ADD COLUMN street_number text,
  ADD COLUMN address_city text,
  ADD COLUMN postal_code text,
  ADD COLUMN phone_prefix text DEFAULT '+34';

ALTER TABLE public.reto_enrollments 
  ALTER COLUMN postal_address DROP NOT NULL,
  ALTER COLUMN postal_address SET DEFAULT '';
