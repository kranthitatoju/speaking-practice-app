type IconProps = { size?: number }

export function FlameIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.2 2.2c.4 2.2-.2 3.6-1.2 4.8-1 1.2-1.6 2.2-1.3 3.6.2.8.8 1.4 1.1 2.1.2.5 0 1.2-.6 1.3-.7.1-1.2-.6-1.5-1.2-.5-1.1-.2-2.2.4-3.3C8 7.8 7 6.4 7 6.4c-.8 2-2.6 3.4-2.6 6.3C4.4 16.8 7.6 21 12 21s7.6-4.2 7.6-8.3c0-3.4-2.2-5.5-3.6-7.1-.4 1.6-1.3 2.7-2.4 3.4.2-2.4-.6-4.6-1.4-6.8Z"
      />
    </svg>
  )
}

export function MicIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V20H9v2h6v-2h-2v-2.1A7 7 0 0 0 19 11h-2Z"
      />
    </svg>
  )
}

export function StopIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" />
    </svg>
  )
}

export function HomeIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 4 4 10.5V20h6v-5h4v5h6V10.5L12 4Z" />
    </svg>
  )
}

export function PathIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="7" cy="5.5" r="2.2" fill="currentColor" />
      <circle cx="17" cy="12" r="2.2" fill="currentColor" />
      <circle cx="7" cy="18.5" r="2.2" fill="currentColor" />
      <path
        d="M7 7.8c3.2 1.2 6.2 2.4 8 4.2M15 12.2C12.2 14.6 9.4 16 7 16.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ChartIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M5 19h14v2H5v-2Zm1-3h3V9H6v7Zm5 0h3V5h-3v11Zm5 0h3v-6h-3v6Z" />
    </svg>
  )
}

export function LockIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 10V8a4 4 0 1 1 8 0v2h1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h1Zm2 0h4V8a2 2 0 1 0-4 0v2Z"
      />
    </svg>
  )
}

export function CheckIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="m9.2 16.2-3.5-3.5 1.4-1.4 2.1 2.1 6.7-6.7 1.4 1.4-8.1 8.1Z" />
    </svg>
  )
}

export function SnowflakeIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M11 2h2v4.1l2.2-2.2 1.4 1.4L13.4 8.5 16.6 11H21v2h-4.4l-3.2 2.5 3.2 3.2-1.4 1.4L13 17.9V22h-2v-4.1l-2.2 2.2-1.4-1.4 3.2-3.2L7.4 13H3v-2h4.4l3.2-2.5L7.4 5.3l1.4-1.4L11 6.1V2Z"
      />
    </svg>
  )
}
