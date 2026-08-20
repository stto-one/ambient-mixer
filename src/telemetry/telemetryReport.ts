import {
  getTelemetryEvents,
} from './telemetry'

import {
  aggregateTelemetry,
  type TelemetrySummary,
} from './telemetryAggregator'

const formatDuration = (
  totalSeconds: number
): string => {
  if (totalSeconds < 60) {
    return `${Math.round(
      totalSeconds
    )} sec`
  }

  const totalMinutes =
    Math.round(
      totalSeconds / 60
    )

  if (totalMinutes < 60) {
    return `${totalMinutes} min`
  }

  const hours = Math.floor(
    totalMinutes / 60
  )

  const minutes =
    totalMinutes % 60

  if (minutes === 0) {
    return `${hours} hr`
  }

  return `${hours} hr ${minutes} min`
}

const formatPercentage = (
  value: number
): string => {
  return `${Math.round(
    value * 100
  )}%`
}

export const createTelemetryReport = (
  summary: TelemetrySummary
): string => {
  const soundLines =
    summary.sounds.length > 0
      ? summary.sounds.map(
          (sound) =>
            [
              sound.soundId,
              `starts: ${sound.startCount}`,
              `stops: ${sound.stopCount}`,
              `play time: ${formatDuration(
                sound.totalPlayDurationSeconds
              )}`,
              `average: ${formatDuration(
                sound.averagePlayDurationSeconds
              )}`,
            ].join(' | ')
        )
      : ['No sound usage recorded']

  return [
    'Ambient Mixer Telemetry Report',
    '',
    `Total events: ${summary.totalEvents}`,
    '',
    'Sounds',
    ...soundLines,
    '',
    'Focus',
    `Sessions started: ${summary.focus.sessionsStarted}`,
    `Sessions completed: ${summary.focus.sessionsCompleted}`,
    `Completion rate: ${formatPercentage(
      summary.focus.completionRate
    )}`,
  ].join('\n')
}

export const getTelemetrySummary =
  (): TelemetrySummary => {
    return aggregateTelemetry(
      getTelemetryEvents()
    )
  }

export const getTelemetryReport =
  (): string => {
    return createTelemetryReport(
      getTelemetrySummary()
    )
  }