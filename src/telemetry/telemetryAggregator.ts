import type {
  TelemetryEvent,
} from './telemetry'

export type SoundTelemetryStats = {
  soundId: string
  startCount: number
  stopCount: number
  totalPlayDurationSeconds: number
  averagePlayDurationSeconds: number
}

export type FocusTelemetryStats = {
  sessionsStarted: number
  sessionsCompleted: number
  completionRate: number
}

export type TelemetrySummary = {
  totalEvents: number
  sounds: SoundTelemetryStats[]
  focus: FocusTelemetryStats
}

type MutableSoundStats = {
  soundId: string
  startCount: number
  stopCount: number
  totalPlayDurationSeconds: number
}

const getStringProperty = (
  event: TelemetryEvent,
  propertyName: string
): string | null => {
  const value =
    event.properties[propertyName]

  return typeof value === 'string'
    ? value
    : null
}

const getNumberProperty = (
  event: TelemetryEvent,
  propertyName: string
): number | null => {
  const value =
    event.properties[propertyName]

  return typeof value === 'number'
    ? value
    : null
}

export const aggregateTelemetry = (
  events: TelemetryEvent[]
): TelemetrySummary => {
  const soundStats =
    new Map<
      string,
      MutableSoundStats
    >()

  let sessionsStarted = 0
  let sessionsCompleted = 0

  const getOrCreateSoundStats = (
    soundId: string
  ): MutableSoundStats => {
    const existing =
      soundStats.get(soundId)

    if (existing) {
      return existing
    }

    const created: MutableSoundStats = {
      soundId,
      startCount: 0,
      stopCount: 0,
      totalPlayDurationSeconds: 0,
    }

    soundStats.set(
      soundId,
      created
    )

    return created
  }

  for (const event of events) {
    if (
      event.event ===
      'sound_started'
    ) {
      const soundId =
        getStringProperty(
          event,
          'soundId'
        )

      if (!soundId) {
        continue
      }

      const stats =
        getOrCreateSoundStats(
          soundId
        )

      stats.startCount += 1

      continue
    }

    if (
      event.event ===
      'sound_stopped'
    ) {
      const soundId =
        getStringProperty(
          event,
          'soundId'
        )

      if (!soundId) {
        continue
      }

      const stats =
        getOrCreateSoundStats(
          soundId
        )

      stats.stopCount += 1

      const playDurationSeconds =
        getNumberProperty(
          event,
          'playDurationSeconds'
        )

      if (
        playDurationSeconds !==
          null &&
        playDurationSeconds >= 0
      ) {
        stats.totalPlayDurationSeconds +=
          playDurationSeconds
      }

      continue
    }

    if (
      event.event ===
      'focus_session_started'
    ) {
      sessionsStarted += 1
      continue
    }

    if (
      event.event ===
      'focus_session_completed'
    ) {
      sessionsCompleted += 1
    }
  }

  const sounds =
    Array.from(
      soundStats.values()
    )
      .map(
        (
          stats
        ): SoundTelemetryStats => {
          const averagePlayDurationSeconds =
            stats.stopCount > 0
              ? stats
                  .totalPlayDurationSeconds /
                stats.stopCount
              : 0

          return {
            ...stats,

            averagePlayDurationSeconds,
          }
        }
      )
      .sort(
        (left, right) =>
          right.startCount -
            left.startCount ||
          right.totalPlayDurationSeconds -
            left.totalPlayDurationSeconds ||
          left.soundId.localeCompare(
            right.soundId
          )
      )

  const completionRate =
    sessionsStarted > 0
      ? sessionsCompleted /
        sessionsStarted
      : 0

  return {
    totalEvents:
      events.length,

    sounds,

    focus: {
      sessionsStarted,
      sessionsCompleted,
      completionRate,
    },
  }
}