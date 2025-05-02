"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useCallback } from "react"

interface QuickWinToggleProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function QuickWinToggle({ checked, onCheckedChange }: QuickWinToggleProps) {
  // Use a memoized callback to prevent infinite re-renders
  const handleCheckedChange = useCallback((value: boolean) => {
    onCheckedChange(value)
  }, [onCheckedChange])

  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id="quick-wins" 
        checked={checked} 
        onCheckedChange={handleCheckedChange} 
      />
      <Label htmlFor="quick-wins" className="text-sm font-medium">
        Quick Wins (&lt;5 min)
      </Label>
    </div>
  )
}
