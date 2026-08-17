import {
  describe,
  expect,
  test,
} from 'vitest'

import {
  generateNoiseSamples,
  type NoiseType,
} from './noiseGenerator'

const NOISE_TYPES: NoiseType[] = [
  'white',
  'pink',
  'brown',
  'green',
]

const expectSamplesWithinRange = (
  samples: Float32Array
) => {
  for (const sample of samples) {
    expect(sample).toBeGreaterThanOrEqual(-1)
    expect(sample).toBeLessThanOrEqual(1)
  }
}

describe('Noise generator', () => {
  test.each(NOISE_TYPES)(
    'generates the requested number of %s noise samples',
    (noiseType) => {
      const samples =
        generateNoiseSamples(
          noiseType,
          1024
        )

      expect(samples).toHaveLength(
        1024
      )
    }
  )

  test.each(NOISE_TYPES)(
    '%s noise samples remain within the audio sample range',
    (noiseType) => {
      const samples =
        generateNoiseSamples(
          noiseType,
          4096
        )

      expectSamplesWithinRange(
        samples
      )
    }
  )

  test.each(NOISE_TYPES)(
    '%s noise contains varying sample values',
    (noiseType) => {
      const samples =
        generateNoiseSamples(
          noiseType,
          1024
        )

      const uniqueSamples =
        new Set(samples)

      expect(
        uniqueSamples.size
      ).toBeGreaterThan(1)
    }
  )

  test('white noise contains positive and negative samples', () => {
    const samples =
      generateNoiseSamples(
        'white',
        10000
      )

    const containsPositive =
      Array.from(samples).some(
        (sample) => sample > 0
      )

    const containsNegative =
      Array.from(samples).some(
        (sample) => sample < 0
      )

    expect(
      containsPositive
    ).toBe(true)

    expect(
      containsNegative
    ).toBe(true)
  })

  test('rejects a zero sample length', () => {
    expect(() =>
      generateNoiseSamples(
        'white',
        0
      )
    ).toThrow(
      'Noise sample length must be a positive integer.'
    )
  })

  test('rejects a negative sample length', () => {
    expect(() =>
      generateNoiseSamples(
        'pink',
        -100
      )
    ).toThrow(
      'Noise sample length must be a positive integer.'
    )
  })

  test('rejects a fractional sample length', () => {
    expect(() =>
      generateNoiseSamples(
        'brown',
        10.5
      )
    ).toThrow(
      'Noise sample length must be a positive integer.'
    )
  })
})