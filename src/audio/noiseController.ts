import {
  generateNoiseSamples,
  type NoiseType,
} from './noiseGenerator'

const BUFFER_SECONDS = 10
const FADE_SECONDS = 0.15

export type NoiseController = {
  start: () => Promise<void>
  stop: () => void
  setVolume: (volume: number) => void
  dispose: () => void
}

export const createNoiseController = (
  noiseType: NoiseType
): NoiseController => {
  let audioContext: AudioContext | null = null
  let sourceNode: AudioBufferSourceNode | null = null
  let gainNode: GainNode | null = null

  let volume = 0.5
  let isPlaying = false
  let stopTimeout: number | null = null

  const clearStopTimeout = () => {
    if (stopTimeout !== null) {
      window.clearTimeout(stopTimeout)
      stopTimeout = null
    }
  }

  const createAudioGraph = () => {
    if (!audioContext) {
      audioContext = new AudioContext()
    }

    if (!gainNode) {
      gainNode =
        audioContext.createGain()

      gainNode.gain.value = 0

      gainNode.connect(
        audioContext.destination
      )
    }
  }

  const createSource = () => {
    if (!audioContext) {
      return null
    }

    const sampleRate =
      audioContext.sampleRate

    const sampleCount =
      sampleRate * BUFFER_SECONDS

    const samples =
      generateNoiseSamples(
        noiseType,
        sampleCount
      )

    const buffer =
      audioContext.createBuffer(
        1,
        sampleCount,
        sampleRate
      )

    buffer
      .getChannelData(0)
      .set(samples)

    const source =
      audioContext
        .createBufferSource()

    source.buffer = buffer
    source.loop = true

    if (gainNode) {
      source.connect(gainNode)
    }

    return source
  }

  const start = async () => {
    if (isPlaying) {
      return
    }

    clearStopTimeout()

    createAudioGraph()

    if (
      !audioContext ||
      !gainNode
    ) {
      return
    }

    if (
      audioContext.state ===
      'suspended'
    ) {
      await audioContext.resume()
    }

    sourceNode =
      createSource()

    if (!sourceNode) {
      return
    }

    const now =
      audioContext.currentTime

    gainNode.gain
      .cancelScheduledValues(now)

    gainNode.gain
      .setValueAtTime(
        0,
        now
      )

    gainNode.gain
      .linearRampToValueAtTime(
        volume,
        now + FADE_SECONDS
      )

    sourceNode.start()

    isPlaying = true
  }

  const stop = () => {
    if (
      !isPlaying ||
      !audioContext ||
      !gainNode ||
      !sourceNode
    ) {
      return
    }

    clearStopTimeout()

    const sourceToStop =
      sourceNode

    sourceNode = null
    isPlaying = false

    const now =
      audioContext.currentTime

    gainNode.gain
      .cancelAndHoldAtTime(now)

    gainNode.gain
      .linearRampToValueAtTime(
        0,
        now + FADE_SECONDS
      )

    stopTimeout =
      window.setTimeout(
        () => {
          try {
            sourceToStop.stop()
          } catch {
            // Source may already have stopped.
          }

          sourceToStop.disconnect()

          stopTimeout = null
        },
        FADE_SECONDS * 1000
      )
  }

  const setVolume = (
    nextVolume: number
  ) => {
    volume = Math.max(
      0,
      Math.min(
        1,
        nextVolume
      )
    )

    if (
      !audioContext ||
      !gainNode ||
      !isPlaying
    ) {
      return
    }

    const now =
      audioContext.currentTime

    gainNode.gain
      .cancelScheduledValues(now)

    gainNode.gain
      .setTargetAtTime(
        volume,
        now,
        0.02
      )
  }

  const dispose = () => {
    clearStopTimeout()

    if (sourceNode) {
      try {
        sourceNode.stop()
      } catch {
        // Source may already have stopped.
      }

      sourceNode.disconnect()
      sourceNode = null
    }

    if (gainNode) {
      gainNode.disconnect()
      gainNode = null
    }

    if (audioContext) {
      void audioContext.close()
      audioContext = null
    }

    isPlaying = false
  }

  return {
    start,
    stop,
    setVolume,
    dispose,
  }
}