export type TimerState = {
  durationMinutes: number
  remainingSeconds: number
  isRunning: boolean
}

export const createTimer = (
  durationMinutes: number
): TimerState => {
  return {
    durationMinutes,
    remainingSeconds: durationMinutes * 60,
    isRunning: false,
  }
}

export const startTimer = (
  timer: TimerState
): TimerState => {
  return {
    ...timer,
    isRunning: true,
  }
}

export const tickTimer = (
  timer: TimerState
): TimerState => {
  if (!timer.isRunning) {
    return timer
  }

  if (timer.remainingSeconds === 0) {
    return timer
  }

  if (timer.remainingSeconds === 1) {
    return {
      ...timer,
      remainingSeconds: 0,
      isRunning: false,
    }
  }

  return {
    ...timer,
    remainingSeconds: timer.remainingSeconds - 1,
  }
}

export const pauseTimer = (
  timer: TimerState
): TimerState => {
  return {
    ...timer,
    isRunning: false,
  }
}

export const resetTimer = (
  timer: TimerState
): TimerState => {
  return {
    ...timer,
    remainingSeconds: timer.durationMinutes * 60,
    isRunning: false,
  }
}

export const isCompletionCueActive = (
  timer: TimerState
): boolean => {
  return (
    timer.isRunning &&
    timer.remainingSeconds > 0 &&
    timer.remainingSeconds <= 5
  )
}

export const shouldStartCompletionCue = (
  timer: TimerState
): boolean => {
  return (
    timer.isRunning &&
    timer.remainingSeconds === 5
  )
}

export const setTimerDuration = (
  timer: TimerState,
  durationMinutes: number
): TimerState => {
  if (timer.durationMinutes === durationMinutes) {
    return timer
  }

  return {
    ...timer,
    durationMinutes,
    remainingSeconds: durationMinutes * 60,
  }
}