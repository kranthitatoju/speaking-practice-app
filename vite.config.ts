import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function feedbackDevPlugin(): Plugin {
  return {
    name: 'ember-feedback-dev',
    configureServer(server) {
      server.middlewares.use('/api/feedback', (req, res, next) => {
        if (req.method !== 'POST') {
          next()
          return
        }
        const chunks: Buffer[] = []
        req.on('data', (chunk: Buffer | string) => {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
        })
        req.on('end', () => {
          void (async () => {
            try {
              const mod = (await server.ssrLoadModule('/server/handleFeedback.ts')) as {
                handleFeedback: (body: unknown) => Promise<unknown>
              }
              const raw = Buffer.concat(chunks).toString('utf8')
              const body: unknown = raw ? JSON.parse(raw) : {}
              const result = await mod.handleFeedback(body)
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(result))
            } catch {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Could not read that practice.' }))
            }
          })()
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (env.GROQ_API_KEY) process.env.GROQ_API_KEY = env.GROQ_API_KEY
  if (env.GROQ_MODEL) process.env.GROQ_MODEL = env.GROQ_MODEL
  return {
    plugins: [react(), feedbackDevPlugin()],
    server: { port: 5173 },
  }
})
