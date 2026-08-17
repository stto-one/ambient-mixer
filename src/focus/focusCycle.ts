import {
  createTimer,
  type TimerState,
} from '../timer/timer'

export type FocusPhase =
  | 'focus'
  | 'break'

export type FocusCycleState = {
  phase: FocusPhase

  focusDurationMinutes: number
  breakDurationMinutes: number | null

  currentSession: number
  totalSessions: number

  timer: TimerState
}

export const createFocusCycle = (
  focusDurationMinutes: number,
  breakDurationMinutes: number | null,
  totalSessions = 1
): FocusCycleState => {
  return {
    phase: 'focus',

    focusDurationMinutes,
    breakDurationMinutes,

    currentSession: 1,
    totalSessions,

    timer: createTimer(
      focusDurationMinutes
    ),
  }
}

export const setFocusDuration = (
  cycle: FocusCycleState,
  durationMinutes: number
): FocusCycleState => {
  if (
    cycle.focusDurationMinutes ===
    durationMinutes
  ) {
    return cycle
  }

  const timer =
    cycle.phase === 'focus'
      ? {
          ...cycle.timer,

          durationMinutes,

          remainingSeconds:
            durationMinutes * 60,
        }
      : cycle.timer

  return {
    ...cycle,

    focusDurationMinutes:
      durationMinutes,

    timer,
  }
}

export const setBreakDuration = (
  cycle: FocusCycleState,
  durationMinutes: number | null
): FocusCycleState => {
  if (
    cycle.breakDurationMinutes ===
    durationMinutes
  ) {
    return cycle
  }

  if (
    cycle.phase === 'break' &&
    durationMinutes !== null
  ) {
    return {
      ...cycle,

      breakDurationMinutes:
        durationMinutes,

      timer: {
        ...cycle.timer,

        durationMinutes,

        remainingSeconds:
          durationMinutes * 60,
      },
    }
  }

  return {
    ...cycle,

    breakDurationMinutes:
      durationMinutes,
  }
}

export const setTotalSessions = (
  cycle: FocusCycleState,
  totalSessions: number
): FocusCycleState => {
  if (
    totalSessions < cycle.currentSession
  ) {
    return cycle
  }

  if (
    totalSessions === cycle.totalSessions
  ) {
    return cycle
  }

  return {
    ...cycle,
    totalSessions,
  }
}

export const transitionAfterCompletion = (
  cycle: FocusCycleState
): FocusCycleState => {
  /*
   * BREAK COMPLETED
   *
   * Move into the next focus session
   * and automatically start it.
   */
  if (cycle.phase === 'break') {
    const nextSession =
      cycle.currentSession + 1

    return {
      ...cycle,

      phase: 'focus',

      currentSession:
        nextSession,

      timer: {
        ...createTimer(
          cycle.focusDurationMinutes
        ),

        isRunning: true,
      },
    }
  }

  /*
   * FINAL FOCUS SESSION COMPLETED
   *
   * The complete focus routine is finished.
   * Return to the beginning in a ready,
   * inactive state.
   */
  const isFinalSession =
    cycle.currentSession >=
    cycle.totalSessions

  if (isFinalSession) {
    return {
      ...cycle,

      phase: 'focus',

      currentSession: 1,

      timer: createTimer(
        cycle.focusDurationMinutes
      ),
    }
  }

  /*
   * MORE SESSIONS REMAIN
   *
   * If a break exists, automatically
   * start it.
   */
  if (
    cycle.breakDurationMinutes !== null
  ) {
    return {
      ...cycle,

      phase: 'break',

      timer: {
        ...createTimer(
          cycle.breakDurationMinutes
        ),

        isRunning: true,
      },
    }
  }

  /*
   * NO BREAK
   *
   * Move directly into the next focus
   * session and automatically start it.
   */
  const nextSession =
    cycle.currentSession + 1

  return {
    ...cycle,

    phase: 'focus',

    currentSession:
      nextSession,

    timer: {
      ...createTimer(
        cycle.focusDurationMinutes
      ),

      isRunning: true,
    },
  }
}