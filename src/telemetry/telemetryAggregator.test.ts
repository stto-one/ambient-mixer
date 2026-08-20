import {
  describe,
  expect,
  it,
} from 'vitest'

import type {
  TelemetryEvent,
} from './telemetry'

import {
  aggregateTelemetry,
} from './telemetryAggregator'

const createEvent = (
  event:
    TelemetryEvent['event'],
  properties:
    TelemetryEvent['properties'] = {}
): TelemetryEvent => {
  return {
    event,

    timestamp:
      '2026-08-21T00:00:00.000Z',

    appVersion:
      '0.1.0',

    properties,
  }
}

describe(
  'telemetryAggregator',
  () => {
    it(
      'returns empty stats when there are no events',
      () => {
        expect(
          aggregateTelemetry([])
        ).toEqual({
          totalEvents: 0,

          sounds: [],

          focus: {
            sessionsStarted: 0,
            sessionsCompleted: 0,
            completionRate: 0,
          },
        })
      }
    )

    it(
      'aggregates sound starts and stops',
      () => {
        const events: TelemetryEvent[] =
          [
            createEvent(
              'sound_started',
              {
                soundId:
                  'gentle-rain',
              }
            ),

            createEvent(
              'sound_started',
              {
                soundId:
                  'gentle-rain',
              }
            ),

            createEvent(
              'sound_stopped',
              {
                soundId:
                  'gentle-rain',

                playDurationSeconds:
                  30,

                stopReason:
                  'user',
              }
            ),

            createEvent(
              'sound_stopped',
              {
                soundId:
                  'gentle-rain',

                playDurationSeconds:
                  90,

                stopReason:
                  'clear_all',
              }
            ),
          ]

        const summary =
          aggregateTelemetry(
            events
          )

        expect(
          summary.sounds
        ).toEqual([
          {
            soundId:
              'gentle-rain',

            startCount: 2,

            stopCount: 2,

            totalPlayDurationSeconds:
              120,

            averagePlayDurationSeconds:
              60,
          },
        ])
      }
    )

    it(
      'aggregates multiple sounds independently',
      () => {
        const events: TelemetryEvent[] =
          [
            createEvent(
              'sound_started',
              {
                soundId:
                  'gentle-rain',
              }
            ),

            createEvent(
              'sound_stopped',
              {
                soundId:
                  'gentle-rain',

                playDurationSeconds:
                  100,
              }
            ),

            createEvent(
              'sound_started',
              {
                soundId:
                  'white-noise',
              }
            ),

            createEvent(
              'sound_started',
              {
                soundId:
                  'white-noise',
              }
            ),

            createEvent(
              'sound_stopped',
              {
                soundId:
                  'white-noise',

                playDurationSeconds:
                  40,
              }
            ),
          ]

        const summary =
          aggregateTelemetry(
            events
          )

        expect(
          summary.sounds
        ).toEqual([
          {
            soundId:
              'white-noise',

            startCount: 2,

            stopCount: 1,

            totalPlayDurationSeconds:
              40,

            averagePlayDurationSeconds:
              40,
          },

          {
            soundId:
              'gentle-rain',

            startCount: 1,

            stopCount: 1,

            totalPlayDurationSeconds:
              100,

            averagePlayDurationSeconds:
              100,
          },
        ])
      }
    )

    it(
      'aggregates focus-session completion',
      () => {
        const events: TelemetryEvent[] =
          [
            createEvent(
              'focus_session_started'
            ),

            createEvent(
              'focus_session_started'
            ),

            createEvent(
              'focus_session_completed'
            ),
          ]

        const summary =
          aggregateTelemetry(
            events
          )

        expect(
          summary.focus
        ).toEqual({
          sessionsStarted: 2,
          sessionsCompleted: 1,
          completionRate: 0.5,
        })
      }
    )

    it(
      'ignores sound events without a valid sound id',
      () => {
        const events: TelemetryEvent[] =
          [
            createEvent(
              'sound_started'
            ),

            createEvent(
              'sound_stopped',
              {
                playDurationSeconds:
                  20,
              }
            ),
          ]

        expect(
          aggregateTelemetry(
            events
          ).sounds
        ).toEqual([])
      }
    )

    it(
      'ignores invalid play durations',
      () => {
        const events: TelemetryEvent[] =
          [
            createEvent(
              'sound_stopped',
              {
                soundId:
                  'gentle-rain',

                playDurationSeconds:
                  -10,
              }
            ),
          ]

        expect(
          aggregateTelemetry(
            events
          ).sounds
        ).toEqual([
          {
            soundId:
              'gentle-rain',

            startCount: 0,

            stopCount: 1,

            totalPlayDurationSeconds:
              0,

            averagePlayDurationSeconds:
              0,
          },
        ])
      }
    )

    it(
      'includes unrelated events in total event count without affecting metrics',
      () => {
        const events: TelemetryEvent[] =
          [
            createEvent(
              'app_opened'
            ),

            createEvent(
              'soundscape_changed',
              {
                changeType:
                  'sound_added',

                soundId:
                  'gentle-rain',
              }
            ),
          ]

        const summary =
          aggregateTelemetry(
            events
          )

        expect(
          summary.totalEvents
        ).toBe(2)

        expect(
          summary.sounds
        ).toEqual([])

        expect(
          summary.focus
        ).toEqual({
          sessionsStarted: 0,
          sessionsCompleted: 0,
          completionRate: 0,
        })
      }
    )
  }
)