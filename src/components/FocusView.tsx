import {
  useEffect,
  useState,
} from 'react'

import {
  Clock4,
  ClockCheck,
  Eye,
} from 'lucide-react'

import type {
  FocusCycleState,
} from '../focus/focusCycle'

type FocusViewProps = {
  cycle: FocusCycleState
  onExit: () => void
}

function FocusView({
  cycle,
  onExit,
}: FocusViewProps) {
  const [isTimerVisible, setIsTimerVisible] =
    useState(false)

  const timer = cycle.timer

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

  // Escape provides another predictable
  // way to leave Focus View.
  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        onExit()
      }
    }

    document.addEventListener(
      'keydown',
      handleKeyDown
    )

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      )
    }
  }, [onExit])

  const toggleTimerVisibility = () => {
    setIsTimerVisible(
      (current) => !current
    )
  }

  return (
    <section
      className="focus-view"
      aria-label="Focus view"
    >
      <div className="focus-view-controls">
        <button
          type="button"
          className="focus-view-icon-button"
          onClick={toggleTimerVisibility}
          aria-label={
            isTimerVisible
              ? 'Hide focus timer'
              : 'Show focus timer'
          }
          aria-expanded={isTimerVisible}
          title={
            isTimerVisible
              ? 'Hide timer'
              : 'Show timer'
          }
        >
          {timer.isRunning ? (
            <ClockCheck size={22} />
          ) : (
            <Clock4 size={22} />
          )}
        </button>

        <div
          className={`focus-view-timer ${
            isTimerVisible
              ? 'visible'
              : ''
          }`}
          aria-hidden={!isTimerVisible}
        >
          {isBreak ? (
            <span className="focus-view-phase">
              Break
            </span>
          ) : (
            cycle.totalSessions > 1 && (
              <span className="focus-view-session">
                {cycle.currentSession}/
                {cycle.totalSessions}
              </span>
            )
          )}

          <span className="focus-view-time">
            {formattedTime}
          </span>
        </div>

        <button
          type="button"
          className="focus-view-icon-button"
          onClick={onExit}
          aria-label="Exit focus view"
          title="Exit focus view"
        >
          <Eye size={22} />
        </button>
      </div>
    </section>
  )
}

export default FocusView