# Ember

A short daily speaking practice. You talk for under a few minutes, get one warm note, and the streak moves forward. Finishing is the point. There is no score.

## Stack

- React + Vite
- Supabase Auth and Postgres, with row-level security
- Vercel for the site and one serverless function
- Browser Web Speech API for live transcription (`src/services/transcribe.ts`)
- Groq, OpenAI-compatible, for the coach note (`server/getFeedback.ts`)

Pace (words per minute) and filler-word counts are computed in `shared/stats.ts`. The model never invents them. If the model call fails, the lesson still completes and still awards XP.

## What you need

- Node.js 20 or newer
- A free [Supabase](https://supabase.com) project
- A free [Groq](https://console.groq.com) API key
- A [Vercel](https://vercel.com) account when you want it online

## Run it locally

```bash
cd speaking-practice-app
cp .env.example .env.local
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

Until `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are real, the login screen offers **Preview on this device**. Progress stays in this browser.

`npm run dev` also serves `POST /api/feedback`. Put `GROQ_API_KEY` in `.env.local` (no `VITE_` prefix) and the coach note uses Groq. Without that key, the lesson still finishes with a standby note.

Live transcription needs Chrome or Edge. Other browsers can type the words and still finish.

## Create the database

1. In Supabase, create a project.
2. Open **SQL Editor**, paste the whole file `supabase/migrations/001_init.sql`, and run it.
3. Open **Project Settings → API** and copy the project URL and the `anon` public key into `.env.local`:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

4. Under **Authentication → Sign In / Providers → Email**, you can turn off **Confirm email** if you want to log in immediately without an inbox round trip.
5. Restart `npm run dev`, then create an account in the app.

The anon key is visible in the browser. That is expected. The SQL turns on row-level security so a signed-in person can only read their own rows, and XP is awarded only by the `complete_lesson` function.

## Groq model

`server/getFeedback.ts` is the only file that calls a model.

- Default model: `llama-3.3-70b-versatile` (Groq's current Llama 3.3 model).
- As of November 2026, that model is enterprise-only on Groq. Free-tier keys were disconnected from Llama chat models on August 16, 2026.
- If Groq rejects that model, `getFeedback()` retries `openai/gpt-oss-20b` once.
- To skip the retry, set `GROQ_MODEL=openai/gpt-oss-20b` in `.env.local` and in Vercel.

To move the coach to Claude later, replace the body of `getFeedback()` and keep the same return shape: `{ doneWell, tryNext }`.

To move transcription to Deepgram later, replace `src/services/transcribe.ts` and keep `startTranscription()`.

## Deploy on Vercel

From this folder, with the [Vercel CLI](https://vercel.com/docs/cli) logged in:

```bash
npx vercel
npx vercel --prod
```

In the Vercel project, set these environment variables for **Production** and **Preview**, then redeploy. The `VITE_` values are baked in at build time, so changing them requires a new deploy.

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GROQ_API_KEY`
- `GROQ_MODEL` (optional)

In Supabase **Authentication → URL Configuration**, set **Site URL** to your Vercel URL so confirmation emails land back in the app.

## Checks

```bash
npm test
npm run build
```

## Daily loop

Five units, five lessons each, unlocked in order. The prompts live in `src/lib/lessons.ts`.

Every finish awards 20 XP. One streak freeze is available each week and is used automatically when you miss exactly one day. There is no score out of 100.
