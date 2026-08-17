import type { TimerState } from '../timer/timer'

import {
  publicAsset,
} from '../utils/publicAsset'

export const COMPLETION_CUE_FADE_SECONDS = 5
export const COMPLETION_CUE_TOTAL_SECONDS = 10
export const COMPLETION_CUE_CANCEL_FADE_SECONDS = 0.25

export type CompletionCueController = {
  start: () => Promise<void>
  cancel: () => void
}

export const shouldStartCompletionCue = (
  timer: TimerState
): boolean => {
  return (
    timer.isRunning &&
    timer.remainingSeconds === 5
  )
}

export const createCompletionCueController =
  (): CompletionCueController => {
    const audio = new Audio(publicAsset('/audio/dreamy.mp3'))

    let audioContext: AudioContext | null = null
    let sourceNode: MediaElementAudioSourceNode | null = null
    let gainNode: GainNode | null = null

    let stopTimeout: number | null = null
    let isPlaying = false

    const initialiseAudioGraph = () => {
      if (audioContext && sourceNode && gainNode) {
        return
      }

      audioContext = new AudioContext()

      sourceNode =
        audioContext.createMediaElementSource(audio)

      gainNode =
        audioContext.createGain()

      sourceNode.connect(gainNode)
      gainNode.connect(audioContext.destination)
    }

    const clearStopTimeout = () => {
      if (stopTimeout !== null) {
        window.clearTimeout(stopTimeout)
        stopTimeout = null
      }
    }

    const stopAndReset = () => {
      clearStopTimeout()

      audio.pause()
      audio.currentTime = 0

      isPlaying = false
    }

    const start = async () => {
      if (isPlaying) {
        return
      }

      initialiseAudioGraph()

      if (!audioContext || !gainNode) {
        return
      }

      clearStopTimeout()

      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }

      audio.currentTime = 0

      const now = audioContext.currentTime

      gainNode.gain.cancelScheduledValues(now)

      gainNode.gain.setValueAtTime(
        0,
        now
      )

      try {
        await audio.play()
      } catch (error) {
        console.error(
          'completion_cue_playback_failed',
          error
        )

        stopAndReset()
        return
      }

      isPlaying = true

      const playbackStartTime =
        audioContext.currentTime

      gainNode.gain.setValueAtTime(
        0,
        playbackStartTime
      )

      gainNode.gain.linearRampToValueAtTime(
        1,
        playbackStartTime +
          COMPLETION_CUE_FADE_SECONDS
      )

      gainNode.gain.linearRampToValueAtTime(
        0,
        playbackStartTime +
          COMPLETION_CUE_TOTAL_SECONDS
      )

      stopTimeout = window.setTimeout(
        stopAndReset,
        COMPLETION_CUE_TOTAL_SECONDS * 1000
      )
    }

    const cancel = () => {
      clearStopTimeout()

      if (
        !isPlaying ||
        !audioContext ||
        !gainNode
      ) {
        stopAndReset()
        return
      }

      const now = audioContext.currentTime

      gainNode.gain.cancelAndHoldAtTime(now)

      gainNode.gain.linearRampToValueAtTime(
        0,
        now +
          COMPLETION_CUE_CANCEL_FADE_SECONDS
      )

      stopTimeout = window.setTimeout(
        stopAndReset,
        COMPLETION_CUE_CANCEL_FADE_SECONDS *
          1000
      )
    }

    return {
      start,
      cancel,
    }
  }