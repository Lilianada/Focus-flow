"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Create a ref for the initial value to avoid dependency changes
  const initialValueRef = useRef(initialValue)
  
  // State to store our value
  // Initialize state with a function to avoid unnecessary re-renders
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }
    
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or return initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Flag to track if the component is mounted
  const isMounted = useRef(false)

  // Handle changes to the key
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    
    // This effect should only run when the key changes, not on initial mount
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      } else {
        setStoredValue(initialValueRef.current)
        window.localStorage.setItem(key, JSON.stringify(initialValueRef.current))
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}" after key change:`, error)
    }

    return () => {
      // No need to set isMounted to false here as we're using it to detect key changes
    }
  }, [key])

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  // Use useCallback to ensure the function reference is stable
  const setValue = useCallback((value: T) => {
    try {
      // Allow value to be a function so we have the same API as useState
      setStoredValue((prevValue) => {
        const valueToStore = value instanceof Function ? value(prevValue) : value
        
        // Save to local storage
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))

          // If we're offline, queue for sync when back online
          if (!navigator.onLine) {
            queueForSync(key, valueToStore)
          }
        }
        
        return valueToStore
      })
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key])

  // Queue data for sync when back online
  // Memoize this function to prevent unnecessary re-renders
  const queueForSync = useCallback((key: string, data: any) => {
    if (key === "tasks") {
      // Queue tasks for sync
      const syncQueue = JSON.parse(localStorage.getItem("taskSyncQueue") || "[]")
      syncQueue.push({ timestamp: Date.now(), data })
      localStorage.setItem("taskSyncQueue", JSON.stringify(syncQueue))

      // Register for sync when back online
      if ("serviceWorker" in navigator && "SyncManager" in window) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.sync.register("sync-tasks").catch((err) => {
            console.error("Background sync registration failed:", err)
          })
        })
      }
    } else if (key === "notes") {
      // Queue notes for sync
      const syncQueue = JSON.parse(localStorage.getItem("noteSyncQueue") || "[]")
      syncQueue.push({ timestamp: Date.now(), data })
      localStorage.setItem("noteSyncQueue", JSON.stringify(syncQueue))

      // Register for sync when back online
      if ("serviceWorker" in navigator && "SyncManager" in window) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.sync.register("sync-notes").catch((err) => {
            console.error("Background sync registration failed:", err)
          })
        })
      }
    }
  }, []) // Empty dependency array as this doesn't depend on component state

  return [storedValue, setValue]
}
