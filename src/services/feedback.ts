import { friendlyDefault } from '../../shared/copy'
import { computeStats, type SpeechStats } from '../../shared/stats'

export type CoachNote = SpeechStats & {
  doneWell: string
  tryNext: string
  fallback: boolean
}

export async function requestFeedback(input: {
  prompt: string
  transcript: string
  durationSeconds: number
}): Promise<CoachNote> {
  const stats = computeStats(input.transcript, input.durationSeconds)
  const standby = friendlyDefault(input.transcript)
  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!response.ok) throw new Error('feedback unavailable')
    const data = (await response.json()) as {
      doneWell?: unknown
      tryNext?: unknown
      fallback?: unknown
    }
    const doneWell = typeof data.doneWell === 'string' && data.doneWell.trim() ? data.doneWell.trim() : standby.doneWell
    const tryNext = typeof data.tryNext === 'string' && data.tryNext.trim() ? data.tryNext.trim() : standby.tryNext
    return {
      ...stats,
      doneWell,
      tryNext,
      fallback: Boolean(data.fallback),
    }
  } catch {
    return { ...stats, ...standby, fallback: true }
  }
}
