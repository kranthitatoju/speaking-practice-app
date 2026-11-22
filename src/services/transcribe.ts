/**
 * The only speech-to-text module.
 * To swap in Deepgram later, keep startTranscription() and replace this file.
 */

export type TranscriptUpdate = {
  transcript: string
  interim: string
}

export type TranscribeSession = {
  stop: () => void
}

type SpeechResult = {
  isFinal: boolean
  0: { transcript: string }
}

type RecognitionEvent = {
  resultIndex: number
  results: {
    length: number
    [index: number]: SpeechResult
  }
}

type RecognitionErrorEvent = {
  error?: string
}

type Recognition = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult: ((event: RecognitionEvent) => void) | null
  onerror: ((event: RecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

function recognitionConstructor(): (new () => Recognition) | null {
  if (typeof window === 'undefined') return null
  const host = window as Window & {
    SpeechRecognition?: new () => Recognition
    webkitSpeechRecognition?: new () => Recognition
  }
  return host.SpeechRecognition ?? host.webkitSpeechRecognition ?? null
}

export function isSpeechRecognitionSupported(): boolean {
  return recognitionConstructor() !== null
}

function errorMessage(code: string | undefined): string | null {
  if (code === 'not-allowed' || code === 'service-not-allowed') {
    return 'The microphone is blocked. Allow the mic for this site, then try again.'
  }
  if (code === 'audio-capture') {
    return 'No microphone was found. You can type what you said and still finish.'
  }
  if (code === 'network') {
    return 'Live transcription lost its connection. You can type what you said and still finish.'
  }
  if (code === 'no-speech' || code === 'aborted') return null
  return 'Live transcription paused. You can type what you said and still finish.'
}

export function startTranscription(options: {
  lang?: string
  onUpdate: (update: TranscriptUpdate) => void
  onError: (message: string) => void
}): TranscribeSession {
  const Ctor = recognitionConstructor()
  if (!Ctor) {
    options.onError('This browser can’t hear you yet. Use Chrome or Edge for live transcription.')
    return { stop() {} }
  }

  const finals: string[] = []
  let stopped = false
  let recognition: Recognition | null = null

  const publish = (interim: string) => {
    options.onUpdate({
      transcript: finals.join(' ').replace(/\s+/g, ' ').trim(),
      interim: interim.replace(/\s+/g, ' ').trim(),
    })
  }

  const start = () => {
    const next = new Ctor()
    recognition = next
    next.continuous = true
    next.interimResults = true
    next.lang = options.lang ?? 'en-US'
    next.onresult = (event) => {
      let interim = ''
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const piece = event.results[index]
        const text = piece[0]?.transcript ?? ''
        if (piece.isFinal) finals.push(text)
        else interim += text
      }
      publish(interim)
    }
    next.onerror = (event) => {
      const message = errorMessage(event.error)
      if (!message) return
      stopped = true
      options.onError(message)
    }
    next.onend = () => {
      if (stopped) return
      window.setTimeout(() => {
        if (stopped) return
        try {
          start()
        } catch {
          stopped = true
          options.onError('Live transcription paused. You can type what you said and still finish.')
        }
      }, 200)
    }
    next.start()
  }

  try {
    start()
  } catch {
    options.onError('The microphone did not start. You can type what you said and still finish.')
  }

  return {
    stop() {
      stopped = true
      recognition?.stop()
      recognition = null
    },
  }
}
