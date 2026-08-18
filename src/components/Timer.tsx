import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'

import {
  Clock4,
  ClockCheck,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react'

import {
  pauseTimer,
  resetTimer,
  startTimer,
  tickTimer,
} from '../timer/timer'

import {
  createCompletionCueController,
  shouldStartCompletionCue,
} from '../audio/completionCue'

import {
  FOCUS_PRESETS,
} from '../timer/focusPresets'

import {
  BREAK_PRESETS,
} from '../timer/breakPresets'

import {
  SESSION_PRESETS,
} from '../timer/sessionPresets'

import {
  setBreakDuration,
  setFocusDuration,
  setTotalSessions,
  transitionAfterCompletion,
  type FocusCycleState,
} from '../focus/focusCycle'

type TimerProps = {
  cycle: FocusCycleState
  setCycle: Dispatch<
    SetStateAction<FocusCycleState>
  >
}

function Timer({
  cycle,
  setCycle,
}: TimerProps) {
  const [isExpanded, setIsExpanded] =
    useState(false)

  const [
    isPresetMenuOpen,
    setIsPresetMenuOpen,
  ] = useState(false)

  const completionCueRef = useRef(
    createCompletionCueController()
  )

  const durationSelectorRef =
    useRef<HTMLDivElement | null>(null)

  const timer = cycle.timer

  // Drive the current focus or break countdown.
  useEffect(() => {
    if (!timer.isRunning) {
      return
    }

    const interval = window.setInterval(() => {
      setCycle((currentCycle) => ({
        ...currentCycle,
        timer: tickTimer(
          currentCycle.timer
        ),
      }))
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [
    timer.isRunning,
    setCycle,
  ])

  // Start the completion cue five seconds
  // before either focus or break completes.
useEffect(() => {
  if (shouldStartCompletionCue(timer)) {
    completionCueRef.current.start()
  }
}, [timer])

  // Move to the next phase/session
  // once the current countdown completes.
  useEffect(() => {
    if (
      timer.remainingSeconds !== 0 ||
      timer.isRunning
    ) {
      return
    }

    setCycle((currentCycle) =>
      transitionAfterCompletion(
        currentCycle
      )
    )
  }, [
    timer.remainingSeconds,
    timer.isRunning,
    setCycle,
  ])

  // Close the settings menu when clicking
  // outside it or pressing Escape.
  useEffect(() => {
    if (!isPresetMenuOpen) {
      return
    }

    const handlePointerDown = (
      event: PointerEvent
    ) => {
      const target = event.target as Node

      if (
        durationSelectorRef.current &&
        !durationSelectorRef.current.contains(
          target
        )
      ) {
        setIsPresetMenuOpen(false)
      }
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        setIsPresetMenuOpen(false)
      }
    }

    document.addEventListener(
      'pointerdown',
      handlePointerDown
    )

    document.addEventListener(
      'keydown',
      handleKeyDown
    )

    return () => {
      document.removeEventListener(
        'pointerdown',
        handlePointerDown
      )

      document.removeEventListener(
        'keydown',
        handleKeyDown
      )
    }
  }, [isPresetMenuOpen])

  // Stop completion audio if Timer is removed.
useEffect(() => {
  const completionCue =
    completionCueRef.current

  return () => {
    completionCue.cancel()
  }
}, [])

  const toggleTimerPanel = () => {
    setIsExpanded((current) => {
      const nextExpandedState = !current

      if (!nextExpandedState) {
        setIsPresetMenuOpen(false)
      }

      return nextExpandedState
    })
  }

  const togglePresetMenu = () => {
    setIsPresetMenuOpen(
      (current) => !current
    )
  }

  const toggleTimer = () => {
    setCycle((currentCycle) => {
      const currentTimer =
        currentCycle.timer

      if (currentTimer.isRunning) {
        completionCueRef.current.cancel()

        return {
          ...currentCycle,
          timer: pauseTimer(
            currentTimer
          ),
        }
      }

      return {
        ...currentCycle,
        timer: startTimer(
          currentTimer
        ),
      }
    })
  }

  const handleReset = () => {
    completionCueRef.current.cancel()

    setCycle((currentCycle) => ({
      ...currentCycle,
      timer: resetTimer(
        currentCycle.timer
      ),
    }))
  }

  const handleFocusDurationChange = (
    durationMinutes: number
  ) => {
    if (
      cycle.focusDurationMinutes ===
      durationMinutes
    ) {
      setIsPresetMenuOpen(false)
      return
    }

    completionCueRef.current.cancel()

    setCycle((currentCycle) =>
      setFocusDuration(
        currentCycle,
        durationMinutes
      )
    )

    setIsPresetMenuOpen(false)
  }

  const handleBreakDurationChange = (
    durationMinutes: number | null
  ) => {
    if (
      cycle.breakDurationMinutes ===
      durationMinutes
    ) {
      setIsPresetMenuOpen(false)
      return
    }

    if (cycle.phase === 'break') {
      completionCueRef.current.cancel()
    }

    setCycle((currentCycle) =>
      setBreakDuration(
        currentCycle,
        durationMinutes
      )
    )

    setIsPresetMenuOpen(false)
  }

  const handleSessionChange = (
    totalSessions: number
  ) => {
    if (
      cycle.totalSessions ===
      totalSessions
    ) {
      setIsPresetMenuOpen(false)
      return
    }

    setCycle((currentCycle) =>
      setTotalSessions(
        currentCycle,
        totalSessions
      )
    )

    setIsPresetMenuOpen(false)
  }

  const minutes = Math.floor(
    timer.remainingSeconds / 60
  )

  const seconds =
    timer.remainingSeconds % 60

  const formattedTime =
    `${minutes}:${seconds
      .toString()
      .padStart(2, '0')}`

  const isBreak =
    cycle.phase === 'break'

  const timerButtonLabel = isExpanded
    ? 'Hide timer'
    : timer.isRunning
      ? isBreak
        ? 'Show running break timer'
        : 'Show running focus timer'
      : 'Show timer'

  return (
    <div className="timer">
      <button
        type="button"
        className="control-icon-button"
        onClick={toggleTimerPanel}
        aria-label={timerButtonLabel}
        aria-expanded={isExpanded}
        title={timerButtonLabel}
      >
        {!isExpanded &&
        timer.isRunning ? (
          <ClockCheck size={22} />
        ) : (
          <Clock4 size={22} />
        )}
      </button>

      <div
        className={`timer-panel ${
          isExpanded
            ? 'expanded'
            : ''
        }`}
        aria-hidden={!isExpanded}
      >
        <div
          className="timer-duration-selector"
          ref={durationSelectorRef}
        >
          <button
            type="button"
            className="timer-time-button"
            onClick={togglePresetMenu}
            aria-label={
              isBreak
                ? `Change timer settings, break has ${formattedTime} remaining`
                : `Change timer settings, focus has ${formattedTime} remaining`
            }
            aria-expanded={
              isPresetMenuOpen
            }
            aria-haspopup="menu"
          >
            {isBreak ? (
              <span className="timer-phase-label">
                Break
              </span>
            ) : (
              cycle.totalSessions > 1 && (
                <span className="timer-session-progress">
                  {cycle.currentSession}/
                  {cycle.totalSessions}
                </span>
              )
            )}

            <span>
              {formattedTime}
            </span>
          </button>

          {isPresetMenuOpen && (
            <div
              className="focus-preset-menu"
              role="menu"
              aria-label="Timer settings"
            >
              <div className="timer-menu-heading">
                Focus
              </div>

              {FOCUS_PRESETS.map(
                (preset) => {
                  const isSelected =
                    cycle.focusDurationMinutes ===
                    preset.minutes

                  return (
                    <button
                      key={preset.minutes}
                      type="button"
                      className={`focus-preset-option ${
                        isSelected
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() =>
                        handleFocusDurationChange(
                          preset.minutes
                        )
                      }
                      role="menuitemradio"
                      aria-checked={
                        isSelected
                      }
                    >
                      <span className="focus-preset-label">
                        {preset.label}
                      </span>

                      <span className="focus-preset-duration">
                        {preset.minutes}{' '}
                        min
                      </span>
                    </button>
                  )
                }
              )}

              <div
                className="timer-menu-divider"
                aria-hidden="true"
              />

              <div className="timer-menu-heading">
                Break
              </div>

              {BREAK_PRESETS.map(
                (preset) => {
                  const isSelected =
                    cycle.breakDurationMinutes ===
                    preset.minutes

                  return (
                    <button
                      key={
                        preset.minutes ??
                        'none'
                      }
                      type="button"
                      className={`focus-preset-option ${
                        isSelected
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() =>
                        handleBreakDurationChange(
                          preset.minutes
                        )
                      }
                      role="menuitemradio"
                      aria-checked={
                        isSelected
                      }
                    >
                      <span className="focus-preset-label">
                        {preset.label}
                      </span>

                      {preset.minutes !==
                        null && (
                        <span className="focus-preset-duration">
                          {
                            preset.minutes
                          }{' '}
                          min
                        </span>
                      )}
                    </button>
                  )
                }
              )}

              <div
                className="timer-menu-divider"
                aria-hidden="true"
              />

              <div className="timer-menu-heading">
                Sessions
              </div>

              <div
                className="session-preset-options"
                role="group"
                aria-label="Number of focus sessions"
              >
                {SESSION_PRESETS.map(
                  (sessionCount) => {
                    const isSelected =
                      cycle.totalSessions ===
                      sessionCount

                    const isUnavailable =
                      sessionCount <
                      cycle.currentSession

                    return (
                      <button
                        key={sessionCount}
                        type="button"
                        className={`session-preset-option ${
                          isSelected
                            ? 'selected'
                            : ''
                        }`}
                        onClick={() =>
                          handleSessionChange(
                            sessionCount
                          )
                        }
                        disabled={
                          isUnavailable
                        }
                        aria-pressed={
                          isSelected
                        }
                        aria-label={
                          sessionCount === 1
                            ? '1 focus session'
                            : `${sessionCount} focus sessions`
                        }
                      >
                        {sessionCount}
                      </button>
                    )
                  }
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="timer-icon-button"
          onClick={toggleTimer}
          aria-label={
            timer.isRunning
              ? isBreak
                ? 'Pause break'
                : 'Pause timer'
              : isBreak
                ? 'Resume break'
                : 'Start timer'
          }
          title={
            timer.isRunning
              ? 'Pause'
              : 'Start'
          }
        >
          {timer.isRunning ? (
            <Pause size={19} />
          ) : (
            <Play size={19} />
          )}
        </button>

        <button
          type="button"
          className="timer-icon-button"
          onClick={handleReset}
          aria-label={
            isBreak
              ? 'Reset break'
              : 'Reset timer'
          }
          title="Reset"
        >
          <RotateCcw size={17} />
        </button>
      </div>
    </div>
  )
}

export default Timer