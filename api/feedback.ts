import { handleFeedback } from '../server/handleFeedback'

type ServerResponse = {
  status: (code: number) => ServerResponse
  json: (body: unknown) => void
}

export default async function handler(
  req: { method?: string; body?: unknown },
  res: ServerResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST' })
    return
  }
  try {
    const result = await handleFeedback(req.body)
    res.status(200).json(result)
  } catch {
    res.status(400).json({ error: 'Could not read that practice.' })
  }
}
