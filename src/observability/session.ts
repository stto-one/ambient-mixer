const SESSION_STORAGE_KEY =
  'ambient-mixer-session-id'

const createSessionId = (): string => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }

  return [
    Date.now().toString(36),
    Math.random().toString(36).slice(2),
  ].join('-')
}

export const getSessionId = (): string => {
  try {
    const existingSessionId =
      sessionStorage.getItem(
        SESSION_STORAGE_KEY
      )

    if (existingSessionId) {
      return existingSessionId
    }

    const sessionId =
      createSessionId()

    sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      sessionId
    )

    return sessionId
  } catch {
    return createSessionId()
  }
}