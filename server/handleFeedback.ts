import { friendlyDefault } from '../shared/copy'
import { computeStats } from '../shared/stats'
import { getFeedback } from './getFeedback'

export type FeedbackResponse = {
  doneWell: string
  tryNext: string
  wpm: number
  fillerCount: number
  wordCount: number
  fallback: boolean
}

function asRecord(body: unknown): Record<string, unknown> {
  if (typeof body === 'string') {
    const parsed: unknown = JSON.parse(body)
    if (!parsed || typeof parsed !== 'object') throw new Error('bad body')
    return parsed as Record<string, unknown>
  }
  if (!body || typeof body !== 'object') throw new Error('bad body')
  return body as Record<string, unknown>
}

export async function handleFeedback(body: unknown): Promise<FeedbackResponse> {
  const record = asRecord(body)
  const transcript = typeof record.transcript === 'string' ? record.transcript.slice(0, 8000) : ''
  const prompt = typeof record.prompt === 'string' ? record.prompt.slice(0, 500) : ''
  const durationSeconds =
    typeof record.durationSeconds === 'number' && Number.isFinite(record.durationSeconds)
      ? Math.max(0, Math.min(record.durationSeconds, 180))
      : 0
  const stats = computeStats(transcript, durationSeconds)
  try {
    const note = await getFeedback({ prompt, transcript })
    return { ...stats, ...note, fallback: false }
  } catch {
    return { ...stats, ...friendlyDefault(transcript), fallback: true }
  }
}
