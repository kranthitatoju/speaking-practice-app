import { calendarWeeks, localToday } from '../../shared/habit'
import { getLesson } from '../lib/lessons'
import type { Attempt, Snapshot } from '../types'

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function ProgressScreen({ snapshot }: { snapshot: Snapshot }) {
  const today = localToday()
  const weeks = calendarWeeks(today, 12)
  const kinds = new Map(snapshot.streakDays.map((day) => [day.day, day.kind]))
  const recent = [...snapshot.attempts].sort((a, b) => a.completedAt.localeCompare(b.completedAt)).slice(-12)

  return (
    <main className="progress-page">
      <h1>Progress</h1>
      <p className="lede">
        {snapshot.profile.streakCount === 0
          ? 'Your calendar fills in when you finish a lesson.'
          : `${snapshot.profile.streakCount}-day streak. Missing one day can use this week’s freeze.`}
      </p>

      <section className="card">
        <h2>Streak calendar</h2>
        <div className="weekday-row" aria-hidden="true">
          {WEEKDAYS.map((label, index) => (
            <span key={`${label}-${index}`}>{label}</span>
          ))}
        </div>
        <div className="calendar">
          {weeks.flat().map((day) => {
            const kind = day > today ? undefined : kinds.get(day)
            const classes = ['day']
            if (day > today) classes.push('future')
            else if (kind) classes.push(kind)
            if (day === today) classes.push('today')
            return <span key={day} className={classes.join(' ')} title={day} />
          })}
        </div>
        <div className="legend">
          <span><i className="swatch practice" /> Practice</span>
          <span><i className="swatch freeze" /> Freeze</span>
          <span><i className="swatch today" /> Today</span>
        </div>
      </section>

      <section className="card">
        <h2>Filler words</h2>
        <p className="quiet">Over your recent practices. Noticing them is enough. This is not a grade.</p>
        {recent.length === 0 ? (
          <p>Finish a lesson and this chart starts.</p>
        ) : (
          <FillerChart attempts={recent} />
        )}
      </section>

      {recent.length > 0 ? (
        <section className="card">
          <h2>Recent notes</h2>
          <ul className="attempt-list">
            {[...recent].reverse().slice(0, 5).map((attempt) => {
              const lesson = getLesson(attempt.lessonId)
              return (
                <li key={attempt.id}>
                  <strong>{lesson?.title ?? 'Practice'}</strong>
                  <span>
                    {attempt.localDate} · {attempt.fillerCount} filler words
                    {attempt.wpm > 0 ? ` · ${attempt.wpm} wpm` : ''}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
    </main>
  )
}

function FillerChart({ attempts }: { attempts: Attempt[] }) {
  const max = Math.max(1, ...attempts.map((attempt) => attempt.fillerCount))
  const width = 320
  const height = 120
  const gap = attempts.length > 1 ? 8 : 0
  const barWidth = (width - gap * (attempts.length - 1)) / attempts.length

  return (
    <svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Filler words in recent practices">
      {attempts.map((attempt, index) => {
        const barHeight = attempt.fillerCount === 0 ? 4 : Math.max(8, (attempt.fillerCount / max) * 96)
        const x = index * (barWidth + gap)
        const y = height - 16 - barHeight
        return (
          <g key={attempt.id}>
            <title>{`${attempt.localDate}: ${attempt.fillerCount} filler words`}</title>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx="6" className={attempt.fillerCount === 0 ? 'zero' : ''} />
          </g>
        )
      })}
    </svg>
  )
}
