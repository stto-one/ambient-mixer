import { logger } from './logger'

export const registerGlobalErrorHandlers = () => {
  const handleError = (
    event: ErrorEvent
  ) => {
    logger.error(
      'unexpected_runtime_error',
      {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error,
      }
    )
  }

  const handleUnhandledRejection = (
    event: PromiseRejectionEvent
  ) => {
    logger.error(
      'unhandled_promise_rejection',
      {
        reason: event.reason,
      }
    )
  }

  window.addEventListener(
    'error',
    handleError
  )

  window.addEventListener(
    'unhandledrejection',
    handleUnhandledRejection
  )

  return () => {
    window.removeEventListener(
      'error',
      handleError
    )

    window.removeEventListener(
      'unhandledrejection',
      handleUnhandledRejection
    )
  }
}