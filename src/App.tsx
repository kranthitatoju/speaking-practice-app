import { useCallback, useEffect, useState } from 'react'
import { LoginScreen } from './components/LoginScreen'
import { HomeScreen } from './components/HomeScreen'
import { LessonScreen } from './components/LessonScreen'
import { PathScreen } from './components/PathScreen'
import { ProgressScreen } from './components/ProgressScreen'
import { Shell, type Tab } from './components/Shell'
import { getLesson } from './lib/lessons'
import { getSupabase } from './lib/supabase'
import { emptySnapshot, loadSnapshot } from './services/progress'
import { EMPTY_PROFILE, PREVIEW_SESSION_KEY, type Completion, type Session, type Snapshot } from './types'

type Route =
  | { name: 'home' }
  | { name: 'path' }
  | { name: 'progress' }
  | { name: 'lesson'; lessonId: string }

function sessionFromUser(user: { id: string; email?: string | null }): Session {
  return { mode: 'supabase', userId: user.id, email: user.email ?? '' }
}

function readRoute(): Route {
  const raw = window.location.hash.replace(/^#/, '')
  if (raw === 'path' || raw === 'progress') return { name: raw }
  if (raw.startsWith('lesson/')) {
    const lessonId = decodeURIComponent(raw.slice('lesson/'.length))
    if (getLesson(lessonId)) return { name: 'lesson', lessonId }
  }
  return { name: 'home' }
}

function writeRoute(route: Route) {
  const next = route.name === 'lesson' ? `#lesson/${encodeURIComponent(route.lessonId)}` : `#${route.name}`
  if (window.location.hash !== next) window.location.hash = next
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [route, setRoute] = useState<Route>({ name: 'home' })
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      const raw = localStorage.getItem(PREVIEW_SESSION_KEY)
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Session
          if (parsed.mode === 'preview' && parsed.userId) setSession(parsed)
        } catch {
          localStorage.removeItem(PREVIEW_SESSION_KEY)
        }
      }
      setReady(true)
      return
    }

    let cancel = false
    void supabase.auth.getSession().then(({ data }) => {
      if (cancel) return
      if (data.session?.user) setSession(sessionFromUser(data.session.user))
      setReady(true)
    })
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next?.user ? sessionFromUser(next.user) : null)
    })
    return () => {
      cancel = true
      subscription.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session) return
    const apply = () => setRoute(readRoute())
    apply()
    window.addEventListener('hashchange', apply)
    return () => window.removeEventListener('hashchange', apply)
  }, [session])

  const refresh = useCallback(async (current: Session) => {
    setLoadError(null)
    try {
      setSnapshot(await loadSnapshot(current))
    } catch {
      setLoadError('Your progress did not load. You can still practice. Saving will try again.')
      setSnapshot((currentSnapshot) => currentSnapshot ?? { profile: { ...EMPTY_PROFILE }, attempts: [], streakDays: [] })
    }
  }, [])

  useEffect(() => {
    if (!session) {
      setSnapshot(null)
      return
    }
    void refresh(session)
  }, [session, refresh])

  function go(next: Route) {
    setRoute(next)
    writeRoute(next)
  }

  function handleSession(next: Session) {
    if (next.mode === 'preview') localStorage.setItem(PREVIEW_SESSION_KEY, JSON.stringify(next))
    setSession(next)
  }

  async function signOut() {
    if (session?.mode === 'supabase') await getSupabase()?.auth.signOut()
    localStorage.removeItem(PREVIEW_SESSION_KEY)
    setSession(null)
    setSnapshot(null)
    window.location.hash = ''
  }

  if (!ready) return <div className="boot">Warming up…</div>
  if (!session) return <LoginScreen onSession={handleSession} />

  const data = snapshot ?? emptySnapshot()
  const lesson = route.name === 'lesson' ? getLesson(route.lessonId) : undefined
  const tab: Tab = route.name === 'path' || route.name === 'progress' ? route.name : 'home'

  let body = <HomeScreen snapshot={data} preview={session.mode === 'preview'} onStart={(lessonId) => go({ name: 'lesson', lessonId })} />
  if (route.name === 'path') body = <PathScreen snapshot={data} onOpen={(lessonId) => go({ name: 'lesson', lessonId })} />
  else if (route.name === 'progress') body = <ProgressScreen snapshot={data} />
  else if (route.name === 'lesson' && lesson) {
    body = (
      <LessonScreen
        session={session}
        lesson={lesson}
        snapshot={data}
        onBack={() => {
          void refresh(session)
          go({ name: 'home' })
        }}
        onSaved={(completion: Completion) => setSnapshot(completion.snapshot)}
      />
    )
  }

  return (
    <Shell
      email={session.email}
      preview={session.mode === 'preview'}
      tab={tab}
      showNav={route.name !== 'lesson'}
      onTab={(next) => go({ name: next })}
      onSignOut={() => void signOut()}
    >
      {loadError ? <p className="banner">{loadError}</p> : null}
      {snapshot ? body : <div className="boot">Opening your practice…</div>}
    </Shell>
  )
}
