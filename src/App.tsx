import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import './App.css'

import SoundCard from './components/SoundCard'
import Timer from './components/Timer'
import FocusView from './components/FocusView'
import SoundLibrary from './components/SoundLibrary'
import NoiseSoundCard from './components/NoiseSoundCard'

import {
  sounds,
} from './data/sounds'

import {
  createFocusCycle,
  type FocusCycleState,
} from './focus/focusCycle'

import {
  SOUND_SELECTION_STORAGE_KEY,
  parseStoredSoundIds,
  toggleSoundId,
} from './sounds/soundSelection'

import {
  EyeClosed,
  Maximize,
  Minimize,
  Plus,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react'

import type {
  NoiseType,
} from './audio/noiseGenerator'

import {
  publicAsset,
} from './utils/publicAsset'

import {
  logger,
} from './observability/logger'

import {
  readStorage,
  writeStorage,
} from './storage/storage'

import {
  registerGlobalErrorHandlers,
} from './observability/globalErrors'

import {
  telemetry,
} from './telemetry/telemetry'

const DEFAULT_FOCUS_MINUTES = 25
const DEFAULT_BREAK_MINUTES: number | null = null

const getBackgroundImage = () => {
  const hour = new Date().getHours()

  if (hour >= 6 && hour < 10) {
    return publicAsset(
      '/images/Riverbed.jpg'
    )
  }

  if (hour >= 10 && hour < 13) {
    return publicAsset(
      '/images/Ocean.jpg'
    )
  }

  if (hour >= 13 && hour < 17) {
    return publicAsset(
      '/images/Conservatory.jpg'
    )
  }

  return publicAsset(
    '/images/ResortNight.jpg'
  )
}

function App() {
  const [stopSignal, setStopSignal] =
    useState(0)

  const [
    masterVolume,
    setMasterVolume,
  ] = useState(100)

  const [isMuted, setIsMuted] =
    useState(false)

  const [
    isFullscreen,
    setIsFullscreen,
  ] = useState(false)

  const [
    isFocusView,
    setIsFocusView,
  ] = useState(false)

  const [
    isSoundLibraryOpen,
    setIsSoundLibraryOpen,
  ] = useState(false)

  const [
    selectedSoundIds,
    setSelectedSoundIds,
  ] = useState<string[]>(() =>
    parseStoredSoundIds(
      readStorage(
        SOUND_SELECTION_STORAGE_KEY
      )
    )
  )

  const initialSoundIdsRef =
    useRef(selectedSoundIds)

  const [cycle, setCycle] =
    useState<FocusCycleState>(() =>
      createFocusCycle(
        DEFAULT_FOCUS_MINUTES,
        DEFAULT_BREAK_MINUTES
      )
    )

  const [
    backgroundImage,
    setBackgroundImage,
  ] = useState(getBackgroundImage)

  useEffect(() => {
    logger.info('app_started')
  }, [])

  useEffect(() => {
    return registerGlobalErrorHandlers()
  }, [])

  useEffect(() => {
    telemetry.track(
      'app_opened',
      {
        initialSoundIds:
          initialSoundIdsRef.current,
      }
    )
  }, [])

  const selectedSounds = useMemo(
    () =>
      sounds.filter(
        (sound) =>
          selectedSoundIds.includes(
            sound.id
          )
      ),
    [selectedSoundIds]
  )

  useEffect(() => {
    writeStorage(
      SOUND_SELECTION_STORAGE_KEY,
      JSON.stringify(
        selectedSoundIds
      )
    )
  }, [selectedSoundIds])

  useEffect(() => {
    const updateBackgroundImage = () => {
      setBackgroundImage(
        getBackgroundImage()
      )
    }

    const interval =
      window.setInterval(
        updateBackgroundImage,
        60 * 1000
      )

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        Boolean(
          document.fullscreenElement
        )
      )
    }

    document.addEventListener(
      'fullscreenchange',
      handleFullscreenChange
    )

    return () => {
      document.removeEventListener(
        'fullscreenchange',
        handleFullscreenChange
      )
    }
  }, [])

  const stopAllSounds = () => {
    setStopSignal(
      (current) => current + 1
    )
  }

  const toggleMute = () => {
    setIsMuted(
      (current) => !current
    )
  }

  const enterFocusView = () => {
    setIsFocusView(true)
  }

  const exitFocusView = () => {
    setIsFocusView(false)
  }

  const openSoundLibrary = () => {
    setIsSoundLibraryOpen(true)
  }

  const closeSoundLibrary = () => {
    setIsSoundLibraryOpen(false)
  }

  const toggleSoundSelection = (
    soundId: string
  ) => {
    const isCurrentlySelected =
      selectedSoundIds.includes(
        soundId
      )

    const nextSoundIds =
      toggleSoundId(
        selectedSoundIds,
        soundId
      )

    setSelectedSoundIds(
      nextSoundIds
    )

    telemetry.track(
      'soundscape_changed',
      {
        changeType:
          isCurrentlySelected
            ? 'sound_removed'
            : 'sound_added',

        soundId,

        selectedSoundIds:
          nextSoundIds,
      }
    )
  }

  const toggleFullscreen = async () => {
    try {
      if (
        document.fullscreenElement
      ) {
        await document.exitFullscreen()
        return
      }

      await document
        .documentElement
        .requestFullscreen()
    } catch (error) {
      logger.error(
        'fullscreen_toggle_failed',
        {
          error,
        }
      )
    }
  }

  const effectiveMasterVolume =
    isMuted
      ? 0
      : masterVolume

  return (
    <main
      className={`app-layout ${
        isFocusView
          ? 'focus-view-active'
          : ''
      }`}
      style={{
        backgroundImage: `
          linear-gradient(
            rgba(20, 40, 35, 0.12),
            rgba(20, 40, 35, 0.25)
          ),
          url(${backgroundImage})
        `,
      }}
    >
      <section className="visual-panel">
        <div className="visual-overlay">
          <h1>
            Ambient Mixer
          </h1>

          <p>
            Create a space to settle,
            focus and unwind.
          </p>

          <div className="global-controls">
            <input
              className="global-volume-slider"
              type="range"
              min="0"
              max="100"
              value={masterVolume}
              aria-label="Master volume"
              onChange={(event) =>
                setMasterVolume(
                  Number(
                    event.target.value
                  )
                )
              }
            />

            <button
              type="button"
              className="control-icon-button"
              onClick={toggleMute}
              aria-label={
                isMuted
                  ? 'Unmute'
                  : 'Mute'
              }
              title={
                isMuted
                  ? 'Unmute'
                  : 'Mute'
              }
            >
              {isMuted ? (
                <VolumeX size={22} />
              ) : (
                <Volume2 size={22} />
              )}
            </button>

            <button
              type="button"
              className="control-icon-button"
              onClick={stopAllSounds}
              aria-label="Clear all sounds"
              title="Clear all"
            >
              <Square
                size={17}
                fill="currentColor"
              />
            </button>

            <Timer
              cycle={cycle}
              setCycle={setCycle}
              selectedSoundIds={
                selectedSoundIds
              }
            />

            <button
              type="button"
              className="control-icon-button"
              onClick={enterFocusView}
              aria-label="Enter focus view"
              title="Focus view"
            >
              <EyeClosed size={22} />
            </button>

            <button
              type="button"
              className="control-icon-button"
              onClick={toggleFullscreen}
              aria-label={
                isFullscreen
                  ? 'Exit fullscreen'
                  : 'Enter fullscreen'
              }
              title={
                isFullscreen
                  ? 'Exit fullscreen'
                  : 'Fullscreen'
              }
            >
              {isFullscreen ? (
                <Minimize size={22} />
              ) : (
                <Maximize size={22} />
              )}
            </button>
          </div>
        </div>
      </section>

      <section className="mixer-panel">
        <div className="mixer-content">
          <div className="sound-grid">
            {selectedSounds.map(
              (sound) => {
                if (
                  sound.sourceType ===
                  'noise'
                ) {
                  const noiseTypeMap: Record<
                    string,
                    NoiseType
                  > = {
                    'brown-noise':
                      'brown',

                    'white-noise':
                      'white',

                    'pink-noise':
                      'pink',

                    'green-noise':
                      'green',
                  }

                  const noiseType =
                    noiseTypeMap[
                      sound.id
                    ]

                  if (!noiseType) {
                    logger.warn(
                      'unsupported_noise_sound',
                      {
                        soundId:
                          sound.id,

                        soundName:
                          sound.name,
                      }
                    )

                    return null
                  }

                  return (
                    <NoiseSoundCard
                      key={sound.id}
                      soundId={sound.id}
                      name={sound.name}
                      icon={sound.icon}
                      noiseType={
                        noiseType
                      }
                      stopSignal={
                        stopSignal
                      }
                      masterVolume={
                        effectiveMasterVolume
                      }
                    />
                  )
                }

                return (
                  <SoundCard
                    key={sound.id}
                    soundId={sound.id}
                    name={sound.name}
                    audioFile={
                      sound.audioFile ??
                      ''
                    }
                    icon={sound.icon}
                    stopSignal={
                      stopSignal
                    }
                    masterVolume={
                      effectiveMasterVolume
                    }
                  />
                )
              }
            )}

            <button
              type="button"
              className="add-sound-card"
              onClick={
                openSoundLibrary
              }
              aria-label="Add sounds"
              title="Add sounds"
            >
              <div className="add-sound-icon">
                <Plus size={28} />
              </div>
            </button>
          </div>
        </div>
      </section>

      {isFocusView && (
        <FocusView
          cycle={cycle}
          onExit={exitFocusView}
        />
      )}

      {isSoundLibraryOpen && (
        <SoundLibrary
          selectedSoundIds={
            selectedSoundIds
          }
          onToggleSound={
            toggleSoundSelection
          }
          onClose={
            closeSoundLibrary
          }
        />
      )}
    </main>
  )
}

export default App