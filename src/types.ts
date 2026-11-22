export type SessionMode = 'supabase' | 'preview'

export type Session = {
  mode: SessionMode
  userId: string
  email: string
}

export type Profile = {
  xp: number
  streakCount: number
  streakLastDate: string | null
  freezeWeekStart: string | null
  freezeUsed: boolean
}

export type Attempt = {
  id: string
  lessonId: string
  transcript: string
  wpm: number
  fillerCount: number
  doneWell: string
  tryNext: string
  xpEarned: number
  durationSeconds: number
  completedAt: string
  localDate: string
}

export type StreakDay = {
  day: string
  kind: 'practice' | 'freeze'
}

export type Snapshot = {
  profile: Profile
  attempts: Attempt[]
  streakDays: StreakDay[]
}

export type Completion = {
  xpEarned: number
  freezeApplied: boolean
  profile: Profile
  snapshot: Snapshot
}

export const EMPTY_PROFILE: Profile = {
  xp: 0,
  streakCount: 0,
  streakLastDate: null,
  freezeWeekStart: null,
  freezeUsed: false,
}

export const PREVIEW_SESSION_KEY = 'ember-session'
export const PREVIEW_DATA_KEY = 'ember-preview-v1'
