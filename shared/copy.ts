export function friendlyDefault(transcript: string): { doneWell: string; tryNext: string } {
  const words = transcript.trim() ? transcript.trim().split(/\s+/).length : 0
  if (words < 8) {
    return {
      doneWell: 'You opened the mic and gave it a moment. Starting is the hard part.',
      tryNext: 'Next time, say your first sentence a little slower, then keep going.',
    }
  }
  return {
    doneWell: 'You showed up and said it out loud. That is the whole practice.',
    tryNext: 'Next time, add one sentence about why this matters to you.',
  }
}

export function completionHeadline(streakCount: number, freezeApplied: boolean): string {
  if (freezeApplied) return 'A freeze covered the missed day. Your streak is still here.'
  if (streakCount <= 1) return 'You showed up. That is the win.'
  if (streakCount < 7) return `${streakCount} days in a row.`
  return `${streakCount} days. The habit is taking root.`
}
