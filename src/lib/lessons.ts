export type Unit = {
  id: number
  title: string
  blurb: string
}

export type Lesson = {
  id: string
  unitId: number
  unitIndex: number
  title: string
  prompt: string
  cue: string
}

export const UNITS: Unit[] = [
  { id: 1, title: 'Introductions', blurb: 'Say who you are, simply.' },
  { id: 2, title: 'Storytelling', blurb: 'Tell a small true story.' },
  { id: 3, title: 'Explaining', blurb: 'Make one thing clear.' },
  { id: 4, title: 'Opinions', blurb: 'Say what you think.' },
  { id: 5, title: 'Handling questions', blurb: 'Answer like a person, not a script.' },
]

export const LESSONS: Lesson[] = [
  {
    id: 'u1-hello',
    unitId: 1,
    unitIndex: 1,
    title: 'Say hello',
    prompt: 'Introduce yourself in about 30 seconds. Share your name, where you are, and one thing you are into right now.',
    cue: 'A name and one true detail is plenty.',
  },
  {
    id: 'u1-from',
    unitId: 1,
    unitIndex: 2,
    title: 'Where you are from',
    prompt: 'Say where you are from and one thing you like about that place.',
    cue: 'Stay with one place. A smell, a street, or a sound is enough.',
  },
  {
    id: 'u1-morning',
    unitId: 1,
    unitIndex: 3,
    title: 'A regular morning',
    prompt: 'Describe a typical morning, from waking up to the moment your day really starts.',
    cue: 'Walk through it in order. Ordinary details are welcome.',
  },
  {
    id: 'u1-hobby',
    unitId: 1,
    unitIndex: 4,
    title: 'Something you enjoy',
    prompt: 'Talk about a hobby that makes you happy. What do you actually do, and when do you do it?',
    cue: 'Describe the activity, not why you are good at it.',
  },
  {
    id: 'u1-someone',
    unitId: 1,
    unitIndex: 5,
    title: 'Someone you know',
    prompt: 'Introduce a friend or family member as if we might meet them later.',
    cue: 'Give them a name and one habit that is theirs.',
  },
  {
    id: 'u2-win',
    unitId: 2,
    unitIndex: 1,
    title: 'A small win',
    prompt: 'Tell a short story about a small win from this week.',
    cue: 'Start with what happened, then how it felt.',
  },
  {
    id: 'u2-meal',
    unitId: 2,
    unitIndex: 2,
    title: 'A good meal',
    prompt: 'Describe a meal you loved. Where were you, and what made it good?',
    cue: 'Use one sensory detail: taste, sound, or the table.',
  },
  {
    id: 'u2-lost',
    unitId: 2,
    unitIndex: 3,
    title: 'Turned around',
    prompt: 'Share a time you got lost or mixed up, and how it ended.',
    cue: 'The ending can be ordinary. That still counts as a story.',
  },
  {
    id: 'u2-learned',
    unitId: 2,
    unitIndex: 4,
    title: 'How you learned it',
    prompt: 'Tell the story of how you learned something new, even something small.',
    cue: 'Include the moment it started to click.',
  },
  {
    id: 'u2-visit',
    unitId: 2,
    unitIndex: 5,
    title: 'Arriving somewhere',
    prompt: 'Describe a place you want to visit, and imagine the first ten minutes after you arrive.',
    cue: 'What do you notice first: light, noise, or people?',
  },
  {
    id: 'u3-job',
    unitId: 3,
    unitIndex: 1,
    title: 'Your work, simply',
    prompt: 'Explain your job or your studies to a 10-year-old.',
    cue: 'Trade the job title for what you actually do.',
  },
  {
    id: 'u3-snack',
    unitId: 3,
    unitIndex: 2,
    title: 'Make a snack',
    prompt: 'Explain how to make your favorite simple snack, step by step.',
    cue: 'Keep the steps in order. Skip the special equipment.',
  },
  {
    id: 'u3-weekend',
    unitId: 3,
    unitIndex: 3,
    title: 'What a weekend is',
    prompt: 'Explain what a weekend is for, as if to a visitor from another planet.',
    cue: 'Use an example from your own weekends.',
  },
  {
    id: 'u3-app',
    unitId: 3,
    unitIndex: 4,
    title: 'An app you use',
    prompt: 'Explain a phone app you open often, and why you open it.',
    cue: 'Describe the first screen, then the reason.',
  },
  {
    id: 'u3-game',
    unitId: 3,
    unitIndex: 5,
    title: 'Rules of a game',
    prompt: 'Explain the rules of a game you know, just enough for someone to start playing.',
    cue: 'How you win, and one rule that matters.',
  },
  {
    id: 'u4-remote',
    unitId: 4,
    unitIndex: 1,
    title: 'Remote work',
    prompt: 'Give your opinion on remote work. There is no correct side.',
    cue: 'Pick one reason and say it plainly.',
  },
  {
    id: 'u4-music',
    unitId: 4,
    unitIndex: 2,
    title: 'Learning music',
    prompt: 'Should people learn a musical instrument? Say what you think.',
    cue: 'You can be unsure. Say that, then lean one way.',
  },
  {
    id: 'u4-busy',
    unitId: 4,
    unitIndex: 3,
    title: 'A full calendar',
    prompt: 'Is a busy calendar a good thing? Share your view.',
    cue: 'Use a week you actually lived through.',
  },
  {
    id: 'u4-city',
    unitId: 4,
    unitIndex: 4,
    title: 'A city habit',
    prompt: 'What is one city habit you would keep, and one you would drop?',
    cue: 'Name both, then spend longer on the one you care about.',
  },
  {
    id: 'u4-hours',
    unitId: 4,
    unitIndex: 5,
    title: 'Morning or night',
    prompt: 'Are you a morning person or a night person? Make your case.',
    cue: 'Describe a real hour of your day, not a personality label.',
  },
  {
    id: 'u5-working',
    unitId: 5,
    unitIndex: 1,
    title: 'What are you working on?',
    prompt: 'Answer this question out loud: “What are you working on these days?”',
    cue: 'One project or one effort is enough.',
  },
  {
    id: 'u5-stuck',
    unitId: 5,
    unitIndex: 2,
    title: 'When you feel stuck',
    prompt: 'Answer this question out loud: “What do you do when you feel stuck?”',
    cue: 'Describe the first thing you actually do.',
  },
  {
    id: 'u5-choice',
    unitId: 5,
    unitIndex: 3,
    title: 'A choice you are glad about',
    prompt: 'Answer this question out loud: “Tell me about a choice you are glad you made.”',
    cue: 'What you chose, and one thing that changed after.',
  },
  {
    id: 'u5-guest',
    unitId: 5,
    unitIndex: 4,
    title: 'Showing a guest around',
    prompt: 'Answer this question out loud: “What would you show a guest in your city?”',
    cue: 'Pick one stop and say why you would take them there.',
  },
  {
    id: 'u5-better',
    unitId: 5,
    unitIndex: 5,
    title: 'Getting better',
    prompt: 'Answer this question out loud: “What is something you are getting better at?”',
    cue: 'Name it, then say how you can tell.',
  },
]

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id)
}

export function lessonNumber(id: string): number {
  return LESSONS.findIndex((lesson) => lesson.id === id) + 1
}

export function isUnlocked(lessonId: string, completed: Set<string>): boolean {
  const index = LESSONS.findIndex((lesson) => lesson.id === lessonId)
  if (index <= 0) return index === 0
  return completed.has(LESSONS[index - 1].id)
}

export function todaysLesson(completed: Set<string>): { lesson: Lesson; replay: boolean } {
  const next = LESSONS.find((lesson) => !completed.has(lesson.id))
  if (next) return { lesson: next, replay: false }
  return { lesson: LESSONS[0], replay: true }
}
