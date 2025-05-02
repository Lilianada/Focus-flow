'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Add this to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Add listener for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      document.documentElement.classList.toggle('dark', mediaQuery.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [mounted])

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
