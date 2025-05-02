"use client"

import { useEffect, useState } from "react"

export function ServiceWorkerRegistration() {
  // Track registration state for debugging purposes
  const [registrationState, setRegistrationState] = useState<'idle' | 'registering' | 'registered' | 'failed'>('idle')

  useEffect(() => {
    // Only run in the browser and if service workers are supported
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    // Register the service worker once the page has fully loaded
    const registerServiceWorker = async () => {
      try {
        setRegistrationState('registering')
        
        // Check if there's an existing registration
        const existingRegistration = await navigator.serviceWorker.getRegistration()
        
        // If there's an existing registration, update it if needed
        if (existingRegistration) {
          await existingRegistration.update()
          setRegistrationState('registered')
          console.log("ServiceWorker registration updated with scope:", existingRegistration.scope)
          return
        }
        
        // Otherwise register a new service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          // Use type: 'module' for modern service workers if needed
          // type: 'module'
        })
        
        setRegistrationState('registered')
        console.log("ServiceWorker registration successful with scope:", registration.scope)
      } catch (error) {
        setRegistrationState('failed')
        console.error("ServiceWorker registration failed:", error)
      }
    }

    // Register when the window has loaded
    if (document.readyState === 'complete') {
      registerServiceWorker()
    } else {
      window.addEventListener('load', registerServiceWorker)
      return () => window.removeEventListener('load', registerServiceWorker)
    }
  }, [])

  // This component doesn't render anything
  return null
}
