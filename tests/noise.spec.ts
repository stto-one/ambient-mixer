import { test, expect } from '@playwright/test'

test.describe('Generated noise', () => {
  test(
  'user can add and control generated noise',
  {
    tag: [
      '@regressionTest',
      '@webApp',
      '@noiseGenerator',
      '@masterControls',
    ],
  },
  async ({ page }) => {
    await page.goto('/')

    await page
      .getByRole('button', {
        name: 'Add sounds',
      })
      .click()

    const soundLibrary = page.getByRole('region', {
      name: 'Sound library',
    })

    const whiteNoiseOption =
      soundLibrary.getByRole('button', {
        name: /White Noise/,
      })

    await expect(whiteNoiseOption).toHaveAttribute(
      'aria-pressed',
      'false'
    )

    await whiteNoiseOption.click()

    await expect(whiteNoiseOption).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    /*
     * Close the library before interacting
     * with the mixer.
     */
    await soundLibrary
      .getByRole('button', {
        name: 'Close sound library',
      })
      .click()

    await expect(soundLibrary).not.toBeVisible()

    const mixer = page.locator('.sound-grid')

    const whiteNoise = mixer.getByRole('button', {
      name: /White Noise/,
    })

    await expect(whiteNoise).toBeVisible()

    /*
     * Start generated noise.
     */
    await whiteNoise.click()

    await expect(whiteNoise).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    /*
     * Adjust generated-noise volume.
     */
    const whiteNoiseVolume =
      page.getByRole('slider', {
        name: 'White Noise volume',
      })

    await expect(whiteNoiseVolume).toBeVisible()

    await whiteNoiseVolume.fill('65')

    await expect(whiteNoiseVolume).toHaveValue('65')

    /*
     * Master mute should preserve
     * the active noise state.
     */
    const muteToggle = page.getByRole('button', {
      name: /^(Mute|Unmute)$/,
    })

    await expect(muteToggle).toHaveAccessibleName(
      'Mute'
    )

    await muteToggle.click()

    await expect(muteToggle).toHaveAccessibleName(
      'Unmute'
    )

    await expect(whiteNoise).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    /*
     * Unmute should also preserve
     * the active noise state.
     */
    await muteToggle.click()

    await expect(muteToggle).toHaveAccessibleName(
      'Mute'
    )

    await expect(whiteNoise).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    /*
     * Clear All should stop generated noise.
     */
    await page
      .getByRole('button', {
        name: 'Clear all sounds',
      })
      .click()

    await expect(whiteNoise).toHaveAttribute(
      'aria-pressed',
      'false'
    )

    await expect(whiteNoiseVolume).not.toBeVisible()
  }
)

  test(
    'sound library exposes all generated noise types',
    {
      tag: [
        '@regressionTest',
        '@webApp',
        '@noiseGenerator',
        '@soundLibrary',
      ],
    },
    async ({ page }) => {
      await page.goto('/')

      await page
        .getByRole('button', {
          name: 'Add sounds',
        })
        .click()

      const soundLibrary = page.getByRole('region', {
        name: 'Sound library',
      })

      await expect(
        soundLibrary.getByRole('button', {
          name: /White Noise/,
        })
      ).toBeVisible()

      await expect(
        soundLibrary.getByRole('button', {
          name: /Pink Noise/,
        })
      ).toBeVisible()

      await expect(
        soundLibrary.getByRole('button', {
          name: /Brown Noise/,
        })
      ).toBeVisible()

      await expect(
        soundLibrary.getByRole('button', {
          name: /Green Noise/,
        })
      ).toBeVisible()
    }
  )
})