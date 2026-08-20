import { test, expect } from '@playwright/test'

test.describe(
  'Sound library',
  {
    tag: ['@webApp', '@soundLibrary'],
  },
  () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/')

      await page.evaluate(() => {
        localStorage.clear()
      })

      await page.reload()

      await expect(
        page.getByRole('heading', { name: 'Ambient Mixer' })
      ).toBeVisible()
    })

    test(
      'user can add a sound to the mixer',
      {
        tag: ['@smokeTest'],
      },
      async ({ page }) => {
        const mixer = page.locator('.sound-grid')

        await page
          .getByRole('button', { name: 'Add sounds' })
          .click()

        const soundLibrary = page.getByRole('region', {
          name: 'Sound library',
        })

        const thunderstormOption = soundLibrary.getByRole(
          'button',
          { name: /Thunderstorm/ }
        )

        await expect(thunderstormOption).toBeVisible()
        await expect(thunderstormOption).toHaveAttribute(
          'aria-pressed',
          'false'
        )

        await thunderstormOption.click()

        await expect(thunderstormOption).toHaveAttribute(
          'aria-pressed',
          'true'
        )

        await expect(
          mixer.getByRole('button', {
            name: /Thunderstorm/,
          })
        ).toBeVisible()
      }
    )

    test(
      'user can remove a sound from the mixer',
      {
        tag: ['@regressionTest'],
      },
      async ({ page }) => {
        const mixer = page.locator('.sound-grid')

        const gentleRain = mixer.getByRole('button', {
          name: /Gentle Rain/,
        })

        await expect(gentleRain).toBeVisible()

        await page
          .getByRole('button', { name: 'Add sounds' })
          .click()

        const soundLibrary = page.getByRole('region', {
          name: 'Sound library',
        })

        const gentleRainOption = soundLibrary.getByRole(
          'button',
          { name: /Gentle Rain/ }
        )

        await expect(gentleRainOption).toHaveAttribute(
          'aria-pressed',
          'true'
        )

        await gentleRainOption.click()

        await expect(gentleRainOption).toHaveAttribute(
          'aria-pressed',
          'false'
        )

        await expect(gentleRain).not.toBeVisible()
      }
    )

    test(
      'sound selection persists after page reload',
      {
        tag: ['@regressionTest'],
      },
      async ({ page }) => {
        const mixer = page.locator('.sound-grid')

        await page
          .getByRole('button', { name: 'Add sounds' })
          .click()

        const soundLibrary = page.getByRole('region', {
          name: 'Sound library',
        })

        await soundLibrary
          .getByRole('button', { name: /Thunderstorm/ })
          .click()

        await expect(
          mixer.getByRole('button', {
            name: /Thunderstorm/,
          })
        ).toBeVisible()

        await page.reload()

        await expect(
          mixer.getByRole('button', {
            name: /Thunderstorm/,
          })
        ).toBeVisible()
      }
    )

    test(
      'library shows selected and unselected sound states correctly',
      {
        tag: ['@regressionTest'],
      },
      async ({ page }) => {
        await page
          .getByRole('button', { name: 'Add sounds' })
          .click()

        const soundLibrary = page.getByRole('region', {
          name: 'Sound library',
        })

        const gentleRainOption = soundLibrary.getByRole(
          'button',
          { name: /Gentle Rain/ }
        )

        const thunderstormOption = soundLibrary.getByRole(
          'button',
          { name: /Thunderstorm/ }
        )

        await expect(gentleRainOption).toHaveAttribute(
          'aria-pressed',
          'true'
        )

        await expect(thunderstormOption).toHaveAttribute(
          'aria-pressed',
          'false'
        )
      }
    )
  }
)