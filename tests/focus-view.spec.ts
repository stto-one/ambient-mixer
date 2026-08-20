import { test, expect } from '@playwright/test'

test.describe('Focus view', () => {
  test(
    'focus view preserves an active soundscape and running timer',
    {
      tag: [
        '@regressionTest',
        '@webApp',
        '@focusView',
        '@timer',
        '@soundPlayback',
      ],
    },
    async ({ page }) => {
      await page.goto('/')

      const gentleRain = page.getByRole('button', {
        name: /Gentle Rain/,
      })

      await gentleRain.click()

      await expect(gentleRain).toHaveAttribute(
        'aria-pressed',
        'true'
      )

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

      await expect(
        page.getByRole('button', {
          name: 'Pause timer',
        })
      ).toBeVisible()

      await page
        .getByRole('button', {
          name: 'Enter focus view',
        })
        .click()

      const focusView = page.getByRole('region', {
        name: 'Focus view',
      })

      await expect(focusView).toBeVisible()

      const showFocusTimer = focusView.getByRole(
        'button',
        {
          name: 'Show focus timer',
        }
      )

      await expect(showFocusTimer).toBeVisible()

      await showFocusTimer.click()

      await expect(
        focusView.getByRole('button', {
          name: 'Hide focus timer',
        })
      ).toBeVisible()

      const visibleTimer =
        focusView.locator('.focus-view-time')

      const timeBefore =
        await visibleTimer.textContent()

      await page.waitForTimeout(1100)

      const timeAfter =
        await visibleTimer.textContent()

      expect(timeAfter).not.toBe(timeBefore)

      await focusView
        .getByRole('button', {
          name: 'Exit focus view',
        })
        .click()

      await expect(focusView).not.toBeVisible()

      await expect(gentleRain).toHaveAttribute(
        'aria-pressed',
        'true'
      )

      await expect(
        page.getByRole('button', {
          name: 'Pause timer',
        })
      ).toBeVisible()
    }
  )
})