"use client"

import { useOnlineStatus } from "@/hooks/use-online-status"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Icons } from "@/components/icons"
import { useState, useEffect } from "react"

export function OfflineBanner() {
  const isOnline = useOnlineStatus()
  const [showBanner, setShowBanner] = useState(false)

  // Only show the banner after we've detected an offline state
  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true)
    }

    // Hide the banner after 5 seconds when coming back online
    if (isOnline && showBanner) {
      const timer = setTimeout(() => {
        setShowBanner(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isOnline, showBanner])

  if (isOnline && !showBanner) {
    return null
  }

  return (
    <Alert className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-md z-50 flex items-center">
      <Icons.wifi className={`h-4 w-4 mr-2 ${isOnline ? "text-green-500" : "text-red-500"}`} />
      <AlertDescription>
        {isOnline
          ? "You're back online! Your changes will sync automatically."
          : "You're offline. Changes will be saved locally and synced when you're back online."}
      </AlertDescription>
    </Alert>
  )
}
