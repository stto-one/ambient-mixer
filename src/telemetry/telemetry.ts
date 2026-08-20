export type TelemetryEventName =
  | 'app_opened'
  | 'sound_started'
  | 'sound_stopped'
  | 'soundscape_changed'
  | 'focus_session_started'
  | 'focus_session_completed'

export type SoundStopReason =
  | 'user'
  | 'clear_all'
  | 'removed'

export type TelemetryPropertyValue =
  | string
  | number
  | boolean
  | string[]

export type TelemetryProperties =
  Record<
    string,
    TelemetryPropertyValue
  >

export type TelemetryEvent = {
  event: TelemetryEventName
  timestamp: string
  appVersion: string
  properties: TelemetryProperties
}

export const TELEMETRY_STORAGE_KEY =
  'ambient-mixer-telemetry'

const readStoredEvents =
  (): TelemetryEvent[] => {
    try {
      const stored =
        window.localStorage.getItem(
          TELEMETRY_STORAGE_KEY
        )

      if (!stored) {
        return []
      }

      const parsed: unknown =
        JSON.parse(stored)

      if (!Array.isArray(parsed)) {
        return []
      }

      return parsed as TelemetryEvent[]
    } catch {
      return []
    }
  }

const storeEvent = (
  telemetryEvent: TelemetryEvent
) => {
  try {
    const existingEvents =
      readStoredEvents()

    const nextEvents = [
      ...existingEvents,
      telemetryEvent,
    ]

    window.localStorage.setItem(
      TELEMETRY_STORAGE_KEY,
      JSON.stringify(nextEvents)
    )
  } catch {
    /*
     * Telemetry must never interfere
     * with normal application behaviour.
     */
  }
}

const track = (
  event: TelemetryEventName,
  properties: TelemetryProperties = {}
) => {
  const telemetryEvent: TelemetryEvent = {
    event,

    timestamp:
      new Date().toISOString(),

    appVersion:
      __APP_VERSION__,

    properties,
  }

  storeEvent(
    telemetryEvent
  )

  console.info(
    '[telemetry]',
    telemetryEvent
  )
}

export const getTelemetryEvents =
  (): TelemetryEvent[] => {
    return readStoredEvents()
  }

export const exportTelemetryJson =
  (): string => {
    const events =
      getTelemetryEvents()

    return JSON.stringify(
      events,
      null,
      2
    )
  }

export const clearTelemetryEvents =
  () => {
    try {
      window.localStorage.removeItem(
        TELEMETRY_STORAGE_KEY
      )
    } catch {
      /*
       * Clearing telemetry should also
       * never affect application behaviour.
       */
    }
  }

export const telemetry = {
  track,
}