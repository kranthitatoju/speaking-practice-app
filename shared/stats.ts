const PHRASES = ['you know', 'i mean', 'kind of', 'sort of']
const WORDS = ['um', 'uh', 'er', 'ah', 'hmm', 'like', 'basically', 'actually', 'literally']

export type SpeechStats = {
  wordCount: number
  wpm: number
  fillerCount: number
}

export function countWords(transcript: string): number {
  const trimmed = transcript.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

export function countFillers(transcript: string): number {
  let text = transcript.toLowerCase()
  let count = 0
  for (const phrase of PHRASES) {
    const pattern = new RegExp(`\\b${phrase}\\b`, 'g')
    count += text.match(pattern)?.length ?? 0
    text = text.replace(pattern, ' ')
  }
  for (const word of WORDS) {
    const pattern = new RegExp(`\\b${word}\\b`, 'g')
    count += text.match(pattern)?.length ?? 0
  }
  return count
}

export function computeStats(transcript: string, durationSeconds: number): SpeechStats {
  const wordCount = countWords(transcript)
  const safeDuration = Number.isFinite(durationSeconds) ? Math.max(0, durationSeconds) : 0
  const wpm = safeDuration > 0 ? Math.round(wordCount / (safeDuration / 60)) : 0
  return {
    wordCount,
    wpm,
    fillerCount: countFillers(transcript),
  }
}
