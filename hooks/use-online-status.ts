"use client"

import { useState, useEffect, useCallback } from "react"

export function useOnlineStatus() {
  // Initialize with null to prevent hydration mismatch
  const [isOnline, setIsOnline] = useState<boolean | null>(null)

  // Update online status - memoize to prevent unnecessary re-renders
  const updateOnlineStatus = useCallback(() => {
    setIsOnline(navigator.onLine)
  }, [])

  useEffect(() => {
    // Set initial state once mounted on client
    updateOnlineStatus()

    // Add event listeners
    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    // Clean up event listeners
    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [updateOnlineStatus])

  // Default to true if we're still in the initial null state (e.g., during SSR)
  return isOnline === null ? true : isOnline
}
