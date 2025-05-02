"use client"

import type { EnergyLevel } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"

interface EnergyFilterProps {
  currentFilter: EnergyLevel | null
  onFilterChange: (filter: EnergyLevel | null) => void
}

export function EnergyFilter({ currentFilter, onFilterChange }: EnergyFilterProps) {
  const handleFilterClick = (level: EnergyLevel) => {
    if (currentFilter === level) {
      onFilterChange(null)
    } else {
      onFilterChange(level)
    }
  }
  
  // Function to clear the filter and show all tasks
  const handleAllClick = () => {
    onFilterChange(null)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "flex items-center gap-1", 
          currentFilter === null && "bg-primary/10 border-primary"
        )}
        onClick={handleAllClick}
      >
        <Icons.list className="h-4 w-4" />
        All
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={cn("flex items-center gap-1", currentFilter === "high" && "bg-primary/10")}
        onClick={() => handleFilterClick("high")}
      >
        <Icons.highEnergy className="h-4 w-4 text-green-500" />
        High Energy
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={cn("flex items-center gap-1", currentFilter === "medium" && "bg-primary/10")}
        onClick={() => handleFilterClick("medium")}
      >
        <Icons.mediumEnergy className="h-4 w-4 text-yellow-500" />
        Medium Energy
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={cn("flex items-center gap-1", currentFilter === "low" && "bg-primary/10")}
        onClick={() => handleFilterClick("low")}
      >
        <Icons.lowEnergy className="h-4 w-4 text-red-500" />
        Low Energy
      </Button>
    </div>
  )
}
