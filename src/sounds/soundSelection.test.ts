import {
  describe,
  expect,
  test,
} from 'vitest'

import type {
  Sound,
} from '../data/sounds'

import {
  getDefaultSoundIds,
  parseStoredSoundIds,
  toggleSoundId,
  validateSoundIds,
} from './soundSelection'

const testSounds: Sound[] = [
  {
    id: 'rain',
    name: 'Rain',
    audioFile: '/rain.mp3',
    icon: 'rain',
    category: 'nature',
    sourceType: 'audio',
    defaultSelected: true,
  },
  {
    id: 'ocean',
    name: 'Ocean',
    audioFile: '/ocean.mp3',
    icon: 'waves-horizontal',
    category: 'nature',
    sourceType: 'audio',
    defaultSelected: true,
  },
  {
    id: 'thunder',
    name: 'Thunder',
    audioFile: '/thunder.mp3',
    icon: 'cloud-lightning',
    category: 'nature',
    sourceType: 'audio',
    defaultSelected: false,
  },
]

describe('Sound selection', () => {
  test('returns the sounds selected by default', () => {
    const result =
      getDefaultSoundIds(
        testSounds
      )

    expect(result).toEqual([
      'rain',
      'ocean',
    ])
  })

  test('adds a sound that is not currently selected', () => {
    const result =
      toggleSoundId(
        [
          'rain',
          'ocean',
        ],
        'thunder'
      )

    expect(result).toEqual([
      'rain',
      'ocean',
      'thunder',
    ])
  })

  test('removes a sound that is already selected', () => {
    const result =
      toggleSoundId(
        [
          'rain',
          'ocean',
          'thunder',
        ],
        'ocean'
      )

    expect(result).toEqual([
      'rain',
      'thunder',
    ])
  })

  test('allows the user to remove their final selected sound', () => {
    const result =
      toggleSoundId(
        ['rain'],
        'rain'
      )

    expect(result).toEqual([])
  })

  test('returns only valid sound ids from stored selections', () => {
    const result =
      validateSoundIds(
        [
          'rain',
          'missing-sound',
          'thunder',
        ],
        testSounds
      )

    expect(result).toEqual([
      'rain',
      'thunder',
    ])
  })

  test('ignores stored values that are not strings', () => {
    const result =
      validateSoundIds(
        [
          'rain',
          123,
          null,
          'ocean',
        ],
        testSounds
      )

    expect(result).toEqual([
      'rain',
      'ocean',
    ])
  })

  test('uses default sounds when there is no saved selection', () => {
    const result =
      parseStoredSoundIds(
        null,
        testSounds
      )

    expect(result).toEqual([
      'rain',
      'ocean',
    ])
  })

  test('restores a valid saved sound selection', () => {
    const storedValue =
      JSON.stringify([
        'thunder',
        'rain',
      ])

    const result =
      parseStoredSoundIds(
        storedValue,
        testSounds
      )

    expect(result).toEqual([
      'thunder',
      'rain',
    ])
  })

  test('allows an intentionally empty saved selection', () => {
    const storedValue =
      JSON.stringify([])

    const result =
      parseStoredSoundIds(
        storedValue,
        testSounds
      )

    expect(result).toEqual([])
  })

  test('uses default sounds when stored data is corrupt', () => {
    const result =
      parseStoredSoundIds(
        '{broken json',
        testSounds
      )

    expect(result).toEqual([
      'rain',
      'ocean',
    ])
  })

  test('uses default sounds when stored data is not an array', () => {
    const storedValue =
      JSON.stringify({
        sound: 'rain',
      })

    const result =
      parseStoredSoundIds(
        storedValue,
        testSounds
      )

    expect(result).toEqual([
      'rain',
      'ocean',
    ])
  })

  test('removes sound ids that no longer exist in the catalogue', () => {
    const storedValue =
      JSON.stringify([
        'rain',
        'old-deleted-sound',
      ])

    const result =
      parseStoredSoundIds(
        storedValue,
        testSounds
      )

    expect(result).toEqual([
      'rain',
    ])
  })
})