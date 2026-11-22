import type { ReactNode } from 'react'
import { ChartIcon, FlameIcon, HomeIcon, PathIcon } from './icons'

export type Tab = 'home' | 'path' | 'progress'

const TABS: { id: Tab; label: string; icon: typeof HomeIcon }[] = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'path', label: 'Path', icon: PathIcon },
  { id: 'progress', label: 'Progress', icon: ChartIcon },
]

export function Shell({
  email,
  preview,
  tab,
  showNav,
  onTab,
  onSignOut,
  children,
}: {
  email: string
  preview: boolean
  tab: Tab
  showNav: boolean
  onTab: (tab: Tab) => void
  onSignOut: () => void
  children: ReactNode
}) {
  return (
    <div className={showNav ? 'shell with-nav' : 'shell'}>
      <header className="topbar">
        <button className="brand-button" type="button" onClick={() => onTab('home')}>
          <FlameIcon size={22} />
          <span>ember</span>
        </button>
        <div className="top-actions">
          <span className="who">{preview ? 'This device' : email}</span>
          <button className="text-button" type="button" onClick={onSignOut}>
            Log out
          </button>
        </div>
      </header>
      <div className="stage">{children}</div>
      {showNav ? (
        <nav className="nav" aria-label="Main">
          {TABS.map((item) => {
            const Icon = item.icon
            const current = tab === item.id
            return (
              <button
                key={item.id}
                className={current ? 'nav-button current' : 'nav-button'}
                type="button"
                aria-current={current ? 'page' : undefined}
                onClick={() => onTab(item.id)}
              >
                <Icon />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      ) : null}
    </div>
  )
}
