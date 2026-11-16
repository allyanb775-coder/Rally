-- A public link the club owner shares: Instagram, website or the court's map location. Web links only.
alter table public.communities
  add column link text check (link is null or (link ~ '^https?://[^\s/]+\.[^\s]+' and length(link) <= 300));
