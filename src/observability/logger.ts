import {
  getSessionId,
} from './session'

export type LogLevel =
  | 'info'
  | 'warn'
  | 'error'

export type LogContext = Record<
  string,
  unknown
>

export type LogEvent = {
  event: string
  level: LogLevel
  timestamp: string
  appVersion: string
  sessionId: string
  context?: LogContext
}

const createLogEvent = (
  level: LogLevel,
  event: string,
  context?: LogContext
): LogEvent => {
  return {
    event,
    level,
    timestamp:
      new Date().toISOString(),
    appVersion: __APP_VERSION__,
    sessionId: getSessionId(),
    ...(context && {
      context,
    }),
  }
}

export const logger = {
  info: (
    event: string,
    context?: LogContext
  ) => {
    console.info(
      createLogEvent(
        'info',
        event,
        context
      )
    )
  },

  warn: (
    event: string,
    context?: LogContext
  ) => {
    console.warn(
      createLogEvent(
        'warn',
        event,
        context
      )
    )
  },

  error: (
    event: string,
    context?: LogContext
  ) => {
    console.error(
      createLogEvent(
        'error',
        event,
        context
      )
    )
  },
}