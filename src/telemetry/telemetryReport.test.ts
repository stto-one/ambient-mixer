import {
  describe,
  expect,
  it,
} from 'vitest'

import type {
  TelemetrySummary,
} from './telemetryAggregator'

import {
  createTelemetryReport,
} from './telemetryReport'

describe(
  'telemetryReport',
  () => {
    it(
      'creates a readable telemetry report',
      () => {
        const summary:
          TelemetrySummary = {
            totalEvents: 10,

            sounds: [
              {
                soundId:
                  'gentle-rain',

                startCount: 3,
                stopCount: 2,

                totalPlayDurationSeconds:
                  900,

                averagePlayDurationSeconds:
                  450,
              },

              {
                soundId:
                  'white-noise',

                startCount: 1,
                stopCount: 1,

                totalPlayDurationSeconds:
                  45,

                averagePlayDurationSeconds:
                  45,
              },
            ],

            focus: {
              sessionsStarted: 4,
              sessionsCompleted: 3,
              completionRate: 0.75,
            },
          }

        const report =
          createTelemetryReport(
            summary
          )

        expect(report).toContain(
          'Ambient Mixer Telemetry Report'
        )

        expect(report).toContain(
          'Total events: 10'
        )

        expect(report).toContain(
          'gentle-rain'
        )

        expect(report).toContain(
          'starts: 3'
        )

        expect(report).toContain(
          'play time: 15 min'
        )

        expect(report).toContain(
          'average: 8 min'
        )

        expect(report).toContain(
          'white-noise'
        )

        expect(report).toContain(
          'play time: 45 sec'
        )

        expect(report).toContain(
          'Sessions started: 4'
        )

        expect(report).toContain(
          'Sessions completed: 3'
        )

        expect(report).toContain(
          'Completion rate: 75%'
        )
      }
    )

    it(
      'handles an empty telemetry summary',
      () => {
        const summary:
          TelemetrySummary = {
            totalEvents: 0,

            sounds: [],

            focus: {
              sessionsStarted: 0,
              sessionsCompleted: 0,
              completionRate: 0,
            },
          }

        const report =
          createTelemetryReport(
            summary
          )

        expect(report).toContain(
          'Total events: 0'
        )

        expect(report).toContain(
          'No sound usage recorded'
        )

        expect(report).toContain(
          'Completion rate: 0%'
        )
      }
    )
  }
)