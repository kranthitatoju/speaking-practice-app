import { useEffect, useRef, useState } from 'react'
import { completionHeadline } from '../../shared/copy'
import { levelFromXp, levelMeta } from '../../shared/habit'
import type { Lesson } from '../lib/lessons'
import { UNITS } from '../lib/lessons'
import { requestFeedback, type CoachNote } from '../services/feedback'
import { completePractice } from '../services/progress'
import { isSpeechRecognitionSupported, startTranscription, type TranscribeSession } from '../services/transcribe'
import type { Completion, Session, Snapshot } from '../types'
import { MicIcon, StopIcon } from './icons'

type Phase = 'idle' | 'recording' | 'review' | 'reflecting' | 'done'

export function LessonScreen({
  session,
  lesson,
  snapshot,
  onBack,
  onSaved,
}: {
  session: Session
  lesson: Lesson
  snapshot: Snapshot
  onBack: () => void
  onSaved: (completion: Completion) => void
}) {
  const supported = isSpeechRecognitionSupported()
  const [phase, setPhase] = useState<Phase>(supported ? 'idle' : 'review')
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [speechError, setSpeechError] = useState<string | null>(
    supported ? null : 'This browser can’t hear you yet. Chrome or Edge can transcribe live. You can type the words and still finish.',
  )
  const [saveError, setSaveError] = useState<string | null>(null)
  const [completion, setCompletion] = useState<Completion | null>(null)
  const [note, setNote] = useState<CoachNote | null>(null)
  const sessionRef = useRef<TranscribeSession | null>(null)
  const startedAt = useRef(0)
  const elapsedRef = useRef(0)
  const noteRef = useRef<CoachNote | null>(null)

  useEffect(() => {
    return () => sessionRef.current?.stop()
  }, [])

  useEffect(() => {
    if (phase !== 'recording') return
    const id = window.setInterval(() => {
      const seconds = Math.min(90, Math.floor((Date.now() - startedAt.current) / 1000))
      elapsedRef.current = seconds
      setElapsed(seconds)
      if (seconds >= 90) stopRecording()
    }, 200)
    return () => window.clearInterval(id)
  }, [phase])

  const unit = UNITS.find((item) => item.id === lesson.unitId)
  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0
  const practicedBefore = snapshot.attempts.some((attempt) => attempt.lessonId === lesson.id)
  const ring = Math.min(100, (elapsed / 90) * 100)

  function begin() {
    sessionRef.current?.stop()
    setSpeechError(null)
    setSaveError(null)
    setTranscript('')
    setInterim('')
    setElapsed(0)
    elapsedRef.current = 0
    startedAt.current = Date.now()
    setPhase('recording')
    sessionRef.current = startTranscription({
      onUpdate: (update) => {
        setTranscript(update.transcript)
        setInterim(update.interim)
      },
      onError: (message) => {
        setSpeechError(message)
        sessionRef.current?.stop()
        sessionRef.current = null
        setInterim('')
        setPhase('review')
      },
    })
  }

  function stopRecording() {
    sessionRef.current?.stop()
    sessionRef.current = null
    setInterim('')
    setPhase('review')
  }

  async function finish() {
    setPhase('reflecting')
    setSaveError(null)
    const coach =
      noteRef.current ??
      (await requestFeedback({
        prompt: lesson.prompt,
        transcript,
        durationSeconds: elapsedRef.current,
      }))
    noteRef.current = coach
    setNote(coach)
    try {
      const saved = await completePractice(session, {
        lessonId: lesson.id,
        transcript,
        wpm: coach.wpm,
        fillerCount: coach.fillerCount,
        doneWell: coach.doneWell,
        tryNext: coach.tryNext,
        durationSeconds: elapsedRef.current,
      })
      setCompletion(saved)
      onSaved(saved)
      setPhase('done')
    } catch {
      setSaveError('Your note is ready, but the streak did not save. Tap finish again.')
      setPhase('review')
    }
  }

  function practiceAgain() {
    noteRef.current = null
    setNote(null)
    setCompletion(null)
    setTranscript('')
    setInterim('')
    setElapsed(0)
    elapsedRef.current = 0
    setSaveError(null)
    setSpeechError(supported ? null : speechError)
    setPhase(supported ? 'idle' : 'review')
  }

  return (
    <main className="lesson">
      <button className="text-button back" type="button" onClick={onBack}>
        Back
      </button>
      <p className="eyebrow">
        {unit?.title} · {lesson.unitIndex} of 5
      </p>
      <h1>{lesson.title}</h1>

      {phase !== 'done' ? (
        <>
          <p className="prompt">{lesson.prompt}</p>
          <p className="cue">{lesson.cue}</p>
          {practicedBefore ? <p className="quiet">You have done this one. Doing it again still counts.</p> : null}
          {speechError ? <p className="banner">{speechError}</p> : null}
          {saveError ? <p className="banner">{saveError}</p> : null}
        </>
      ) : null}

      {phase === 'idle' ? (
        <div className="record-block">
          <div className="mic-wrap" style={{ ['--p' as string]: 0 }}>
            <button className="mic" type="button" onClick={begin} aria-label="Start recording">
              <MicIcon size={32} />
            </button>
          </div>
          <p className="quiet">Aim for 30–90 seconds. Stopping early still counts.</p>
          <button className="text-button" type="button" onClick={() => setPhase('review')}>
            Or type it
          </button>
        </div>
      ) : null}

      {phase === 'recording' ? (
        <div className="record-block">
          <div className="mic-wrap" style={{ ['--p' as string]: ring }}>
            <button className="mic recording" type="button" onClick={stopRecording} aria-label="Stop recording" aria-pressed="true">
              <StopIcon />
            </button>
          </div>
          <p className="timer">{formatClock(elapsed)}</p>
          <p className="quiet">{wordCount} words · stops itself at 1:30</p>
          <div className="transcript" aria-live="polite">
            {transcript || interim ? (
              <>
                {transcript} {interim ? <em>{interim}</em> : null}
              </>
            ) : (
              <span className="quiet">Listening…</span>
            )}
          </div>
        </div>
      ) : null}

      {phase === 'review' || phase === 'reflecting' ? (
        <div className="review">
          <label>
            What you said
            <textarea
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
              rows={7}
              placeholder="The words can be imperfect. Finish anyway."
            />
          </label>
          <p className="quiet">
            {wordCount} words
            {elapsed > 0 ? ` · ${formatClock(elapsed)}` : ''}
          </p>
          <button className="btn btn-primary" type="button" onClick={() => void finish()} disabled={phase === 'reflecting'}>
            {phase === 'reflecting' ? 'Catching one good thing you did…' : saveError ? 'Save my progress' : 'Finish and get a note'}
          </button>
          {supported ? (
            <button className="btn btn-ghost" type="button" onClick={begin} disabled={phase === 'reflecting'}>
              Record a new take
            </button>
          ) : null}
        </div>
      ) : null}

      {phase === 'done' && completion && note ? (
        <DonePanel
          completion={completion}
          note={note}
          onHome={onBack}
          onAgain={practiceAgain}
        />
      ) : null}
    </main>
  )
}

function DonePanel({
  completion,
  note,
  onHome,
  onAgain,
}: {
  completion: Completion
  note: CoachNote
  onHome: () => void
  onAgain: () => void
}) {
  const before = levelFromXp(completion.profile.xp - completion.xpEarned)
  const after = levelMeta(completion.profile.xp)
  return (
    <section className="done rise">
      <p className="done-kicker">Practice complete</p>
      <h2>{completionHeadline(completion.profile.streakCount, completion.freezeApplied)}</h2>
      <div className="chips">
        <span className="chip">+{completion.xpEarned} XP</span>
        <span className="chip">{completion.profile.streakCount}-day streak</span>
      </div>
      {after.level > before ? (
        <p className="level-up">
          Level {after.level} · {after.name}
        </p>
      ) : null}
      <article className="card note-card">
        <p className="eyebrow">One thing you did well</p>
        <p>{note.doneWell}</p>
      </article>
      <article className="card note-card">
        <p className="eyebrow">One thing to try next time</p>
        <p>{note.tryNext}</p>
      </article>
      <div className="stats">
        <div>
          <strong>{note.wpm > 0 ? note.wpm : '—'}</strong>
          <span>{note.wpm > 0 ? 'words per minute' : 'Pace shows up when the timer runs'}</span>
        </div>
        <div>
          <strong>{note.fillerCount}</strong>
          <span>filler words noticed</span>
        </div>
      </div>
      <p className="quiet">A snapshot, not a score. Finishing is the practice.</p>
      {note.fallback ? <p className="quiet">The coach used a standby note this time. Your XP still counts.</p> : null}
      <button className="btn btn-primary" type="button" onClick={onHome}>
        Back home
      </button>
      <button className="btn btn-ghost" type="button" onClick={onAgain}>
        Practice again
      </button>
    </section>
  )
}

function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes}:${rest.toString().padStart(2, '0')}`
}
