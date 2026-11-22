import { applyPractice, localToday, type HabitState } from '../../shared/habit'
import { getSupabase } from '../lib/supabase'
import {
  EMPTY_PROFILE,
  PREVIEW_DATA_KEY,
  type Attempt,
  type Completion,
  type Profile,
  type Session,
  type Snapshot,
} from '../types'

type ProfileRow = {
  xp: number | null
  streak_count: number | null
  streak_last_date: string | null
  freeze_week_start: string | null
  freeze_used: boolean | null
}

type AttemptRow = {
  id: string
  lesson_id: string
  transcript: string | null
  wpm: number | null
  filler_count: number | null
  done_well: string | null
  try_next: string | null
  xp_earned: number | null
  duration_seconds: number | null
  local_date: string
  completed_at: string
}

type CompleteRow = {
  xp_earned?: number
  freeze_applied?: boolean
}

export function emptySnapshot(): Snapshot {
  return { profile: { ...EMPTY_PROFILE }, attempts: [], streakDays: [] }
}

export async function loadSnapshot(session: Session): Promise<Snapshot> {
  if (session.mode === 'preview') return readPreview()
  const supabase = getSupabase()
  if (!supabase) return emptySnapshot()

  const [profileRes, attemptsRes, daysRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('xp, streak_count, streak_last_date, freeze_week_start, freeze_used')
      .eq('id', session.userId)
      .maybeSingle(),
    supabase
      .from('lesson_attempts')
      .select(
        'id, lesson_id, transcript, wpm, filler_count, done_well, try_next, xp_earned, duration_seconds, local_date, completed_at',
      )
      .eq('user_id', session.userId)
      .order('completed_at', { ascending: true }),
    supabase.from('streak_days').select('day, kind').eq('user_id', session.userId),
  ])

  if (profileRes.error) throw new Error(profileRes.error.message)
  if (attemptsRes.error) throw new Error(attemptsRes.error.message)
  if (daysRes.error) throw new Error(daysRes.error.message)

  return {
    profile: profileRes.data ? mapProfile(profileRes.data as ProfileRow) : { ...EMPTY_PROFILE },
    attempts: ((attemptsRes.data ?? []) as AttemptRow[]).map(mapAttempt),
    streakDays: ((daysRes.data ?? []) as { day: string; kind: string }[]).map((day) => ({
      day: day.day,
      kind: day.kind === 'freeze' ? 'freeze' : 'practice',
    })),
  }
}

export async function completePractice(
  session: Session,
  input: {
    lessonId: string
    transcript: string
    wpm: number
    fillerCount: number
    doneWell: string
    tryNext: string
    durationSeconds: number
  },
): Promise<Completion> {
  if (session.mode === 'preview') return completePreview(input)
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase is not connected yet.')

  const { data, error } = await supabase.rpc('complete_lesson', {
    p_lesson_id: input.lessonId,
    p_transcript: input.transcript,
    p_wpm: input.wpm,
    p_filler_count: input.fillerCount,
    p_done_well: input.doneWell,
    p_try_next: input.tryNext,
    p_duration_seconds: Math.round(input.durationSeconds),
    p_local_date: localToday(),
  })

  if (error) throw new Error(error.message)
  const row = (data ?? {}) as CompleteRow
  const snapshot = await loadSnapshot(session)
  return {
    xpEarned: typeof row.xp_earned === 'number' ? row.xp_earned : 20,
    freezeApplied: Boolean(row.freeze_applied),
    profile: snapshot.profile,
    snapshot,
  }
}

function completePreview(input: {
  lessonId: string
  transcript: string
  wpm: number
  fillerCount: number
  doneWell: string
  tryNext: string
  durationSeconds: number
}): Completion {
  const current = readPreview()
  const today = localToday()
  const result = applyPractice(toHabit(current), today)
  const attempt: Attempt = {
    id: crypto.randomUUID(),
    lessonId: input.lessonId,
    transcript: input.transcript,
    wpm: input.wpm,
    fillerCount: input.fillerCount,
    doneWell: input.doneWell,
    tryNext: input.tryNext,
    xpEarned: result.xpEarned,
    durationSeconds: Math.round(input.durationSeconds),
    completedAt: new Date().toISOString(),
    localDate: today,
  }
  const snapshot: Snapshot = {
    profile: toProfile(result.state),
    attempts: [...current.attempts, attempt],
    streakDays: result.state.days,
  }
  localStorage.setItem(PREVIEW_DATA_KEY, JSON.stringify(snapshot))
  return {
    xpEarned: result.xpEarned,
    freezeApplied: result.freezeApplied,
    profile: snapshot.profile,
    snapshot,
  }
}

function readPreview(): Snapshot {
  const raw = localStorage.getItem(PREVIEW_DATA_KEY)
  if (!raw) return emptySnapshot()
  try {
    const parsed = JSON.parse(raw) as Partial<Snapshot>
    if (!parsed.profile || !Array.isArray(parsed.attempts) || !Array.isArray(parsed.streakDays)) return emptySnapshot()
    return {
      profile: { ...EMPTY_PROFILE, ...parsed.profile },
      attempts: parsed.attempts,
      streakDays: parsed.streakDays,
    }
  } catch {
    return emptySnapshot()
  }
}

function toHabit(snapshot: Snapshot): HabitState {
  return {
    ...snapshot.profile,
    days: snapshot.streakDays,
  }
}

function toProfile(state: HabitState): Profile {
  return {
    xp: state.xp,
    streakCount: state.streakCount,
    streakLastDate: state.streakLastDate,
    freezeWeekStart: state.freezeWeekStart,
    freezeUsed: state.freezeUsed,
  }
}

function mapProfile(row: ProfileRow): Profile {
  return {
    xp: row.xp ?? 0,
    streakCount: row.streak_count ?? 0,
    streakLastDate: row.streak_last_date,
    freezeWeekStart: row.freeze_week_start,
    freezeUsed: Boolean(row.freeze_used),
  }
}

function mapAttempt(row: AttemptRow): Attempt {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    transcript: row.transcript ?? '',
    wpm: row.wpm ?? 0,
    fillerCount: row.filler_count ?? 0,
    doneWell: row.done_well ?? '',
    tryNext: row.try_next ?? '',
    xpEarned: row.xp_earned ?? 20,
    durationSeconds: row.duration_seconds ?? 0,
    completedAt: row.completed_at,
    localDate: row.local_date,
  }
}
