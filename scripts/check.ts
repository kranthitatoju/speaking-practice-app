import assert from 'node:assert/strict'
import {
  addDays,
  applyPractice,
  calendarWeeks,
  emptyHabit,
  isFreezeReady,
  mondayOf,
} from '../shared/habit'
import { computeStats, countFillers } from '../shared/stats'

const saturday = '2026-11-21'
assert.equal(mondayOf(saturday), '2026-11-16')
assert.equal(mondayOf('2026-11-16'), '2026-11-16')
assert.equal(mondayOf('2026-11-22'), '2026-11-16')
assert.equal(addDays('2026-11-30', 1), '2026-12-01')

const oneWeek = calendarWeeks(saturday, 1)
assert.deepEqual(oneWeek, [['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22']])

let result = applyPractice(emptyHabit(), saturday)
assert.equal(result.state.streakCount, 1)
assert.equal(result.state.xp, 20)
assert.equal(result.freezeApplied, false)
assert.equal(isFreezeReady(result.state.freezeWeekStart, result.state.freezeUsed, saturday), true)

result = applyPractice(result.state, saturday)
assert.equal(result.state.streakCount, 1)
assert.equal(result.state.xp, 40)

result = applyPractice(result.state, '2026-11-22')
assert.equal(result.state.streakCount, 2)

result = applyPractice(result.state, '2026-11-24')
assert.equal(result.freezeApplied, true)
assert.equal(result.state.streakCount, 3)
assert.equal(result.state.freezeWeekStart, '2026-11-23')
assert.ok(result.state.days.some((day) => day.day === '2026-11-23' && day.kind === 'freeze'))
assert.equal(isFreezeReady(result.state.freezeWeekStart, result.state.freezeUsed, '2026-11-24'), false)

result = applyPractice(result.state, '2026-11-26')
assert.equal(result.freezeApplied, false)
assert.equal(result.state.streakCount, 1)

result = applyPractice(result.state, '2026-11-30')
assert.equal(result.state.streakCount, 1)
assert.equal(isFreezeReady(result.state.freezeWeekStart, result.state.freezeUsed, '2026-11-30'), true)

result = applyPractice(result.state, '2026-12-02')
assert.equal(result.freezeApplied, true)
assert.equal(result.state.streakCount, 2)
assert.ok(result.state.days.some((day) => day.day === '2026-12-01' && day.kind === 'freeze'))

const backward = applyPractice(result.state, '2026-11-21')
assert.equal(backward.state.streakCount, result.state.streakCount)
assert.equal(backward.state.streakLastDate, result.state.streakLastDate)
assert.equal(backward.state.xp, result.state.xp + 20)

assert.equal(countFillers('Um, I like, you know, the likely path'), 3)
assert.equal(countFillers('uh uh basically'), 3)
assert.equal(countFillers('you know you know'), 2)
assert.equal(countFillers('likely'), 0)

const sixtyWords = Array.from({ length: 60 }, () => 'word').join(' ')
assert.equal(computeStats(sixtyWords, 30).wpm, 120)
assert.equal(computeStats(sixtyWords, 0).wpm, 0)
assert.equal(computeStats('   ', 20).wordCount, 0)

console.log('habit and stats checks passed')
