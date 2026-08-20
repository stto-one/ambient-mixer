import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  readStorage,
  writeStorage,
} from './storage'

describe('storage', () => {
  const getItem = vi.fn()
  const setItem = vi.fn()

  beforeEach(() => {
    getItem.mockReset()
    setItem.mockReset()

    vi.stubGlobal(
      'localStorage',
      {
        getItem,
        setItem,
      }
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('reads a stored value', () => {
    getItem.mockReturnValue(
      'stored-value'
    )

    expect(
      readStorage('test-key')
    ).toBe('stored-value')

    expect(
      getItem
    ).toHaveBeenCalledWith(
      'test-key'
    )
  })

  it('returns null when reading storage fails', () => {
    getItem.mockImplementation(
      () => {
        throw new Error(
          'Storage unavailable'
        )
      }
    )

    expect(
      readStorage('test-key')
    ).toBeNull()
  })

  it('returns true when writing succeeds', () => {
    expect(
      writeStorage(
        'test-key',
        'test-value'
      )
    ).toBe(true)

    expect(
      setItem
    ).toHaveBeenCalledWith(
      'test-key',
      'test-value'
    )
  })

  it('returns false when writing fails', () => {
    setItem.mockImplementation(
      () => {
        throw new Error(
          'Storage unavailable'
        )
      }
    )

    expect(
      writeStorage(
        'test-key',
        'test-value'
      )
    ).toBe(false)
  })
})