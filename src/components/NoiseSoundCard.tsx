import {
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

type NoiseSoundCardProps = {
  name: string
  icon: string
  noiseType: NoiseType
  stopSignal: number
  masterVolume: number
}

function NoiseSoundCard({
  name,
  icon,
  noiseType,
  stopSignal,
  masterVolume,
}: NoiseSoundCardProps) {
  const [
    isPlaying,
    setIsPlaying,
  ] = useState(false)

  const [
    volume,
    setVolume,
  ] = useState(50)

  const controllerRef =
    useRef<NoiseController | null>(
      null
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
      controller.dispose()

      controllerRef.current =
        null
    }
  }, [noiseType])

  /*
   * Apply individual × master volume.
   */
  useEffect(() => {
    const effectiveVolume =
      (volume / 100) *
      (masterVolume / 100)

    controllerRef.current
      ?.setVolume(
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
    controllerRef.current
      ?.stop()

    setIsPlaying(false)
  }, [stopSignal])

  const toggleNoise = async () => {
    const controller =
      controllerRef.current

    if (!controller) {
      return
    }

    if (isPlaying) {
      controller.stop()
      setIsPlaying(false)
      return
    }

    try {
      await controller.start()
      setIsPlaying(true)
    } catch (error) {
      console.error(
        `Unable to play ${name}`,
        error
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
        console.warn(
          'unsupported_noise_icon',
          {
            sound: name,
            icon: iconName,
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