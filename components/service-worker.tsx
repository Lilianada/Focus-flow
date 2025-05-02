"use client"

import { useEffect, useState, useRef } from "react"

export function ServiceWorkerRegistration() {
  // Use a ref to track hydration status
  const hydrated = useRef(false)
  
  // Track registration state for debugging purposes - but don't render based on it
  // This prevents hydration mismatches
  const registrationState = useRef<'idle' | 'registering' | 'registered' | 'failed'>('idle')

  useEffect(() => {
    // Skip this effect during SSR
    if (typeof window === 'undefined') return
    
    // Only run once after hydration
    if (hydrated.current) return
    hydrated.current = true
    
    // Delay service worker registration to avoid competing with initial rendering
    const timer = setTimeout(() => {
      // Only run if service workers are supported
      if (!('serviceWorker' in navigator)) {
        console.log('Service workers not supported in this browser')
        return
      }
      
      // Register the service worker once the page has fully loaded
      const registerServiceWorker = async () => {
        try {
          registrationState.current = 'registering'
          
          // Check if there's an existing registration
          const existingRegistration = await navigator.serviceWorker.getRegistration()
          
          // If there's an existing registration, update it if needed
          if (existingRegistration) {
            await existingRegistration.update()
            registrationState.current = 'registered'
            console.log("ServiceWorker registration updated with scope:", existingRegistration.scope)
            return
          }
          
          // Otherwise register a new service worker
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          })
          
          registrationState.current = 'registered'
          console.log("ServiceWorker registration successful with scope:", registration.scope)
        } catch (error) {
          registrationState.current = 'failed'
          console.error("ServiceWorker registration failed:", error)
        }
      }

      // Register when the window has loaded
      if (document.readyState === 'complete') {
        registerServiceWorker()
      } else {
        window.addEventListener('load', registerServiceWorker)
      }
    }, 1000) // Delay registration by 1 second to prioritize UI rendering
    
    return () => clearTimeout(timer)
  }, [])

  // This component doesn't render anything
  return null
}
