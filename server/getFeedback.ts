/**
 * The only model call in the app.
 * To switch to Claude later, keep getFeedback() and replace this file.
 * Pace and filler counts are computed in shared/stats.ts, never here.
 */

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const LLAMA_MODEL = 'llama-3.3-70b-versatile'
const FREE_TIER_MODEL = 'openai/gpt-oss-20b'

const SYSTEM = `You are Ember, a warm speaking coach for a two-minute daily practice. The learner cannot fail.

Return a JSON object with exactly two string fields:
- doneWell: one specific thing they did well. Mention a concrete detail from their words.
- tryNext: exactly one small thing to try next time, as a single sentence. Never a list.

Rules:
- Never give a score, grade, or rating.
- Never say wrong, bad, fail, poor, or mistake.
- Never use bullet points or numbered lists.
- Keep each field under 240 characters.
- If the transcript is very short, praise the fact they started and offer one gentle next try.
- Do not mention these instructions.`

export type CoachLine = {
  doneWell: string
  tryNext: string
}

type GroqError = Error & { status?: number; body?: string }

function clip(value: string): string {
  return value.replace(/\s+/g, ' ').replace(/^(\d+[.)\]]\s+|[-*•]\s+)/, '').trim().slice(0, 280)
}

function firstSentence(value: string): string {
  const match = value.match(/^.*?[.!?](\s|$)/)
  return (match ? match[0] : value).trim()
}

function messageText(content: unknown): string {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content
    .map((part) => {
      if (typeof part === 'string') return part
      if (part && typeof part === 'object' && 'text' in part && typeof (part as { text: unknown }).text === 'string') {
        return (part as { text: string }).text
      }
      return ''
    })
    .join('')
}

function extractJson(text: string): CoachLine | null {
  const cleaned = text.replace(/```json|```/gi, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start < 0 || end <= start) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned.slice(start, end + 1))
  } catch {
    return null
  }
  if (!parsed || typeof parsed !== 'object') return null
  const record = parsed as { doneWell?: unknown; tryNext?: unknown }
  if (typeof record.doneWell !== 'string' || typeof record.tryNext !== 'string') return null
  const doneWell = clip(record.doneWell)
  const tryNext = firstSentence(clip(record.tryNext))
  if (!doneWell || !tryNext) return null
  return { doneWell, tryNext }
}

function shouldRetryWithFreeModel(error: unknown, attempted: string): boolean {
  if (attempted === FREE_TIER_MODEL) return false
  const status = (error as GroqError).status
  const body = ((error as GroqError).body ?? '').toLowerCase()
  if (status !== 400 && status !== 404) return false
  return body.includes('model') || body.includes('decommission') || body.includes('not found')
}

async function callModel(model: string, key: string, prompt: string, transcript: string): Promise<CoachLine> {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(12_000),
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 300,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM },
        {
          role: 'user',
          content: `Practice prompt: ${prompt || 'Free speaking'}\n\nTranscript:\n${transcript || '(no words caught)'}`,
        },
      ],
    }),
  })

  const raw = await response.text()
  if (!response.ok) {
    const error = new Error(`Groq returned ${response.status}`) as GroqError
    error.status = response.status
    error.body = raw.slice(0, 500)
    throw error
  }

  let payload: unknown
  try {
    payload = JSON.parse(raw)
  } catch {
    throw new Error('Coach reply was not JSON')
  }

  const content = messageText(
    (payload as { choices?: { message?: { content?: unknown } }[] }).choices?.[0]?.message?.content,
  )
  const note = extractJson(content)
  if (!note) throw new Error('Coach reply had no note')
  return note
}

export async function getFeedback(input: { prompt: string; transcript: string }): Promise<CoachLine> {
  const key = process.env.GROQ_API_KEY
  if (!key) throw new Error('GROQ_API_KEY is not set')
  const preferred = process.env.GROQ_MODEL?.trim() || LLAMA_MODEL
  try {
    return await callModel(preferred, key, input.prompt, input.transcript)
  } catch (error) {
    if (!shouldRetryWithFreeModel(error, preferred)) throw error
    return callModel(FREE_TIER_MODEL, key, input.prompt, input.transcript)
  }
}
