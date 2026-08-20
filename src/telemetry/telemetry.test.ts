import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  clearTelemetryEvents,
  exportTelemetryJson,
  getTelemetryEvents,
  telemetry,
} from './telemetry'

describe('telemetry', () => {
  const storage = new Map<
    string,
    string
  >()

  const getItem = vi.fn(
    (key: string) =>
      storage.get(key) ??
      null
  )

  const setItem = vi.fn(
    (
      key: string,
      value: string
    ) => {
      storage.set(
        key,
        value
      )
    }
  )

  const removeItem = vi.fn(
    (key: string) => {
      storage.delete(key)
    }
  )

  beforeEach(() => {
    storage.clear()

    getItem.mockClear()
    setItem.mockClear()
    removeItem.mockClear()

    vi.stubGlobal(
      'window',
      {
        localStorage: {
          getItem,
          setItem,
          removeItem,
        },
      }
    )

    vi.spyOn(
      console,
      'info'
    ).mockImplementation(
      () => {}
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it(
    'tracks and stores a structured product event',
    () => {
      telemetry.track(
        'sound_started',
        {
          soundId:
            'gentle-rain',
          sourceType:
            'audio',
        }
      )

      const events =
        getTelemetryEvents()

      expect(events).toHaveLength(
        1
      )

      expect(events[0]).toEqual(
        expect.objectContaining({
          event:
            'sound_started',

          timestamp:
            expect.any(String),

          appVersion:
            expect.any(String),

          properties: {
            soundId:
              'gentle-rain',

            sourceType:
              'audio',
          },
        })
      )
    }
  )

  it(
    'retains multiple events in order',
    () => {
      telemetry.track(
        'sound_started',
        {
          soundId:
            'gentle-rain',
        }
      )

      telemetry.track(
        'sound_stopped',
        {
          soundId:
            'gentle-rain',

          playDurationSeconds:
            20,

          stopReason:
            'user',
        }
      )

      const events =
        getTelemetryEvents()

      expect(events).toHaveLength(
        2
      )

      expect(
        events[0].event
      ).toBe(
        'sound_started'
      )

      expect(
        events[1].event
      ).toBe(
        'sound_stopped'
      )
    }
  )

  it(
    'returns stored telemetry events',
    () => {
      telemetry.track(
        'app_opened'
      )

      const events =
        getTelemetryEvents()

      expect(
        events
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            event:
              'app_opened',
          }),
        ])
      )
    }
  )

  it(
    'exports stored telemetry as valid JSON',
    () => {
      telemetry.track(
        'sound_started',
        {
          soundId:
            'gentle-rain',

          sourceType:
            'audio',
        }
      )

      telemetry.track(
        'sound_stopped',
        {
          soundId:
            'gentle-rain',

          sourceType:
            'audio',

          playDurationSeconds:
            15,

          stopReason:
            'user',
        }
      )

      const json =
        exportTelemetryJson()

      expect(() =>
        JSON.parse(json)
      ).not.toThrow()

      const exportedEvents =
        JSON.parse(json)

      expect(
        exportedEvents
      ).toHaveLength(2)

      expect(
        exportedEvents[0]
      ).toEqual(
        expect.objectContaining({
          event:
            'sound_started',

          timestamp:
            expect.any(String),

          appVersion:
            expect.any(String),

          properties:
            expect.objectContaining({
              soundId:
                'gentle-rain',

              sourceType:
                'audio',
            }),
        })
      )

      expect(
        exportedEvents[1]
      ).toEqual(
        expect.objectContaining({
          event:
            'sound_stopped',

          properties:
            expect.objectContaining({
              soundId:
                'gentle-rain',

              playDurationSeconds:
                15,

              stopReason:
                'user',
            }),
        })
      )
    }
  )

  it(
    'exports an empty JSON array when no telemetry exists',
    () => {
      const json =
        exportTelemetryJson()

      expect(
        JSON.parse(json)
      ).toEqual([])
    }
  )

  it(
    'clears stored telemetry events',
    () => {
      telemetry.track(
        'app_opened'
      )

      clearTelemetryEvents()

      expect(
        getTelemetryEvents()
      ).toEqual([])

      expect(
        removeItem
      ).toHaveBeenCalledTimes(
        1
      )
    }
  )

  it(
    'returns an empty collection for corrupt stored telemetry',
    () => {
      storage.set(
        'ambient-mixer-telemetry',
        '{invalid-json'
      )

      expect(
        getTelemetryEvents()
      ).toEqual([])
    }
  )

  it(
    'returns an empty collection when stored telemetry is not an array',
    () => {
      storage.set(
        'ambient-mixer-telemetry',
        JSON.stringify({
          event:
            'app_opened',
        })
      )

      expect(
        getTelemetryEvents()
      ).toEqual([])
    }
  )

  it(
    'does not throw when telemetry storage cannot be read',
    () => {
      getItem.mockImplementationOnce(
        () => {
          throw new Error(
            'Storage unavailable'
          )
        }
      )

      expect(
        () =>
          getTelemetryEvents()
      ).not.toThrow()

      expect(
        getTelemetryEvents()
      ).toEqual([])
    }
  )

  it(
    'does not throw when telemetry storage cannot be written',
    () => {
      setItem.mockImplementationOnce(
        () => {
          throw new Error(
            'Storage unavailable'
          )
        }
      )

      expect(() =>
        telemetry.track(
          'sound_started',
          {
            soundId:
              'gentle-rain',
          }
        )
      ).not.toThrow()
    }
  )
})