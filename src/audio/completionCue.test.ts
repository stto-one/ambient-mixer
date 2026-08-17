import {
  describe,
  expect,
  test,
} from 'vitest'

import {
  shouldStartCompletionCue,
} from './completionCue'

import type {
  TimerState,
} from '../timer/timer'

describe('Completion cue', () => {
  const createTimerState = (
    remainingSeconds: number,
    isRunning = true
  ): TimerState => ({
    durationMinutes: 25,
    remainingSeconds,
    isRunning,
  })

  test('starts when a running timer reaches five seconds remaining', () => {
    const timer =
      createTimerState(5)

    expect(
      shouldStartCompletionCue(timer)
    ).toBe(true)
  })

  test('does not start before five seconds remaining', () => {
    const timer =
      createTimerState(6)

    expect(
      shouldStartCompletionCue(timer)
    ).toBe(false)
  })

  test('does not start after five seconds remaining', () => {
    const timer =
      createTimerState(4)

    expect(
      shouldStartCompletionCue(timer)
    ).toBe(false)
  })

  test('does not start when paused at five seconds remaining', () => {
    const timer =
      createTimerState(
        5,
        false
      )

    expect(
      shouldStartCompletionCue(timer)
    ).toBe(false)
  })

  test('does not start when the timer reaches zero', () => {
    const timer =
      createTimerState(0)

    expect(
      shouldStartCompletionCue(timer)
    ).toBe(false)
  })
})