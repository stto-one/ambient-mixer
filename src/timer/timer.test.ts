import { describe, expect, test } from 'vitest'
import { createTimer, startTimer, tickTimer, pauseTimer, resetTimer, isCompletionCueActive, shouldStartCompletionCue,setTimerDuration,} from './timer'

describe('Timer', () => {
  test('creates an inactive timer with the configured duration', () => {
    const timer = createTimer(25)

    expect(timer).toEqual({
      durationMinutes: 25,
      remainingSeconds: 1500,
      isRunning: false,
    })
  })

  test('starts an inactive timer without changing its remaining time', () => {
    const timer = createTimer(25)
    const startedTimer = startTimer(timer)

    expect(startedTimer).toEqual({
      durationMinutes: 25,
      remainingSeconds: 1500,
      isRunning: true,
    })
  })

  test('reduces remaining time by one second when running', () => {
  const timer = createTimer(25)
  const startedTimer = startTimer(timer)

  const tickedTimer = tickTimer(startedTimer)

  expect(tickedTimer).toEqual({
    durationMinutes: 25,
    remainingSeconds: 1499,
    isRunning: true,
    })
  })

test('does not reduce remaining time when the timer is not running', () => {
  const timer = createTimer(25)
  const tickedTimer = tickTimer(timer)

  expect(tickedTimer).toEqual({
    durationMinutes: 25,
    remainingSeconds: 1500,
    isRunning: false,
    })
  })

test('pauses a running timer and preserves remaining time', () => {
  const timer = createTimer(25)
  const startedTimer = startTimer(timer)
  const tickedTimer = tickTimer(startedTimer)

  const pausedTimer = pauseTimer(tickedTimer)
  const tickAfterPause = tickTimer(pausedTimer)

  expect(tickAfterPause).toEqual({
    durationMinutes: 25,
    remainingSeconds: 1499,
    isRunning: false,
    })
  })

test('resumes a paused timer from its preserved remaining time', () => {
  const timer = createTimer(25)
  const startedTimer = startTimer(timer)
  const tickedTimer = tickTimer(startedTimer)

  const pausedTimer = pauseTimer(tickedTimer)
  const tickAfterPause = tickTimer(pausedTimer)

  const resumedTimer = startTimer(pausedTimer)
  const tickAfterResume = tickTimer(resumedTimer)

  expect(tickAfterPause).toEqual({
    durationMinutes: 25,
    remainingSeconds: 1499,
    isRunning: false,
    })

  expect(resumedTimer).toEqual({
    durationMinutes: 25,
    remainingSeconds: 1499,
    isRunning: true,
    })

  expect(tickAfterResume).toEqual({
    durationMinutes: 25,
    remainingSeconds: 1498,
    isRunning: true,
    })
  })

test('does not reduce remaining time below zero', () => {
  const timer = createTimer(0)
  const startedTimer = startTimer(timer)

  const tickedTimer = tickTimer(startedTimer)

  expect(tickedTimer).toEqual({
    durationMinutes: 0,
    remainingSeconds: 0,
    isRunning: true,
  })
})

test('activie timer stops at zero', () => {
  const timer = {
  durationMinutes: 1,
  remainingSeconds: 1,
  isRunning: true,
}
  const tickedTimer = tickTimer(timer)

  expect(tickedTimer).toEqual({
    durationMinutes: 1,
    remainingSeconds: 0,
    isRunning: false,
  })
})

test('reset a running timer back to its original time and inactive state', () => {
  const timer = createTimer(25)
  const startedTimer = startTimer(timer)
  const tickedTimer = tickTimer(startedTimer)

  const resetTimerState = resetTimer(tickedTimer)
  const tickAfterReset = tickTimer(resetTimerState)

  expect(tickedTimer).toEqual({
    durationMinutes: 25,
    remainingSeconds: 1499,
    isRunning: true,
    })

  expect(tickAfterReset).toEqual({
    durationMinutes: 25,
    remainingSeconds: 1500,
    isRunning: false,
    })

    expect(tickAfterReset).toEqual({
    durationMinutes: 25,
    remainingSeconds: 1500,
    isRunning: false,
    })
  })

test('completion cue becomes active with five seconds remaining', () => {
  const timer = {
    durationMinutes: 1,
    remainingSeconds: 5,
    isRunning: true,
  }

  expect(isCompletionCueActive(timer)).toBe(true)
})

test('completion cue is not active before the final five seconds', () => {
  const timer = {
    durationMinutes: 1,
    remainingSeconds: 6,
    isRunning: true,
  }

  expect(isCompletionCueActive(timer)).toBe(false)
})

test('completion cue is not active when the timer is paused', () => {
  const timer = {
    durationMinutes: 1,
    remainingSeconds: 5,
    isRunning: false,
  }

  expect(isCompletionCueActive(timer)).toBe(false)
})

test('completion cue is not active once the timer has completed', () => {
  const timer = {
    durationMinutes: 1,
    remainingSeconds: 0,
    isRunning: false,
  }

  expect(isCompletionCueActive(timer)).toBe(false)
})

test('starts completion cue exactly five seconds before completion', () => {
  const timer = {
    durationMinutes: 1,
    remainingSeconds: 5,
    isRunning: true,
  }

  expect(
    shouldStartCompletionCue(timer)
  ).toBe(true)
})

test('does not start completion cue before five seconds remaining', () => {
  const timer = {
    durationMinutes: 1,
    remainingSeconds: 6,
    isRunning: true,
  }

  expect(
    shouldStartCompletionCue(timer)
  ).toBe(false)
})

test('does not restart completion cue after the five second trigger', () => {
  const timer = {
    durationMinutes: 1,
    remainingSeconds: 4,
    isRunning: true,
  }

  expect(
    shouldStartCompletionCue(timer)
  ).toBe(false)
})

test('completion cue does not restart after the five second trigger has passed', () => {
  const timer = {
    durationMinutes: 1,
    remainingSeconds: 4,
    isRunning: true,
  }

  expect(
    shouldStartCompletionCue(timer)
  ).toBe(false)
})

test('changes the duration of an inactive timer', () => {
  const timer = createTimer(25)

  const updatedTimer = setTimerDuration(timer, 45)

  expect(updatedTimer).toEqual({
    durationMinutes: 45,
    remainingSeconds: 2700,
    isRunning: false,
  })
})

test('changes the duration of an active timer and remains running', () => {
  const timer = createTimer(25)
  const startedTimer = startTimer(timer)

  const updatedTimer = setTimerDuration(startedTimer, 45)

  expect(updatedTimer).toEqual({
    durationMinutes: 45,
    remainingSeconds: 2700,
    isRunning: true,
  })
})

test('does not reset timer when selecting the currently selected duration', () => {
  const timer = createTimer(25)
  const startedTimer = startTimer(timer)
  const tickedTimer = tickTimer(startedTimer)

  const updatedTimer =
    setTimerDuration(tickedTimer, 25)

  expect(updatedTimer).toEqual({
    durationMinutes: 25,
    remainingSeconds: 1499,
    isRunning: true,
  })
})

})