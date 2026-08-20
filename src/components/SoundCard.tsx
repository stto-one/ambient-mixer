import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  Bell,
  Bird,
  CloudLightning,
  CloudRain,
  Coffee,
  FishSymbol,
  Flame,
  Sprout,
  Utensils,
  WavesHorizontal,
  ZodiacAquarius,
} from 'lucide-react'

import {
  logger,
} from '../observability/logger'

import {
  telemetry,
  type SoundStopReason,
} from '../telemetry/telemetry'

type SoundCardProps = {
  soundId: string
  name: string
  audioFile: string
  icon: string
  stopSignal: number
  masterVolume: number
}

function SoundCard({
  soundId,
  name,
  audioFile,
  icon,
  stopSignal,
  masterVolume,
}: SoundCardProps) {
  const audioRef =
    useRef<HTMLAudioElement | null>(
      null
    )

  const playbackStartedAtRef =
    useRef<number | null>(null)

  const isPlayingRef =
    useRef(false)

  const [isPlaying, setIsPlaying] =
    useState(false)

  const [volume, setVolume] =
    useState(50)

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
            sourceType: 'audio',
            stopReason,
            playDurationSeconds,
          }
        )

        playbackStartedAtRef.current =
          null
      },
      [soundId]
    )

  /*
   * Apply individual × master volume.
   */
  useEffect(() => {
    if (!audioRef.current) {
      return
    }

    audioRef.current.volume =
      (volume / 100) *
      (masterVolume / 100)
  }, [
    volume,
    masterVolume,
  ])

  /*
   * Respond to Clear All.
   */
  useEffect(() => {
    const audio =
      audioRef.current

    if (!audio) {
      return
    }

    if (isPlayingRef.current) {
      trackSoundStopped(
        'clear_all'
      )
    }

    audio.pause()
    audio.currentTime = 0

    updatePlayingState(false)
  }, [
    stopSignal,
    trackSoundStopped,
  ])

  /*
   * Capture removal while playing.
   */
  useEffect(() => {
    const audio =
      audioRef.current

    return () => {
      if (
        isPlayingRef.current
      ) {
        trackSoundStopped(
          'removed'
        )
      }

      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }

      isPlayingRef.current =
        false
    }
  }, [trackSoundStopped])

  const toggleSound = async () => {
    const audio =
      audioRef.current

    if (!audio) {
      return
    }

    /*
     * User stops active sound.
     */
    if (isPlayingRef.current) {
      audio.pause()
      audio.currentTime = 0

      trackSoundStopped(
        'user'
      )

      updatePlayingState(false)

      return
    }

    /*
     * Start sound.
     */
    try {
      await audio.play()

      playbackStartedAtRef.current =
        performance.now()

      updatePlayingState(true)

      telemetry.track(
        'sound_started',
        {
          soundId,
          sourceType: 'audio',
        }
      )
    } catch (error) {
      logger.error(
        'audio_playback_failed',
        {
          soundName: name,
          sourceType: 'audio',
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

      void toggleSound()
    }
  }

  const getIcon = (
    iconName: string
  ) => {
    const normalisedIconName =
      iconName.trim().toLowerCase()

    switch (normalisedIconName) {
      case 'rain':
        return (
          <CloudRain size={32} />
        )

      case 'bird':
        return (
          <Bird size={32} />
        )

      case 'coffee':
        return (
          <Coffee size={32} />
        )

      case 'utensils':
        return (
          <Utensils size={32} />
        )

      case 'waves-horizontal':
        return (
          <WavesHorizontal size={32} />
        )

      case 'flame':
        return (
          <Flame size={32} />
        )

      case 'bell':
        return (
          <Bell size={32} />
        )

      case 'zodiac-aquarius':
        return (
          <ZodiacAquarius size={32} />
        )

      case 'sprout':
        return (
          <Sprout size={32} />
        )

      case 'fish-symbol':
        return (
          <FishSymbol size={32} />
        )

      case 'cloud-lightning':
        return (
          <CloudLightning size={32} />
        )

      default:
        logger.warn(
          'unsupported_sound_icon',
          {
            soundName: name,
            icon: iconName,
            sourceType: 'audio',
          }
        )

        return null
    }
  }

  return (
    <section
      className={`sound-card ${
        isPlaying ? 'active' : ''
      }`}
      onClick={() => {
        void toggleSound()
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

      <audio
        ref={audioRef}
        src={audioFile}
        loop
      />
    </section>
  )
}

export default SoundCard