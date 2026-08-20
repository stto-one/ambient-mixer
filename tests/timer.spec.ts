import { test, expect } from '@playwright/test'

test.describe(
  'Focus timer',
  {
    tag: ['@webApp', '@timer'],
  },
  () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/')

      await expect(
        page.getByRole('heading', {
          name: 'Ambient Mixer',
        })
      ).toBeVisible()
    })

    test(
      'user can start the default focus timer',
      {
        tag: ['@smokeTest','@webApp','@timer'],
      },
      async ({ page }) => {
        const showTimer = page.getByRole('button', {
          name: 'Show timer',
        })

        await showTimer.click()

        const startTimer = page.getByRole('button', {
          name: 'Start timer',
        })

        await expect(startTimer).toBeVisible()

        await startTimer.click()

        await expect(
          page.getByRole('button', {
            name: 'Pause timer',
          })
        ).toBeVisible()

        await expect(
          page.getByRole('button', {
            name: 'Hide timer',
          })
        ).toBeVisible()
      }
    )

    test(
      'user can pause and resume the focus timer',
      {
        tag: ['@regressionTest','@webApp','@timer'],
      },
      async ({ page }) => {
        await page
          .getByRole('button', {
            name: 'Show timer',
          })
          .click()

        await page
          .getByRole('button', {
            name: 'Start timer',
          })
          .click()

        const pauseTimer = page.getByRole('button', {
          name: 'Pause timer',
        })

        await expect(pauseTimer).toBeVisible()

        await pauseTimer.click()

        const resumeTimer = page.getByRole('button', {
          name: 'Start timer',
        })

        await expect(resumeTimer).toBeVisible()

        await resumeTimer.click()

        await expect(
          page.getByRole('button', {
            name: 'Pause timer',
          })
        ).toBeVisible()
      }
    )

    test(
      'user can reset the focus timer',
      {
        tag: ['@regressionTest','@webApp','@timer'],
      },
      async ({ page }) => {
        await page
          .getByRole('button', {
            name: 'Show timer',
          })
          .click()

        const timerSettings = page.getByRole('button', {
          name: /Change timer settings, focus has/,
        })

        const initialLabel =
          await timerSettings.getAttribute(
            'aria-label'
          )

        await page
          .getByRole('button', {
            name: 'Start timer',
          })
          .click()

        await expect(timerSettings).not.toHaveAttribute(
          'aria-label',
          initialLabel ?? ''
        )

        await page
          .getByRole('button', {
            name: 'Reset timer',
          })
          .click()

        await expect(timerSettings).toHaveAttribute(
          'aria-label',
          initialLabel ?? ''
        )

        await expect(
          page.getByRole('button', {
            name: 'Start timer',
          })
        ).toBeVisible()
      }
    )

    test(
        'user can choose a different focus duration',
        {
            tag: ['@regressionTest','@webApp','@timer',],
        },
        async ({ page }) => {
            await page
            .getByRole('button', {
                name: 'Show timer',
            })
            .click()

            const timerSettings = page.getByRole('button', {
            name: /Change timer settings, focus has/,
            })

            await timerSettings.click()

            const settingsMenu = page.getByRole('menu', {
            name: 'Timer settings',
            })

            const focusGroup = settingsMenu.getByRole('group', {
            name: 'Focus duration',
            })

            const focusPresets =
            focusGroup.getByRole('menuitemradio')

            const currentPreset =
            focusGroup.getByRole('menuitemradio', {
                checked: true,
            })

            const currentPresetText =
            await currentPreset.textContent()

            const alternativePreset =
            focusPresets
                .filter({
                hasNotText: currentPresetText ?? '',
                })
                .first()

            await alternativePreset.click()

            await timerSettings.click()

            const updatedFocusGroup =
            settingsMenu.getByRole('group', {
                name: 'Focus duration',
            })

            await expect(
            updatedFocusGroup.getByRole('menuitemradio', {
                checked: true,
            })
            ).not.toHaveText(
            currentPresetText ?? ''
            )
        }
        )
  }
)