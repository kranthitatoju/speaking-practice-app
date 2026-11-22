import { useState, type FormEvent } from 'react'
import { isSupabaseConfigured, getSupabase } from '../lib/supabase'
import type { Session } from '../types'
import { FlameIcon } from './icons'

type Mode = 'login' | 'signup'

export function LoginScreen({ onSession }: { onSession: (session: Session) => void }) {
  const configured = isSupabaseConfigured()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const supabase = getSupabase()
    if (!supabase) return
    setBusy(true)
    setError(null)
    setInfo(null)
    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({ email: email.trim(), password })
        if (signUpError) throw signUpError
        if (data.session?.user) {
          onSession({
            mode: 'supabase',
            userId: data.session.user.id,
            email: data.session.user.email ?? email.trim(),
          })
          return
        }
        setInfo('Account created. Confirm the email if your inbox asks, then log in.')
        setMode('login')
        return
      }
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (signInError) throw signInError
      if (!data.session?.user) throw new Error('Check your email to confirm the account, then log in.')
      onSession({
        mode: 'supabase',
        userId: data.session.user.id,
        email: data.session.user.email ?? email.trim(),
      })
    } catch (caught) {
      setError(friendlyAuthError(caught))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth">
      <div className="brand-lockup">
        <span className="flame-badge">
          <FlameIcon />
        </span>
        <p className="brand">ember</p>
      </div>
      <h1>A little speaking practice. You can&apos;t fail it.</h1>
      <p className="lede">Show up, talk for a minute, and keep the flame. Every finish counts.</p>

      {configured ? (
        <form className="card form" onSubmit={onSubmit}>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              required
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={6}
              value={password}
              required
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error ? <p className="banner">{error}</p> : null}
          {info ? <p className="banner">{info}</p> : null}
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'One moment…' : mode === 'signup' ? 'Create account' : 'Log in'}
          </button>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setError(null)
              setInfo(null)
            }}
          >
            {mode === 'login' ? 'Need an account? Create one' : 'Already have one? Log in'}
          </button>
        </form>
      ) : (
        <section className="card">
          <h2>Supabase isn&apos;t connected yet</h2>
          <p>You can still walk the whole practice on this device. Nothing leaves the browser until you add keys.</p>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => onSession({ mode: 'preview', userId: 'preview', email: 'preview@local' })}
          >
            Preview on this device
          </button>
        </section>
      )}
    </main>
  )
}

function friendlyAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  const lower = message.toLowerCase()
  if (lower.includes('invalid login')) return 'That email and password did not match. Try again, or create an account.'
  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return 'That email already has an account. Log in instead.'
  }
  return message || 'Something got in the way. Try again in a moment.'
}
