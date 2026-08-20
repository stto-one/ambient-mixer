import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  Waves,
  ZodiacAquarius,
} from 'lucide-react'

import {
  createNoiseController,
  type NoiseController,
} from '../audio/noiseController'

import type {
  NoiseType,
} from '../audio/noiseGenerator'

import {
  logger,
} from '../observability/logger'

import {
  telemetry,
  type SoundStopReason,
} from '../telemetry/telemetry'

type NoiseSoundCardProps = {
  soundId: string
  name: string
  icon: string
  noiseType: NoiseType
  stopSignal: number
  masterVolume: number
}

function NoiseSoundCard({
  soundId,
  name,
  icon,
  noiseType,
  stopSignal,
  masterVolume,
}: NoiseSoundCardProps) {
  const [isPlaying, setIsPlaying] =
    useState(false)

  const [volume, setVolume] =
    useState(50)

  const controllerRef =
    useRef<NoiseController | null>(
      null
    )

  const playbackStartedAtRef =
    useRef<number | null>(null)

  const isPlayingRef =
    useRef(false)

  const updatePlayingState = (
    nextIsPlaying: boolean
  ) => {
    isPlayingRef.current =
      nextIsPlaying

    setIsPlaying(
      nextIsPlaying
    )
  }

  const trackSoundStopped =
    useCallback(
      (
        stopReason:
          SoundStopReason
      ) => {
        const playbackStartedAt =
          playbackStartedAtRef.current

        if (
          playbackStartedAt ===
          null
        ) {
          return
        }

        const playDurationSeconds =
          Math.max(
            0,
            Math.round(
              (
                performance.now() -
                playbackStartedAt
              ) / 1000
            )
          )

        telemetry.track(
          'sound_stopped',
          {
            soundId,
            sourceType: 'noise',
            noiseType,
            stopReason,
            playDurationSeconds,
          }
        )

        playbackStartedAtRef.current =
          null
      },
      [
        soundId,
        noiseType,
      ]
    )

  /*
   * Create one controller for this card.
   */
  useEffect(() => {
    const controller =
      createNoiseController(
        noiseType
      )

    controllerRef.current =
      controller

    return () => {
      if (
        isPlayingRef.current
      ) {
        trackSoundStopped(
          'removed'
        )
      }

      controller.stop()
      controller.dispose()

      isPlayingRef.current =
        false

      controllerRef.current =
        null
    }
  }, [
    noiseType,
    trackSoundStopped,
  ])

  /*
   * Apply individual × master volume.
   */
  useEffect(() => {
    const effectiveVolume =
      (volume / 100) *
      (masterVolume / 100)

    controllerRef.current?.setVolume(
      effectiveVolume
    )
  }, [
    volume,
    masterVolume,
  ])

  /*
   * Respond to Clear All.
   */
  useEffect(() => {
    const controller =
      controllerRef.current

    if (!controller) {
      return
    }

    if (isPlayingRef.current) {
      trackSoundStopped(
        'clear_all'
      )
    }

    controller.stop()
    updatePlayingState(false)
  }, [
    stopSignal,
    trackSoundStopped,
  ])

  const toggleNoise = async () => {
    const controller =
      controllerRef.current

    if (!controller) {
      return
    }

    /*
     * User stops active noise.
     */
    if (isPlayingRef.current) {
      controller.stop()

      trackSoundStopped(
        'user'
      )

      updatePlayingState(false)

      return
    }

    /*
     * Start generated noise.
     */
    try {
      await controller.start()

      playbackStartedAtRef.current =
        performance.now()

      updatePlayingState(true)

      telemetry.track(
        'sound_started',
        {
          soundId,
          sourceType: 'noise',
          noiseType,
        }
      )
    } catch (error) {
      logger.error(
        'noise_playback_failed',
        {
          soundName: name,
          noiseType,
          sourceType: 'noise',
          error,
        }
      )
    }
  }

  const handleKeyDown = (
    event:
      React.KeyboardEvent<HTMLElement>
  ) => {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault()
      void toggleNoise()
    }
  }

  const getIcon = (
    iconName: string
  ) => {
    const normalisedIconName =
      iconName.trim().toLowerCase()

    switch (normalisedIconName) {
      case 'zodiac-aquarius':
        return (
          <ZodiacAquarius size={32} />
        )

      case 'waves':
        return (
          <Waves size={32} />
        )

      default:
        logger.warn(
          'unsupported_noise_icon',
          {
            soundName: name,
            icon: iconName,
            noiseType,
          }
        )

        return null
    }
  }

  return (
    <section
      className={`sound-card ${
        isPlaying
          ? 'active'
          : ''
      }`}
      onClick={() => {
        void toggleNoise()
      }}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isPlaying}
      aria-label={`${
        isPlaying
          ? 'Stop'
          : 'Play'
      } ${name}`}
    >
      <div
        className="sound-icon"
        data-tooltip={name}
      >
        {getIcon(icon)}
      </div>

      <input
        className="volume-slider"
        type="range"
        min="0"
        max="100"
        value={volume}
        aria-label={`${name} volume`}
        onPointerDown={(event) =>
          event.stopPropagation()
        }
        onClick={(event) =>
          event.stopPropagation()
        }
        onKeyDown={(event) =>
          event.stopPropagation()
        }
        onChange={(event) =>
          setVolume(
            Number(
              event.target.value
            )
          )
        }
      />
    </section>
  )
}

export default NoiseSoundCard