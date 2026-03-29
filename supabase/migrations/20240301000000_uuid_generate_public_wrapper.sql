-- Supabase installs uuid-ossp in the `extensions` schema; older migrations call uuid_generate_v4() unqualified.
CREATE OR REPLACE FUNCTION public.uuid_generate_v4()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$ SELECT extensions.uuid_generate_v4() $$;
