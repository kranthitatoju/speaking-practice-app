import { LESSONS, UNITS, isUnlocked } from '../lib/lessons'
import type { Snapshot } from '../types'
import { CheckIcon, LockIcon } from './icons'

export function PathScreen({
  snapshot,
  onOpen,
}: {
  snapshot: Snapshot
  onOpen: (lessonId: string) => void
}) {
  const completed = new Set(snapshot.attempts.map((attempt) => attempt.lessonId))
  const nextId = LESSONS.find((lesson) => !completed.has(lesson.id))?.id

  return (
    <main className="path">
      <h1>The path</h1>
      <p className="lede">Five short units. Lessons open in order. Replays still earn XP.</p>
      {UNITS.map((unit) => (
        <section key={unit.id} className="unit" data-unit={unit.id}>
          <header>
            <span className="unit-mark" aria-hidden="true" />
            <div>
              <h2>{unit.title}</h2>
              <p>{unit.blurb}</p>
            </div>
          </header>
          <ol>
            {LESSONS.filter((lesson) => lesson.unitId === unit.id).map((lesson) => {
              const unlocked = isUnlocked(lesson.id, completed)
              const done = completed.has(lesson.id)
              const current = lesson.id === nextId
              return (
                <li key={lesson.id}>
                  <button
                    className={['lesson-row', done ? 'done' : '', current ? 'current' : '', unlocked ? '' : 'locked'].join(' ')}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => onOpen(lesson.id)}
                  >
                    <span className="lesson-index">{lesson.unitIndex}</span>
                    <span>
                      <strong>{lesson.title}</strong>
                      <small>{done ? 'Practiced' : unlocked ? 'Ready' : 'Opens after the previous one'}</small>
                    </span>
                    {done ? <CheckIcon /> : unlocked ? null : <LockIcon />}
                  </button>
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </main>
  )
}
