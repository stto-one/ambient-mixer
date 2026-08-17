export type NoiseType =
  | 'white'
  | 'pink'
  | 'brown'
  | 'green'

const clampSample = (
  value: number
): number => {
  return Math.max(
    -1,
    Math.min(1, value)
  )
}

const generateWhiteNoise = (
  length: number
): Float32Array => {
  const samples =
    new Float32Array(length)

  for (let index = 0; index < length; index += 1) {
    samples[index] =
      Math.random() * 2 - 1
  }

  return samples
}

const generatePinkNoise = (
  length: number
): Float32Array => {
  const samples =
    new Float32Array(length)

  /*
   * Paul Kellet-style approximation.
   *
   * Multiple filtered white-noise bands
   * create the characteristic softer
   * spectral balance of pink noise.
   */
  let b0 = 0
  let b1 = 0
  let b2 = 0
  let b3 = 0
  let b4 = 0
  let b5 = 0
  let b6 = 0

  for (let index = 0; index < length; index += 1) {
    const white =
      Math.random() * 2 - 1

    b0 =
      0.99886 * b0 +
      white * 0.0555179

    b1 =
      0.99332 * b1 +
      white * 0.0750759

    b2 =
      0.969 * b2 +
      white * 0.153852

    b3 =
      0.8665 * b3 +
      white * 0.3104856

    b4 =
      0.55 * b4 +
      white * 0.5329522

    b5 =
      -0.7616 * b5 -
      white * 0.016898

    const pink =
      b0 +
      b1 +
      b2 +
      b3 +
      b4 +
      b5 +
      b6 +
      white * 0.5362

    b6 =
      white * 0.115926

    /*
     * Normalise the approximation so
     * it remains comfortably within
     * the Web Audio sample range.
     */
    samples[index] =
      clampSample(
        pink * 0.11
      )
  }

  return samples
}

const generateBrownNoise = (
  length: number
): Float32Array => {
  const samples =
    new Float32Array(length)

  let previousSample = 0

  for (let index = 0; index < length; index += 1) {
    const white =
      Math.random() * 2 - 1

    /*
     * Integrating white noise produces
     * the deeper low-frequency character
     * associated with brown noise.
     */
    const brown =
      (
        previousSample +
        0.02 * white
      ) / 1.02

    previousSample = brown

    samples[index] =
      clampSample(
        brown * 3.5
      )
  }

  return samples
}

const generateGreenNoise = (
  length: number
): Float32Array => {
  const samples =
    new Float32Array(length)

  /*
   * Green noise doesn't have one
   * universally standardised formula.
   *
   * For Ambient Mixer we define it as
   * a softer, nature-like noise with
   * less high-frequency harshness than
   * white noise while retaining more
   * mid-frequency texture than brown.
   *
   * This simple smoothing filter gives
   * us that useful starting profile.
   */
  let previousSample = 0

  for (let index = 0; index < length; index += 1) {
    const white =
      Math.random() * 2 - 1

    const smoothed =
      previousSample * 0.82 +
      white * 0.18

    previousSample = smoothed

    samples[index] =
      clampSample(
        smoothed * 1.8
      )
  }

  return samples
}

export const generateNoiseSamples = (
  type: NoiseType,
  length: number
): Float32Array => {
  if (
    !Number.isInteger(length) ||
    length <= 0
  ) {
    throw new Error(
      'Noise sample length must be a positive integer.'
    )
  }

  switch (type) {
    case 'white':
      return generateWhiteNoise(
        length
      )

    case 'pink':
      return generatePinkNoise(
        length
      )

    case 'brown':
      return generateBrownNoise(
        length
      )

    case 'green':
      return generateGreenNoise(
        length
      )

    default: {
      const exhaustiveCheck:
        never = type

      throw new Error(
        `Unsupported noise type: ${exhaustiveCheck}`
      )
    }
  }
}