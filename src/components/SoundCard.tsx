import { useEffect, useRef, useState } from 'react'
import {
  Bell,
  Bird,
  CloudRain,
  Coffee,
  Flame,
  Utensils,
  WavesHorizontal,
  ZodiacAquarius,
  Sprout,
  FishSymbol,
  CloudLightning,
} from 'lucide-react'

type SoundCardProps = {
  name: string
  audioFile: string
  icon: string
  stopSignal: number
  masterVolume: number
}

function SoundCard({
  name,
  audioFile,
  icon,
  stopSignal,
  masterVolume,
}: SoundCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(50)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume =
        (volume / 100) * (masterVolume / 100)
    }
  }, [volume, masterVolume])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0

      setIsPlaying(false)
    }
  }, [stopSignal])

  const toggleSound = async () => {
    const audio = audioRef.current

    if (!audio) return

    if (isPlaying) {
      audio.pause()
      audio.currentTime = 0

      setIsPlaying(false)
    } else {
      try {
        await audio.play()
        setIsPlaying(true)
      } catch (error) {
        console.error(`Unable to play ${name}`, error)
      }
    }
  }

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLElement>
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleSound()
    }
  }

  const getIcon = (iconName: string) => {
  const normalisedIconName =
    iconName.trim().toLowerCase()

  switch (normalisedIconName) {
    case 'rain':
      return <CloudRain size={32} />

    case 'bird':
      return <Bird size={32} />

    case 'coffee':
      return <Coffee size={32} />

    case 'utensils':
      return <Utensils size={32} />

    case 'waves-horizontal':
      return <WavesHorizontal size={32} />

    case 'flame':
      return <Flame size={32} />

    case 'bell':
      return <Bell size={32} />

    case 'zodiac-aquarius':
      return <ZodiacAquarius size={32} />

    case 'sprout':
      return <Sprout size={32} />

    case 'fish-symbol':
      return <FishSymbol size={32} />

    case 'cloud-lightning':
      return <CloudLightning size={32} />

    default:
      console.warn(
        'unsupported_sound_icon',
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
      className={`sound-card ${isPlaying ? 'active' : ''}`}
      onClick={toggleSound}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isPlaying}
      aria-label={`${isPlaying ? 'Stop' : 'Play'} ${name}`}
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
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        onChange={(event) =>
          setVolume(Number(event.target.value))
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