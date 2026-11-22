-- Ember speaking practice.
-- Run this file once in the Supabase SQL editor. It is safe to run again.
-- Streak, freeze, and XP rules match shared/habit.ts.
-- Signed-in users can read their own rows. Writes go through complete_lesson.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  streak_count integer not null default 0 check (streak_count >= 0),
  streak_last_date date,
  freeze_week_start date,
  freeze_used boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null check (char_length(lesson_id) between 1 and 40),
  transcript text not null default '',
  wpm integer not null default 0 check (wpm >= 0),
  filler_count integer not null default 0 check (filler_count >= 0),
  done_well text not null default '',
  try_next text not null default '',
  xp_earned integer not null default 20 check (xp_earned >= 0),
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  local_date date not null,
  completed_at timestamptz not null default now()
);

create table if not exists public.streak_days (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  kind text not null check (kind in ('practice', 'freeze')),
  primary key (user_id, day)
);

create index if not exists lesson_attempts_user_completed_idx
  on public.lesson_attempts (user_id, completed_at);

alter table public.profiles enable row level security;
alter table public.lesson_attempts enable row level security;
alter table public.streak_days enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.lesson_attempts from anon, authenticated;
revoke all on table public.streak_days from anon, authenticated;

grant select on table public.profiles to authenticated;
grant select on table public.lesson_attempts to authenticated;
grant select on table public.streak_days to authenticated;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (auth.uid() = id);

drop policy if exists attempts_select on public.lesson_attempts;
create policy attempts_select on public.lesson_attempts
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists streak_days_select on public.streak_days;
create policy streak_days_select on public.streak_days
  for select to authenticated
  using (auth.uid() = user_id);

insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop function if exists public.complete_lesson(text, text, integer, integer, text, text, integer, date);

create function public.complete_lesson(
  p_lesson_id text,
  p_transcript text,
  p_wpm integer,
  p_filler_count integer,
  p_done_well text,
  p_try_next text,
  p_duration_seconds integer,
  p_local_date date
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  prof public.profiles%rowtype;
  v_gap integer := 0;
  v_streak integer;
  v_last date;
  v_week date;
  v_freeze_used boolean;
  v_freeze_week date;
  v_freeze_applied boolean := false;
  v_xp integer;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  if p_local_date is null
     or p_local_date < (current_date - 1)
     or p_local_date > (current_date + 1) then
    raise exception 'local date out of range';
  end if;

  if p_lesson_id is null or p_lesson_id !~ '^[a-z0-9-]{1,40}$' then
    raise exception 'invalid lesson';
  end if;

  insert into public.profiles (id) values (uid) on conflict (id) do nothing;
  select * into prof from public.profiles where id = uid for update;

  v_week := p_local_date - (extract(isodow from p_local_date)::integer - 1);
  v_streak := prof.streak_count;
  v_last := prof.streak_last_date;
  v_freeze_used := prof.freeze_used;
  v_freeze_week := prof.freeze_week_start;
  v_xp := prof.xp + 20;

  if prof.streak_last_date is null then
    v_streak := 1;
    v_last := p_local_date;
  elsif prof.streak_last_date = p_local_date then
    v_last := p_local_date;
  else
    v_gap := p_local_date - prof.streak_last_date;
    if v_gap < 0 then
      v_streak := prof.streak_count;
      v_last := prof.streak_last_date;
    elsif v_gap = 1 then
      v_streak := prof.streak_count + 1;
      v_last := p_local_date;
    elsif v_gap = 2 and (prof.freeze_week_start is distinct from v_week or not prof.freeze_used) then
      insert into public.streak_days (user_id, day, kind)
      values (uid, p_local_date - 1, 'freeze')
      on conflict (user_id, day) do nothing;
      v_freeze_applied := true;
      v_freeze_week := v_week;
      v_freeze_used := true;
      v_streak := prof.streak_count + 1;
      v_last := p_local_date;
    else
      v_streak := 1;
      v_last := p_local_date;
    end if;
  end if;

  update public.profiles
  set
    xp = v_xp,
    streak_count = v_streak,
    streak_last_date = v_last,
    freeze_week_start = v_freeze_week,
    freeze_used = v_freeze_used
  where id = uid;

  insert into public.streak_days (user_id, day, kind)
  values (uid, p_local_date, 'practice')
  on conflict (user_id, day) do update set kind = 'practice';

  insert into public.lesson_attempts (
    user_id,
    lesson_id,
    transcript,
    wpm,
    filler_count,
    done_well,
    try_next,
    xp_earned,
    duration_seconds,
    local_date
  ) values (
    uid,
    p_lesson_id,
    left(coalesce(p_transcript, ''), 8000),
    least(greatest(coalesce(p_wpm, 0), 0), 1000),
    least(greatest(coalesce(p_filler_count, 0), 0), 500),
    left(coalesce(p_done_well, ''), 500),
    left(coalesce(p_try_next, ''), 500),
    20,
    least(greatest(coalesce(p_duration_seconds, 0), 0), 600),
    p_local_date
  );

  return jsonb_build_object(
    'xp', v_xp,
    'streak_count', v_streak,
    'streak_last_date', v_last,
    'freeze_week_start', v_freeze_week,
    'freeze_used', v_freeze_used,
    'xp_earned', 20,
    'freeze_applied', v_freeze_applied
  );
end;
$$;

revoke all on function public.complete_lesson(text, text, integer, integer, text, text, integer, date) from public;
revoke all on function public.complete_lesson(text, text, integer, integer, text, text, integer, date) from anon;
grant execute on function public.complete_lesson(text, text, integer, integer, text, text, integer, date) to authenticated;
