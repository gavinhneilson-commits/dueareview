-- Run ONCE in the Supabase SQL editor after creating your own user
-- (Authentication → Users → Add user). Replace the email below.
update public.profiles set role = 'admin', display_name = 'Gavin'
where email = 'you@example.com';
