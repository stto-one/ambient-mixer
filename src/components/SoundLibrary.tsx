import {
  Check,
  X,
} from 'lucide-react'

import {
  sounds,
  type Sound,
  type SoundCategory,
} from '../data/sounds'

type SoundLibraryProps = {
  selectedSoundIds: string[]
  onToggleSound: (soundId: string) => void
  onClose: () => void
}

const CATEGORY_LABELS: Record<
  SoundCategory,
  string
> = {
  nature: 'Nature',
  places: 'Places',
  comfort: 'Comfort',
  noise: 'Noise',
}

const CATEGORY_ORDER: SoundCategory[] = [
  'nature',
  'places',
  'comfort',
  'noise',
]

function SoundLibrary({
  selectedSoundIds,
  onToggleSound,
  onClose,
}: SoundLibraryProps) {
  const groupedSounds =
    CATEGORY_ORDER.map((category) => ({
      category,
      sounds: sounds.filter(
        (sound) =>
          sound.category === category
      ),
    })).filter(
      (group) => group.sounds.length > 0
    )

  const renderSound = (
    sound: Sound
  ) => {
    const isSelected =
      selectedSoundIds.includes(sound.id)

    return (
      <button
        key={sound.id}
        type="button"
        className={`sound-library-item ${
          isSelected ? 'selected' : ''
        }`}
        onClick={() =>
          onToggleSound(sound.id)
        }
        aria-pressed={isSelected}
      >
        <span>
          {sound.name}
        </span>

        <span className="sound-library-status">
          {isSelected ? (
            <Check size={17} />
          ) : (
            <span className="sound-library-add">
              +
            </span>
          )}
        </span>
      </button>
    )
  }

  return (
    <div
      className="sound-library-backdrop"
      role="presentation"
      onPointerDown={onClose}
    >
      <section
        className="sound-library"
        aria-label="Sound library"
        onPointerDown={(event) =>
          event.stopPropagation()
        }
      >
        <header className="sound-library-header">
          <div>
            <h2>
              Sounds
            </h2>

            <p>
              Choose what appears in your mixer.
            </p>
          </div>

          <button
            type="button"
            className="sound-library-close"
            onClick={onClose}
            aria-label="Close sound library"
            title="Close"
          >
            <X size={20} />
          </button>
        </header>

        <div className="sound-library-content">
          {groupedSounds.map(
            ({ category, sounds: categorySounds }) => (
              <section
                key={category}
                className="sound-library-category"
              >
                <h3>
                  {CATEGORY_LABELS[category]}
                </h3>

                <div className="sound-library-list">
                  {categorySounds.map(
                    renderSound
                  )}
                </div>
              </section>
            )
          )}
        </div>
      </section>
    </div>
  )
}

export default SoundLibrary