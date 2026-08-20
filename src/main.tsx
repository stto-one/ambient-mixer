import {
  StrictMode,
} from 'react'

import {
  createRoot,
} from 'react-dom/client'

import './index.css'

import App from './App.tsx'

import {
  clearTelemetryEvents,
  exportTelemetryJson,
  getTelemetryEvents,
} from './telemetry/telemetry'

import {
  getTelemetryReport,
  getTelemetrySummary,
} from './telemetry/telemetryReport'

type AmbientMixerTelemetryTools = {
  report: () => string

  summary: () => ReturnType<
    typeof getTelemetrySummary
  >

  events: () => ReturnType<
    typeof getTelemetryEvents
  >

  exportJson: () => string

  clear: () => void
}

declare global {
  interface Window {
    ambientMixerTelemetry?:
      AmbientMixerTelemetryTools
  }
}

if (import.meta.env.DEV) {
  window.ambientMixerTelemetry = {
    report: () => {
      const report =
        getTelemetryReport()

      console.info(
        report
      )

      return report
    },

    summary: () => {
      const summary =
        getTelemetrySummary()

      console.info(
        summary
      )

      return summary
    },

    events: () => {
      const events =
        getTelemetryEvents()

      console.info(
        events
      )

      return events
    },

    exportJson: () => {
      const json =
        exportTelemetryJson()

      console.info(
        json
      )

      return json
    },

    clear: () => {
      clearTelemetryEvents()

      console.info(
        'Ambient Mixer telemetry cleared'
      )
    },
  }
}

createRoot(
  document.getElementById(
    'root'
  )!
).render(
  <StrictMode>
    <App />
  </StrictMode>
)