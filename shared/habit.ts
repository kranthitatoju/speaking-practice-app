export const XP_PER_LESSON = 20

const LEVEL_NAMES = ['Spark', 'Glow', 'Flame', 'Blaze', 'Beacon', 'Hearth'] as const

export type DayKind = 'practice' | 'freeze'

export type StreakDay = {
  day: string
  kind: DayKind
}

export type HabitState = {
  xp: number
  streakCount: number
  streakLastDate: string | null
  freezeWeekStart: string | null
  freezeUsed: boolean
  days: StreakDay[]
}

export type PracticeResult = {
  state: HabitState
  xpEarned: number
  freezeApplied: boolean
}

export function emptyHabit(): HabitState {
  return {
    xp: 0,
    streakCount: 0,
    streakLastDate: null,
    freezeWeekStart: null,
    freezeUsed: false,
    days: [],
  }
}

export function localToday(now = new Date()): string {
  return formatDate(now)
}

export function levelFromXp(xp: number): number {
  return Math.floor(Math.max(0, xp) / 100) + 1
}

export function levelMeta(xp: number): { level: number; name: string; into: number; size: number } {
  const level = levelFromXp(xp)
  return {
    level,
    name: LEVEL_NAMES[(level - 1) % LEVEL_NAMES.length],
    into: Math.max(0, xp) % 100,
    size: 100,
  }
}

export function mondayOf(isoDate: string): string {
  const date = dateFromIso(isoDate)
  const weekday = date.getDay()
  const offset = weekday === 0 ? 6 : weekday - 1
  date.setDate(date.getDate() - offset)
  return formatDate(date)
}

export function addDays(isoDate: string, days: number): string {
  const date = dateFromIso(isoDate)
  date.setDate(date.getDate() + days)
  return formatDate(date)
}

export function daysBetween(earlier: string, later: string): number {
  const [y1, m1, d1] = earlier.split('-').map(Number)
  const [y2, m2, d2] = later.split('-').map(Number)
  const start = Date.UTC(y1, m1 - 1, d1)
  const end = Date.UTC(y2, m2 - 1, d2)
  return Math.round((end - start) / 86_400_000)
}

export function isFreezeReady(freezeWeekStart: string | null, freezeUsed: boolean, today: string): boolean {
  return freezeWeekStart !== mondayOf(today) || !freezeUsed
}

export function calendarWeeks(today: string, weeks = 12): string[][] {
  const start = addDays(mondayOf(today), -(weeks - 1) * 7)
  const rows: string[][] = []
  for (let week = 0; week < weeks; week += 1) {
    const row: string[] = []
    for (let day = 0; day < 7; day += 1) row.push(addDays(start, week * 7 + day))
    rows.push(row)
  }
  return rows
}

export function applyPractice(state: HabitState, today: string): PracticeResult {
  let streakCount = state.streakCount
  let freezeApplied = false
  let freezeWeekStart = state.freezeWeekStart
  let freezeUsed = state.freezeUsed
  let days = state.days
  let lastDate = state.streakLastDate

  if (!state.streakLastDate) {
    streakCount = 1
    lastDate = today
  } else if (state.streakLastDate === today) {
    lastDate = today
  } else {
    const gap = daysBetween(state.streakLastDate, today)
    if (gap < 0) {
      lastDate = state.streakLastDate
    } else if (gap === 1) {
      streakCount += 1
      lastDate = today
    } else if (gap === 2 && isFreezeReady(state.freezeWeekStart, state.freezeUsed, today)) {
      days = withDay(days, addDays(today, -1), 'freeze')
      freezeApplied = true
      freezeWeekStart = mondayOf(today)
      freezeUsed = true
      streakCount += 1
      lastDate = today
    } else {
      streakCount = 1
      lastDate = today
    }
  }

  days = withDay(days, today, 'practice')

  return {
    xpEarned: XP_PER_LESSON,
    freezeApplied,
    state: {
      xp: state.xp + XP_PER_LESSON,
      streakCount,
      streakLastDate: lastDate,
      freezeWeekStart,
      freezeUsed,
      days,
    },
  }
}

function withDay(days: StreakDay[], day: string, kind: DayKind): StreakDay[] {
  const next = days.filter((entry) => entry.day !== day)
  next.push({ day, kind })
  next.sort((a, b) => a.day.localeCompare(b.day))
  return next
}

function dateFromIso(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
