"use client"

import { useState, useEffect, useRef } from "react"

/**
 * Hook that safely handles media queries with SSR and prevents hydration mismatches
 * Always returns false during server-side rendering and initial client render
 * Only updates after hydration is complete
 */
export function useMediaQuery(query: string): boolean {
  // Track if component is mounted to prevent hydration mismatches
  const isMounted = useRef(false)
  
  // Start with false to ensure consistent server/client initial render
  // This prevents hydration mismatches
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    // Mark as mounted after first render
    isMounted.current = true
    
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      return
    }
    
    // Create media query
    const media = window.matchMedia(query)
    
    // Update state only if we're mounted (after hydration)
    const updateMatches = () => {
      // Only update state if component is still mounted
      if (isMounted.current) {
        setMatches(media.matches)
      }
    }
    
    // Set initial state (after hydration)
    updateMatches()
    
    // Add listener
    media.addEventListener("change", updateMatches)
    
    // Clean up
    return () => {
      isMounted.current = false
      media.removeEventListener("change", updateMatches)
    }
  }, [query])
  
  return matches
}
