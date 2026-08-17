import {
  describe,
  expect,
  test,
} from 'vitest'

import {
  createFocusCycle,
  setBreakDuration,
  setFocusDuration,
  setTotalSessions,
  transitionAfterCompletion,
} from './focusCycle'

describe('Focus cycle', () => {
  test('creates a single-session focus cycle by default', () => {
    const cycle = createFocusCycle(
      25,
      null
    )

    expect(cycle).toEqual({
      phase: 'focus',
      focusDurationMinutes: 25,
      breakDurationMinutes: null,
      currentSession: 1,
      totalSessions: 1,
      timer: {
        durationMinutes: 25,
        remainingSeconds: 1500,
        isRunning: false,
      },
    })
  })

  test('creates a focus cycle with the configured number of sessions', () => {
    const cycle = createFocusCycle(
      25,
      5,
      3
    )

    expect(cycle.currentSession).toBe(1)
    expect(cycle.totalSessions).toBe(3)
  })

  test('moves from focus to break when more sessions remain', () => {
    const cycle = createFocusCycle(
      25,
      5,
      3
    )

    const nextCycle =
      transitionAfterCompletion(cycle)

    expect(nextCycle.phase).toBe('break')

    expect(
      nextCycle.currentSession
    ).toBe(1)

    expect(nextCycle.timer).toEqual({
      durationMinutes: 5,
      remainingSeconds: 300,
      isRunning: true,
    })
  })

  test('moves from break to the next focus session automatically', () => {
    const cycle = createFocusCycle(
      25,
      5,
      3
    )

    const breakCycle =
      transitionAfterCompletion(cycle)

    const nextFocusCycle =
      transitionAfterCompletion(
        breakCycle
      )

    expect(nextFocusCycle.phase).toBe(
      'focus'
    )

    expect(
      nextFocusCycle.currentSession
    ).toBe(2)

    expect(nextFocusCycle.timer).toEqual({
      durationMinutes: 25,
      remainingSeconds: 1500,
      isRunning: true,
    })
  })

  test('moves directly to the next focus session when no break is configured', () => {
    const cycle = createFocusCycle(
      25,
      null,
      3
    )

    const nextCycle =
      transitionAfterCompletion(cycle)

    expect(nextCycle.phase).toBe(
      'focus'
    )

    expect(
      nextCycle.currentSession
    ).toBe(2)

    expect(nextCycle.timer).toEqual({
      durationMinutes: 25,
      remainingSeconds: 1500,
      isRunning: true,
    })
  })

  test('returns to session one ready and inactive after the final focus session', () => {
    const cycle = createFocusCycle(
      25,
      5,
      3
    )

    const finalSessionCycle = {
      ...cycle,
      currentSession: 3,
    }

    const completedCycle =
      transitionAfterCompletion(
        finalSessionCycle
      )

    expect(completedCycle.phase).toBe(
      'focus'
    )

    expect(
      completedCycle.currentSession
    ).toBe(1)

    expect(
      completedCycle.totalSessions
    ).toBe(3)

    expect(completedCycle.timer).toEqual({
      durationMinutes: 25,
      remainingSeconds: 1500,
      isRunning: false,
    })
  })

  test('does not start a break after the final focus session', () => {
    const cycle = createFocusCycle(
      25,
      5,
      3
    )

    const finalSessionCycle = {
      ...cycle,
      currentSession: 3,
    }

    const completedCycle =
      transitionAfterCompletion(
        finalSessionCycle
      )

    expect(completedCycle.phase).not.toBe(
      'break'
    )
  })

  test('allows total sessions to be increased during a focus cycle', () => {
    const cycle = createFocusCycle(
      25,
      5,
      2
    )

    const updatedCycle =
      setTotalSessions(cycle, 4)

    expect(
      updatedCycle.totalSessions
    ).toBe(4)

    expect(
      updatedCycle.currentSession
    ).toBe(1)
  })

  test('allows total sessions to be reduced when the new total is not below the current session', () => {
    const cycle = {
      ...createFocusCycle(
        25,
        5,
        4
      ),
      currentSession: 2,
    }

    const updatedCycle =
      setTotalSessions(cycle, 3)

    expect(
      updatedCycle.totalSessions
    ).toBe(3)

    expect(
      updatedCycle.currentSession
    ).toBe(2)
  })

  test('does not allow total sessions below the current session', () => {
    const cycle = {
      ...createFocusCycle(
        25,
        5,
        4
      ),
      currentSession: 2,
    }

    const updatedCycle =
      setTotalSessions(cycle, 1)

    expect(updatedCycle).toEqual(
      cycle
    )
  })

  test('selecting the current session total does not change the cycle', () => {
    const cycle = createFocusCycle(
      25,
      5,
      3
    )

    const updatedCycle =
      setTotalSessions(cycle, 3)

    expect(updatedCycle).toBe(
      cycle
    )
  })

  test('changing focus duration during focus resets the focus timer and preserves running state', () => {
    const cycle = {
      ...createFocusCycle(
        25,
        5,
        3
      ),
      timer: {
        durationMinutes: 25,
        remainingSeconds: 1200,
        isRunning: true,
      },
    }

    const updatedCycle =
      setFocusDuration(
        cycle,
        45
      )

    expect(
      updatedCycle.focusDurationMinutes
    ).toBe(45)

    expect(updatedCycle.timer).toEqual({
      durationMinutes: 45,
      remainingSeconds: 2700,
      isRunning: true,
    })
  })

  test('changing break duration during focus does not change the current focus timer', () => {
    const cycle = {
      ...createFocusCycle(
        25,
        5,
        3
      ),
      timer: {
        durationMinutes: 25,
        remainingSeconds: 1200,
        isRunning: true,
      },
    }

    const updatedCycle =
      setBreakDuration(
        cycle,
        10
      )

    expect(
      updatedCycle.breakDurationMinutes
    ).toBe(10)

    expect(updatedCycle.timer).toEqual(
      cycle.timer
    )
  })

  test('changing break duration during an active break resets the break and preserves running state', () => {
    const cycle = {
      ...createFocusCycle(
        25,
        5,
        3
      ),
      phase: 'break' as const,
      timer: {
        durationMinutes: 5,
        remainingSeconds: 180,
        isRunning: true,
      },
    }

    const updatedCycle =
      setBreakDuration(
        cycle,
        10
      )

    expect(
      updatedCycle.breakDurationMinutes
    ).toBe(10)

    expect(updatedCycle.timer).toEqual({
      durationMinutes: 10,
      remainingSeconds: 600,
      isRunning: true,
    })
  })
})