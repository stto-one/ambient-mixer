import {
  test,
  expect,
} from '@playwright/test'

type TelemetryEvent = {
  event: string
  properties: Record<
    string,
    unknown
  >
}

test.describe(
  'Focus cycle',
  () => {
    test(
      'user progresses from focus to break and into the next focus session',
      {
        tag: [
          '@regressionTest',
          '@webApp',
          '@timer',
          '@focusCycle',
        ],
      },
      async ({ page }) => {
        test.setTimeout(60_000)
        await page.clock.install()

        await page.goto('/')

        /*
         * Start with a known telemetry state.
         */
        await page.evaluate(() => {
          window.localStorage.removeItem(
            'ambient-mixer-telemetry'
          )
        })

        const getTelemetryEvents =
          async () =>
            page.evaluate(
              (): TelemetryEvent[] => {
                const stored =
                  window.localStorage.getItem(
                    'ambient-mixer-telemetry'
                  )

                if (!stored) {
                  return []
                }

                return JSON.parse(
                  stored
                ) as TelemetryEvent[]
              }
            )

        await page
          .getByRole('button', {
            name: 'Show timer',
          })
          .click()

        const timerSettings =
          page.getByRole('button', {
            name:
              /Change timer settings, focus has/,
          })

        await timerSettings.click()

        const settingsMenu =
          page.getByRole('menu', {
            name: 'Timer settings',
          })

        const focusGroup =
          settingsMenu.getByRole(
            'group',
            {
              name:
                'Focus duration',
            }
          )

        const focusPresets =
          focusGroup.getByRole(
            'menuitemradio'
          )

        const focusCount =
          await focusPresets.count()

        let shortestFocusMinutes =
          Number.POSITIVE_INFINITY

        let shortestFocusOption =
          focusPresets.first()

        for (
          let index = 0;
          index < focusCount;
          index += 1
        ) {
          const option =
            focusPresets.nth(
              index
            )

          const text =
            (await option.textContent()) ??
            ''

          const minutes =
            Number(
              text.match(
                /(\d+)\s*min/
              )?.[1]
            )

          if (
            Number.isFinite(
              minutes
            ) &&
            minutes <
              shortestFocusMinutes
          ) {
            shortestFocusMinutes =
              minutes

            shortestFocusOption =
              option
          }
        }

        await shortestFocusOption.click()

        /*
         * Configure shortest break.
         */
        await timerSettings.click()

        const updatedSettingsMenu =
          page.getByRole('menu', {
            name: 'Timer settings',
          })

        const updatedBreakGroup =
          updatedSettingsMenu.getByRole(
            'group',
            {
              name:
                'Break duration',
            }
          )

        const breakPresets =
          updatedBreakGroup.getByRole(
            'menuitemradio'
          )

        const breakCount =
          await breakPresets.count()

        let shortestBreakMinutes =
          Number.POSITIVE_INFINITY

        let shortestBreakOption =
          breakPresets.first()

        for (
          let index = 0;
          index < breakCount;
          index += 1
        ) {
          const option =
            breakPresets.nth(
              index
            )

          const text =
            (await option.textContent()) ??
            ''

          const minutes =
            Number(
              text.match(
                /(\d+)\s*min/
              )?.[1]
            )

          if (
            Number.isFinite(
              minutes
            ) &&
            minutes <
              shortestBreakMinutes
          ) {
            shortestBreakMinutes =
              minutes

            shortestBreakOption =
              option
          }
        }

        await shortestBreakOption.click()

        /*
         * Configure two focus sessions.
         */
        await timerSettings.click()

        await page
          .getByRole('group', {
            name:
              'Number of focus sessions',
          })
          .getByRole('button', {
            name:
              '2 focus sessions',
          })
          .click()

        /*
         * Start focus session 1.
         */
        await page
          .getByRole('button', {
            name: 'Start timer',
          })
          .click()

        await expect(
          page.getByRole(
            'button',
            {
              name:
                'Pause timer',
            }
          )
        ).toBeVisible()

        /*
         * Session 1 should emit
         * exactly one start.
         */
        await expect
          .poll(async () => {
            const events =
              await getTelemetryEvents()

            return events.filter(
              (event) =>
                event.event ===
                  'focus_session_started' &&
                event.properties
                  .sessionNumber ===
                  1
            ).length
          })
          .toBe(1)

        /*
         * Advance just beyond the
         * focus-session boundary.
         *
         * The additional second gives
         * React time to process the
         * zero-second transition.
         */
        await page.clock.runFor(
          shortestFocusMinutes *
            60 *
            1000 +
            1000
        )

        await expect(
          page.getByRole(
            'button',
            {
              name:
                /Change timer settings, break has/,
            }
          )
        ).toBeVisible()

        await expect(
          page.getByRole(
            'button',
            {
              name:
                'Pause break',
            }
          )
        ).toBeVisible()

        /*
         * Session 1 completion should
         * exist exactly once.
         */
        await expect
          .poll(async () => {
            const events =
              await getTelemetryEvents()

            return events.filter(
              (event) =>
                event.event ===
                  'focus_session_completed' &&
                event.properties
                  .sessionNumber ===
                  1
            ).length
          })
          .toBe(1)

        /*
         * Session 1 must still have
         * only one start event.
         */
        await expect
          .poll(async () => {
            const events =
              await getTelemetryEvents()

            return events.filter(
              (event) =>
                event.event ===
                  'focus_session_started' &&
                event.properties
                  .sessionNumber ===
                  1
            ).length
          })
          .toBe(1)

        /*
         * Advance just beyond the
         * break boundary.
         */
        await page.clock.runFor(
          shortestBreakMinutes *
            60 *
            1000 +
            1000
        )

        /*
         * Session 2 should now be
         * active automatically.
         */
        await expect(
          page.getByRole(
            'button',
            {
              name:
                /Change timer settings, focus has/,
            }
          )
        ).toBeVisible()

        await expect(
          page.getByText('2/2')
        ).toBeVisible()

        /*
         * Automatic start of session 2
         * should be captured once.
         */
        await expect
          .poll(async () => {
            const events =
              await getTelemetryEvents()

            return events.filter(
              (event) =>
                event.event ===
                  'focus_session_started' &&
                event.properties
                  .sessionNumber ===
                  2
            ).length
          })
          .toBe(1)

        /*
         * Verify the complete focus
         * telemetry sequence.
         */
        const focusEvents =
          (
            await getTelemetryEvents()
          ).filter(
            (event) =>
              event.event ===
                'focus_session_started' ||
              event.event ===
                'focus_session_completed'
          )

        expect(
          focusEvents.map(
            (event) => ({
              event:
                event.event,

              sessionNumber:
                event.properties
                  .sessionNumber,
            })
          )
        ).toEqual([
          {
            event:
              'focus_session_started',
            sessionNumber: 1,
          },
          {
            event:
              'focus_session_completed',
            sessionNumber: 1,
          },
          {
            event:
              'focus_session_started',
            sessionNumber: 2,
          },
        ])
      }
    )
  }
)