import {
  sounds,
  type Sound,
} from '../data/sounds'

export const SOUND_SELECTION_STORAGE_KEY =
  'ambient-mixer-selected-sounds'

export const getDefaultSoundIds = (
  soundCatalogue: Sound[] = sounds
): string[] => {
  return soundCatalogue
    .filter(
      (sound) => sound.defaultSelected
    )
    .map(
      (sound) => sound.id
    )
}

export const validateSoundIds = (
  soundIds: unknown,
  soundCatalogue: Sound[] = sounds
): string[] => {
  if (!Array.isArray(soundIds)) {
    return getDefaultSoundIds(
      soundCatalogue
    )
  }

  return soundIds.filter(
    (id): id is string =>
      typeof id === 'string' &&
      soundCatalogue.some(
        (sound) =>
          sound.id === id
      )
  )
}

export const parseStoredSoundIds = (
  storedValue: string | null,
  soundCatalogue: Sound[] = sounds
): string[] => {
  if (storedValue === null) {
    return getDefaultSoundIds(
      soundCatalogue
    )
  }

  try {
    const parsedValue =
      JSON.parse(storedValue)

    return validateSoundIds(
      parsedValue,
      soundCatalogue
    )
  } catch {
    return getDefaultSoundIds(
      soundCatalogue
    )
  }
}

export const toggleSoundId = (
  selectedSoundIds: string[],
  soundId: string
): string[] => {
  if (
    selectedSoundIds.includes(
      soundId
    )
  ) {
    return selectedSoundIds.filter(
      (id) => id !== soundId
    )
  }

  return [
    ...selectedSoundIds,
    soundId,
  ]
}