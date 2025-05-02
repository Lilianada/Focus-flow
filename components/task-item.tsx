"use client"

import { useState } from "react"
import type { Task } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import confetti from "canvas-confetti"
import { motion } from "framer-motion"

interface TaskItemProps {
  task: Task
  onEdit: () => void
  onDelete: () => void
  onComplete: (completed: boolean) => void
  onStartTimer: () => void
}

export function TaskItem({ task, onEdit, onDelete, onComplete, onStartTimer }: TaskItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleComplete = () => {
    const newCompletedState = !task.completed
    onComplete(newCompletedState)

    if (newCompletedState) {
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }

  const getEnergyIcon = () => {
    switch (task.energyLevel) {
      case "high":
        return <Icons.highEnergy className="h-4 w-4 text-green-500" />
      case "medium":
        return <Icons.mediumEnergy className="h-4 w-4 text-yellow-500" />
      case "low":
        return <Icons.lowEnergy className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "mb-3 overflow-hidden border-transparent bg-transparent transition-all hover:border-border hover:bg-accent/20 w-full",
          task.completed && "bg-muted/30",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-3 w-full">
          {/* Main task container - column on mobile, row on desktop */}
          <div className="flex flex-col sm:flex-row items-start gap-3 w-full">
            {/* Task content */}
            <div className="flex items-start gap-3 w-full">
              <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={handleComplete}
                className="mt-1.5 flex-shrink-0"
              />
              <div className="flex-1 min-w-0 w-full">
                {/* Task title and badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor={`task-${task.id}`}
                    className={cn("text-base font-medium break-words", task.completed && "line-through text-muted-foreground")}
                  >
                    {task.title}
                  </label>
                  {getEnergyIcon()}
                  {task.estimatedDuration < 5 && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary whitespace-nowrap">
                      Quick Win
                    </span>
                  )}
                </div>
                
                {/* Task duration */}
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Icons.clock className="h-3 w-3 flex-shrink-0" />
                  <span>{task.estimatedDuration} min</span>
                </div>
                
                {/* Subtasks */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-2">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        <span className="text-xs">
                          {isOpen ? "Hide" : "Show"} subtasks ({task.subtasks.length})
                        </span>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 space-y-2">
                      {task.subtasks.map((subtask, index) => (
                        <div key={index} className="flex items-start gap-2 pl-4">
                          <Checkbox
                            id={`subtask-${task.id}-${index}`}
                            checked={subtask.completed}
                            onCheckedChange={(checked) => {
                              const newSubtasks = [...task.subtasks || []]
                              newSubtasks[index].completed = !!checked
                              onComplete(newSubtasks.every((st) => st.completed))
                            }}
                          />
                          <label
                            htmlFor={`subtask-${task.id}-${index}`}
                            className={cn("text-sm", subtask.completed && "line-through text-muted-foreground")}
                          >
                            {subtask.title}
                          </label>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            </div>
            
            {/* Task actions - always visible on mobile, visible on hover for desktop */}
            <div className={cn(
              "flex flex-wrap justify-end gap-1 transition-opacity mt-2 md:mt-0 w-full md:w-auto", 
              isHovered ? "opacity-100" : "opacity-70 md:opacity-0"
            )}>
              {task.completed ? (
                <>
                  <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8" aria-label="Delete task">
                    <Icons.trash className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onComplete(false)}
                    className="h-8 w-8"
                    aria-label="Mark as not completed"
                  >
                    <Icons.undo className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onStartTimer}
                    className="h-8 w-8"
                    aria-label="Start timer"
                  >
                    <Icons.timer className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More options">
                        <Icons.ellipsis className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={onEdit}>
                        <Icons.edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                        <Icons.trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
