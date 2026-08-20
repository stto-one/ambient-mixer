import { logger } from '../observability/logger'

export const readStorage = (
  key: string
): string | null => {
  try {
    return localStorage.getItem(key)
  } catch (error) {
    logger.error(
      'storage_read_failed',
      {
        key,
        storageType: 'localStorage',
        error,
      }
    )

    return null
  }
}

export const writeStorage = (
  key: string,
  value: string
): boolean => {
  try {
    localStorage.setItem(
      key,
      value
    )

    return true
  } catch (error) {
    logger.error(
      'storage_write_failed',
      {
        key,
        storageType: 'localStorage',
        error,
      }
    )

    return false
  }
}