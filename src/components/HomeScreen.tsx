import { isFreezeReady, levelMeta, localToday } from '../../shared/habit'
import { LESSONS, lessonNumber, todaysLesson, UNITS } from '../lib/lessons'
import type { Snapshot } from '../types'
import { FlameIcon, SnowflakeIcon } from './icons'

export function HomeScreen({
  snapshot,
  preview,
  onStart,
}: {
  snapshot: Snapshot
  preview: boolean
  onStart: (lessonId: string) => void
}) {
  const today = localToday()
  const completed = new Set(snapshot.attempts.map((attempt) => attempt.lessonId))
  const { lesson, replay } = todaysLesson(completed)
  const unit = UNITS.find((item) => item.id === lesson.unitId)
  const level = levelMeta(snapshot.profile.xp)
  const freezeReady = isFreezeReady(snapshot.profile.freezeWeekStart, snapshot.profile.freezeUsed, today)
  const position = lessonNumber(lesson.id)

  return (
    <main className="home">
      <section className="hero">
        <div className="flame-badge large">
          <FlameIcon size={36} />
        </div>
        <p className="streak-count">{snapshot.profile.streakCount}</p>
        <p className="streak-label">day streak</p>
        <p className="quiet">
          {snapshot.profile.streakCount === 0 ? 'Light it today. One short practice is the whole goal.' : 'You came back. That is the habit.'}
        </p>
        <p className={freezeReady ? 'pill ready' : 'pill used'}>
          <SnowflakeIcon />
          {freezeReady ? '1 freeze ready this week' : 'Freeze used this week'}
        </p>
      </section>

      <section className="card level-card">
        <div className="row-spread">
          <strong>
            Level {level.level} · {level.name}
          </strong>
          <span>{snapshot.profile.xp} XP</span>
        </div>
        <div className="bar" aria-hidden="true">
          <span style={{ width: `${level.into}%` }} />
        </div>
        <p className="quiet">{100 - level.into} XP to the next level</p>
      </section>

      <section className="card today-card">
        <p className="eyebrow">{replay ? 'Path complete' : `Lesson ${position} of ${LESSONS.length}`}</p>
        <h1>{replay ? 'Practice again' : "Today's practice"}</h1>
        <p className="unit-name">{unit?.title}</p>
        <h2>{lesson.title}</h2>
        <p>{lesson.prompt}</p>
        <button className="btn btn-primary" type="button" onClick={() => onStart(lesson.id)}>
          {replay ? 'Speak it again' : 'Start today’s practice'}
        </button>
      </section>

      {preview ? (
        <p className="quiet preview-note">
          Preview stays in this browser. Add your Supabase keys and the same practice is kept on your account.
        </p>
      ) : null}
    </main>
  )
}
