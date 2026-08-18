import { test, expect } from '@playwright/test'

test.describe(
  'Sound playback',
  {
    tag: ['@webApp', '@soundPlayback'],
  },
  () => {
    test(
      'user can start, adjust and stop Gentle Rain',
      {
        tag: ['@smokeTest'],
      },
      async ({ page }) => {
        await test.step('Open Ambient Mixer', async () => {
          await page.goto('/')

          await expect(
            page.getByRole('heading', { name: 'Ambient Mixer' })
          ).toBeVisible()
        })

        const gentleRain = page.getByRole('button', {
          name: /Gentle Rain/,
        })

        const gentleRainVolume = page.getByRole('slider', {
          name: 'Gentle Rain volume',
        })

        await test.step('Gentle Rain starts inactive', async () => {
          await expect(gentleRain).toHaveAttribute(
            'aria-pressed',
            'false'
          )

          await expect(gentleRainVolume).not.toBeVisible()
        })

        await test.step('Activate Gentle Rain', async () => {
          await gentleRain.click()

          await expect(gentleRain).toHaveAttribute(
            'aria-pressed',
            'true'
          )

          await expect(gentleRainVolume).toBeVisible()
        })

        await test.step('Adjust Gentle Rain volume', async () => {
          await gentleRainVolume.fill('70')
          await expect(gentleRainVolume).toHaveValue('70')
        })

        await test.step('Stop Gentle Rain', async () => {
          await gentleRain.click()

          await expect(gentleRain).toHaveAttribute(
            'aria-pressed',
            'false'
          )

          await expect(gentleRainVolume).not.toBeVisible()
        })
      }
    )

    test(
      'user can mix multiple sounds independently and clear them all',
      {
        tag: ['@smokeTest', '@masterControls'],
      },
      async ({ page }) => {
        await page.goto('/')

        const gentleRain = page.getByRole('button', {
          name: /Gentle Rain/,
        })

        const tui = page.getByRole('button', {
          name: /Tūī/,
        })

        const gentleRainVolume = page.getByRole('slider', {
          name: 'Gentle Rain volume',
        })

        const tuiVolume = page.getByRole('slider', {
          name: 'Tūī volume',
        })

        const clearAll = page.getByRole('button', {
          name: 'Clear all sounds',
        })

        await test.step('Activate Gentle Rain and Tūī', async () => {
          await gentleRain.click()
          await tui.click()

          await expect(gentleRain).toHaveAttribute(
            'aria-pressed',
            'true'
          )
          await expect(tui).toHaveAttribute('aria-pressed', 'true')
          await expect(gentleRainVolume).toBeVisible()
          await expect(tuiVolume).toBeVisible()
        })

        await test.step(
          'Adjust Gentle Rain independently',
          async () => {
            await gentleRainVolume.fill('30')

            await expect(gentleRainVolume).toHaveValue('30')
            await expect(tui).toHaveAttribute('aria-pressed', 'true')
            await expect(tuiVolume).toBeVisible()
          }
        )

        await test.step('Clear all active sounds', async () => {
          await clearAll.click()

          await expect(gentleRain).toHaveAttribute(
            'aria-pressed',
            'false'
          )
          await expect(tui).toHaveAttribute('aria-pressed', 'false')
          await expect(gentleRainVolume).not.toBeVisible()
          await expect(tuiVolume).not.toBeVisible()
        })
      }
    )

    test(
      'mute preserves active sounds and unmute restores them',
      {
        tag: ['@smokeTest', '@masterControls'],
      },
      async ({ page }) => {
        await page.goto('/')

        const gentleRain = page.getByRole('button', {
          name: /Gentle Rain/,
        })

        const tui = page.getByRole('button', {
          name: /Tūī/,
        })

        const gentleRainVolume = page.getByRole('slider', {
          name: 'Gentle Rain volume',
        })

        const tuiVolume = page.getByRole('slider', {
          name: 'Tūī volume',
        })

        const muteToggle = page.getByRole('button', {
          name: /^(Mute|Unmute)$/,
        })

        await test.step('Activate Gentle Rain and Tūī', async () => {
          await gentleRain.click()
          await tui.click()

          await expect(gentleRain).toHaveAttribute(
            'aria-pressed',
            'true'
          )
          await expect(tui).toHaveAttribute('aria-pressed', 'true')
          await expect(gentleRainVolume).toBeVisible()
          await expect(tuiVolume).toBeVisible()
        })

        await test.step(
          'Mute while preserving active sounds',
          async () => {
            await expect(muteToggle).toHaveAccessibleName('Mute')

            await muteToggle.click()

            await expect(muteToggle).toHaveAccessibleName('Unmute')
            await expect(gentleRain).toHaveAttribute(
              'aria-pressed',
              'true'
            )
            await expect(tui).toHaveAttribute('aria-pressed', 'true')
            await expect(gentleRainVolume).toBeVisible()
            await expect(tuiVolume).toBeVisible()
          }
        )

        await test.step(
          'Unmute while preserving active sounds',
          async () => {
            await muteToggle.click()

            await expect(muteToggle).toHaveAccessibleName('Mute')
            await expect(gentleRain).toHaveAttribute(
              'aria-pressed',
              'true'
            )
            await expect(tui).toHaveAttribute('aria-pressed', 'true')
            await expect(gentleRainVolume).toBeVisible()
            await expect(tuiVolume).toBeVisible()
          }
        )
      }
    )
  }
)