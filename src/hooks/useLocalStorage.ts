import { useState, useEffect, useCallback, useRef } from 'react'

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
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Prevent hydration mismatch by returning initialValue during SSR
    if (typeof window === 'undefined') {
      return initialValue
    }
    return readValue()
  })

  // Use ref to avoid infinite loops
  const setStoredValueRef = useRef(setStoredValue)

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
        const valueToStore = value instanceof Function ? value(storedValue) : value

        // Save to local storage
        window.localStorage.setItem(key, JSON.stringify(valueToStore))

        // Save state
        setStoredValueRef.current(valueToStore)

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
      setStoredValueRef.current(initialValue)

      // We dispatch a custom event so every similar useLocalStorage hook is notified
      window.dispatchEvent(new Event('local-storage'))
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [initialValue, key])

  useEffect(() => {
    setStoredValueRef.current = setStoredValue
  })

  // Handle storage change
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | Event) => {
      if ((e as StorageEvent)?.key && (e as StorageEvent).key !== key) {
        return
      }

      const newValue = readValue()
      setStoredValue(newValue)
    }

    // this only works for other documents, not the current one
    window.addEventListener('storage', handleStorageChange)

    // this is a custom event, triggered in setValue
    window.addEventListener('local-storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('local-storage', handleStorageChange)
    }
  }, [key, readValue])

  return [storedValue, setValue, removeValue]
}
