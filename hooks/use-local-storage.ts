"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Create a ref for the initial value to avoid dependency changes
  const initialValueRef = useRef(initialValue)
  
  // Use a ref to track hydration status
  const hydrated = useRef(false)
  
  // State to store our value - ALWAYS initialize with initialValue during SSR
  // This prevents hydration mismatches between server and client
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  
  // Effect to load the value from localStorage AFTER hydration
  // This ensures server and client render the same initial content
  useEffect(() => {
    // Skip this effect during SSR
    if (typeof window === "undefined") return
    
    // Only run this once after hydration
    if (hydrated.current) return
    hydrated.current = true
    
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or keep initialValue
      if (item) {
        const parsedValue = JSON.parse(item)
        setStoredValue(parsedValue)
      } else {
        // If no value in localStorage, set it with the initial value
        window.localStorage.setItem(key, JSON.stringify(initialValue))
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      // On error, ensure localStorage has the initial value
      try {
        window.localStorage.setItem(key, JSON.stringify(initialValue))
      } catch (e) {
        // Ignore secondary errors
      }
    }
  }, [])
  
  // Handle changes to the key
  useEffect(() => {
    // Skip during SSR
    if (typeof window === "undefined") return
    // Skip if not hydrated yet
    if (!hydrated.current) return
    
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
  }, [key])

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  // Use useCallback to ensure the function reference is stable
  const setValue = useCallback((value: T) => {
    // Skip if not hydrated or during SSR
    if (typeof window === "undefined" || !hydrated.current) {
      console.warn("Attempted to set localStorage value before hydration")
      setStoredValue(value instanceof Function ? value(storedValue) : value)
      return
    }
    
    try {
      // Allow value to be a function so we have the same API as useState
      setStoredValue((prevValue) => {
        const valueToStore = value instanceof Function ? value(prevValue) : value
        
        // Save to local storage with error handling
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))

          // If we're offline, queue for sync when back online
          if (!navigator.onLine) {
            queueForSync(key, valueToStore)
          }
        } catch (storageError) {
          console.warn(`Error saving to localStorage: ${storageError}`)
        }
        
        return valueToStore
      })
    } catch (error) {
      console.warn(`Error in setValue for key "${key}":`, error)
    }
  }, [key, storedValue])

  // Queue data for sync when back online
  // Memoize this function to prevent unnecessary re-renders
  const queueForSync = useCallback((key: string, data: any) => {
    // Skip during SSR
    if (typeof window === "undefined") return
    
    try {
      if (key === "tasks") {
        // Queue tasks for sync
        const syncQueue = JSON.parse(localStorage.getItem("taskSyncQueue") || "[]")
        syncQueue.push({ timestamp: Date.now(), data })
        localStorage.setItem("taskSyncQueue", JSON.stringify(syncQueue))

        // Register for sync when back online - with error handling
        if ("serviceWorker" in navigator && "SyncManager" in window) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.sync.register("sync-tasks").catch((err) => {
              console.error("Background sync registration failed:", err)
            })
          }).catch(err => {
            console.warn("Service worker not ready for sync:", err)
          })
        }
      } else if (key === "notes") {
        // Queue notes for sync
        const syncQueue = JSON.parse(localStorage.getItem("noteSyncQueue") || "[]")
        syncQueue.push({ timestamp: Date.now(), data })
        localStorage.setItem("noteSyncQueue", JSON.stringify(syncQueue))

        // Register for sync when back online - with error handling
        if ("serviceWorker" in navigator && "SyncManager" in window) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.sync.register("sync-notes").catch((err) => {
              console.error("Background sync registration failed:", err)
            })
          }).catch(err => {
            console.warn("Service worker not ready for sync:", err)
          })
        }
      }
    } catch (error) {
      console.warn("Error in queueForSync:", error)
    }
  }, []) // Empty dependency array as this doesn't depend on component state

  return [storedValue, setValue]
}
