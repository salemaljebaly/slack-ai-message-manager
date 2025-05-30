import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get from local storage then parse stored json or return initialValue
  const readValue = useCallback((): T => {
    // Prevent build error "window is undefined" but keep functionality
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }, [initialValue, key])

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(readValue)

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      // Prevent build error "window is undefined" but keeps functionality
      if (typeof window === 'undefined') {
        console.warn(
          `Tried setting localStorage key "${key}" even though environment is not a client`
        )
        return
      }

      try {
        // Allow value to be a function so we have the same API as useState
        const newValue = value instanceof Function ? value(storedValue) : value

        // Save to local storage
        window.localStorage.setItem(key, JSON.stringify(newValue))

        // Save state
        setStoredValue(newValue)

        // We dispatch a custom event so every similar useLocalStorage hook is notified
        window.dispatchEvent(new Event('local-storage'))
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  const removeValue = useCallback(() => {
    // Prevent build error "window is undefined" but keeps functionality
    if (typeof window === 'undefined') {
      console.warn(
        `Tried removing localStorage key "${key}" even though environment is not a client`
      )
      return
    }

    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)

      // We dispatch a custom event so every similar useLocalStorage hook is notified
      window.dispatchEvent(new Event('local-storage'))
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [initialValue, key])

  useEffect(() => {
    const handleStorageChange = () => {
      const newValue = readValue()
      if (JSON.stringify(storedValue) !== JSON.stringify(newValue)) {
        setStoredValue(newValue)
      }
    }

    // Initial value
    handleStorageChange()

    // This only works for other documents, not the current one
    window.addEventListener('storage', handleStorageChange)

    // This is a custom event, triggered in writeValueToLocalStorage
    // This way, all hooks in the same document are notified
    window.addEventListener('local-storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('local-storage', handleStorageChange)
    }
  }, [readValue, storedValue])

  return [storedValue, setValue, removeValue]
}
