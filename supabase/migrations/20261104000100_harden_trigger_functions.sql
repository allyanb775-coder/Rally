-- Fixes from Supabase security advisor: pin search_path and keep trigger
-- functions out of the public RPC API (triggers still fire after the revoke).
alter function public.guard_profile_update() set search_path = public;
alter function public.guard_profile_insert() set search_path = public;
revoke execute on function public.enforce_match_size(), public.enforce_tournament_entry(), public.prevent_host_leave(), public.guard_profile_update(), public.guard_profile_insert() from public, anon, authenticated;
