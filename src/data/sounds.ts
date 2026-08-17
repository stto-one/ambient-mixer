import {
  publicAsset,
} from '../utils/publicAsset'

export type SoundCategory =
  | 'nature'
  | 'places'
  | 'comfort'
  | 'noise'

export type SoundSourceType =
  | 'audio'
  | 'noise'

export type Sound = {
  id: string
  name: string
  audioFile?: string
  icon: string
  category: SoundCategory
  sourceType: SoundSourceType
  defaultSelected: boolean
}

export const sounds: Sound[] = [
  {
    id: 'gentle-rain',
    name: 'Gentle Rain',
    audioFile: publicAsset('/audio/gentlerain.mp3'),
    icon: 'rain',
    category: 'nature',
    sourceType: 'audio',
    defaultSelected: true,
  },
  {
    id: 'tui',
    name: 'Tūī',
    audioFile: publicAsset('/audio/tui.mp3'),
    icon: 'bird',
    category: 'nature',
    sourceType: 'audio',
    defaultSelected: true,
  },
  {
    id: 'nz-bellbird',
    name: 'NZ Bellbird',
    audioFile: publicAsset('/audio/nzbellbird.mp3'),
    icon: 'bell',
    category: 'nature',
    sourceType: 'audio',
    defaultSelected: false,
  },
  {
    id: 'busy-street-cafe',
    name: 'Busy Street Café',
    audioFile: publicAsset('/audio/busystreetcafe.mp3'),
    icon: 'coffee',
    category: 'places',
    sourceType: 'audio',
    defaultSelected: true,
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    audioFile: publicAsset('/audio/restaurant.mp3'),
    icon: 'utensils',
    category: 'places',
    sourceType: 'audio',
    defaultSelected: true,
  },
  {
    id: 'ocean-waves',
    name: 'Ocean Waves',
    audioFile: publicAsset('/audio/oceanwaves.mp3'),
    icon: 'waves-horizontal',
    category: 'nature',
    sourceType: 'audio',
    defaultSelected: true,
  },
  {
    id: 'campfire',
    name: 'Campfire',
    audioFile: publicAsset('/audio/campfire.mp3'),
    icon: 'flame',
    category: 'comfort',
    sourceType: 'audio',
    defaultSelected: true,
  },
  {
    id: 'ambient',
    name: 'Ambient',
    audioFile: publicAsset('/audio/ambient.mp3'),
    icon: 'sprout',
    category: 'comfort',
    sourceType: 'audio',
    defaultSelected: true,
  },
  {
    id: 'underwater',
    name: 'Underwater',
    audioFile: publicAsset('/audio/underwater.mp3'),
    icon: 'fish-symbol',
    category: 'comfort',
    sourceType: 'audio',
    defaultSelected: false,
  },
  {
    id: 'thunderstorm',
    name: 'Thunderstorm',
    audioFile: publicAsset('/audio/thunderstorm.mp3'),
    icon: 'cloud-lightning',
    category: 'nature',
    sourceType: 'audio',
    defaultSelected: false,
  },
  {
  id: 'brown-noise',
  name: 'Brown Noise',
  icon: 'zodiac-aquarius',
  category: 'noise',
  sourceType: 'noise',
  defaultSelected: true,
  },
  {
  id: 'white-noise',
  name: 'White Noise',
  icon: 'zodiac-aquarius',
  category: 'noise',
  sourceType: 'noise',
  defaultSelected: false,
  },
  {
    id: 'pink-noise',
    name: 'Pink Noise',
    icon: 'zodiac-aquarius',
    category: 'noise',
    sourceType: 'noise',
    defaultSelected: false,
  },
  {
    id: 'green-noise',
    name: 'Green Noise',
    icon: 'zodiac-aquarius',
    category: 'noise',
    sourceType: 'noise',
    defaultSelected: false,
  },

]