export type BreakPreset = {
  label: string
  minutes: number | null
}

export const BREAK_PRESETS: BreakPreset[] = [
  {
    label: 'No Break',
    minutes: null,
  },
  {
    label: 'Quick Break',
    minutes: 10/60,
  },
  {
    label: 'Break',
    minutes: 10,
  },
]