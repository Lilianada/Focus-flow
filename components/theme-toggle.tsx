"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { useEffect, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Function to toggle theme - defined before any hooks
  const toggleTheme = () => {
    if (resolvedTheme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  // Only show the toggle after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle keyboard shortcuts - always declared, even if not mounted
  useEffect(() => {
    if (!mounted) return // Early return if not mounted
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle theme with Alt+T
      if (e.altKey && e.key === 't') {
        toggleTheme()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mounted, resolvedTheme, toggleTheme])

  // Early return for non-mounted state
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-md opacity-0" aria-label="Toggle theme">
        <Icons.sun className="h-5 w-5" />
      </Button>
    )
  }

  const tooltipText = resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"
  const shortcutText = "(Alt+T)"

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-md transition-all duration-200 hover:bg-muted"
            onClick={toggleTheme}
            aria-label={tooltipText}
          >
            <div className="relative h-5 w-5 overflow-hidden">
              <div className={`absolute transition-all duration-300 ${resolvedTheme === "dark" ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
                <Icons.sun className="h-5 w-5" />
              </div>
              <div className={`absolute transition-all duration-300 ${resolvedTheme === "dark" ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"}`}>
                <Icons.moon className="h-5 w-5" />
              </div>
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{tooltipText} {shortcutText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
