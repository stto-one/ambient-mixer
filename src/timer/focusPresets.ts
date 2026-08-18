export type FocusPreset = {
  label: string
  minutes: number
}

export const FOCUS_PRESETS: FocusPreset[] = [
  {
    label: 'Quick Focus',
    minutes: 25,
  },
  {
    label: 'Focus',
    minutes: 45,
  },
  {
    label: 'Deep Focus',
    minutes: 60,
  },
  {
    label: 'Extended Focus',
    minutes: 90,
  },
]