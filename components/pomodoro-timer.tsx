"use client"

import { useState, useEffect, useRef, Suspense, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { Task, Subtask } from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"
import confetti from "canvas-confetti"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

// Separate the timer logic into a client component
function TimerContent() {
  const { toast } = useToast()
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", [])
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // Default: 25 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionCompleted, setSessionCompleted] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [actualTimeSpent, setActualTimeSpent] = useState(0) // Track actual elapsed time
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const initialTimeRef = useRef<number | null>(null) // Store the initial time set for the timer
  const pauseTimeRef = useRef<number[]>([]) // Store pause durations
  const pauseStartRef = useRef<number | null>(null) // Store when a pause started
  const [isLoading, setIsLoading] = useState(true)
  const [activeSubtaskIndex, setActiveSubtaskIndex] = useState<number | null>(null)
  const [subtaskTimeSpent, setSubtaskTimeSpent] = useState<Record<number, number>>({})
  const [subtaskActualTimeSpent, setSubtaskActualTimeSpent] = useState<Record<number, number>>({}) // Track actual time per subtask
  const [showDetailedStats, setShowDetailedStats] = useState(false) // Toggle for detailed stats // Track time per subtask

  useEffect(() => {
    // Get current task from localStorage
    try {
      const currentTaskId = localStorage.getItem("currentTaskId")
      if (currentTaskId) {
        const task = tasks.find((t) => t.id === currentTaskId) || null
        setCurrentTask(task)

        // Set timer to task's estimated duration
        if (task) {
          setTimeLeft(task.estimatedDuration * 60) // Convert minutes to seconds
          
          // If task has subtasks and none are marked as active yet, set the first incomplete one as active
          if (task.subtasks && task.subtasks.length > 0 && activeSubtaskIndex === null) {
            const firstIncompleteIndex = task.subtasks.findIndex(st => !st.completed)
            if (firstIncompleteIndex !== -1) {
              setActiveSubtaskIndex(firstIncompleteIndex)
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading task:", error)
    } finally {
      // Set loading to false after data is loaded
      setIsLoading(false)
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [tasks, activeSubtaskIndex])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStart = () => {
    // If resuming from pause, handle differently than starting fresh
    if (isPaused) {
      resumeFromPause()
      return
    }
    
    setIsActive(true)
    setIsPaused(false)
    
    // Store the actual start time and the initial time left when starting
    const now = Date.now()
    startTimeRef.current = now
    
    // Track the initial time set for the timer
    const initialTimeLeft = timeLeft
    initialTimeRef.current = initialTimeLeft
    
    // Reset pause tracking
    pauseTimeRef.current = []
    pauseStartRef.current = null

    // If there are subtasks but none is active, set the first incomplete one as active
    if (currentTask?.subtasks?.length && activeSubtaskIndex === null) {
      const firstIncompleteIndex = currentTask.subtasks.findIndex(st => !st.completed)
      if (firstIncompleteIndex !== -1) {
        setActiveSubtaskIndex(firstIncompleteIndex)
      }
    }

    // Start the timer interval
    startTimerInterval()
  }
  
  // Extract timer interval logic to reuse for both start and resume
  const startTimerInterval = () => {
    intervalRef.current = setInterval(() => {
      // Update countdown timer
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          handleComplete()
          return 0
        }
        return prevTime - 1
      })

      // Update time spent on active subtask (planned time)
      if (activeSubtaskIndex !== null) {
        setSubtaskTimeSpent(prev => ({
          ...prev,
          [activeSubtaskIndex]: (prev[activeSubtaskIndex] || 0) + 1
        }))
        
        // Also update actual time spent on active subtask
        setSubtaskActualTimeSpent(prev => ({
          ...prev,
          [activeSubtaskIndex]: (prev[activeSubtaskIndex] || 0) + 1
        }))
      }
    }, 1000)
  }

  const handlePause = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setIsPaused(true)
    
    // Record when the pause started
    pauseStartRef.current = Date.now()
  }
  
  // Handle resuming from a paused state
  const resumeFromPause = () => {
    setIsPaused(false)
    
    // Calculate and record the pause duration
    if (pauseStartRef.current) {
      const pauseDuration = Date.now() - pauseStartRef.current
      pauseTimeRef.current.push(pauseDuration)
      pauseStartRef.current = null
    }
    
    // Restart the timer interval
    startTimerInterval()
  }

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    // Reset to task's duration if available, otherwise default to 25 minutes
    setTimeLeft(currentTask ? currentTask.estimatedDuration * 60 : 25 * 60)
    setIsActive(false)
    setIsPaused(false)
    setSessionCompleted(false)
    
    // Reset all time tracking refs
    startTimeRef.current = null
    initialTimeRef.current = null
    pauseTimeRef.current = []
    pauseStartRef.current = null
    
    // Reset state
    setActualTimeSpent(0)
    setTimeSpent(0)
    setShowDetailedStats(false)
    
    // Reset subtask tracking
    setSubtaskTimeSpent({})
    setSubtaskActualTimeSpent({})
  }

  const handleComplete = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Calculate planned time spent based on the task's estimated duration
    const spent = initialTimeRef.current || (currentTask ? currentTask.estimatedDuration * 60 : 25 * 60)
    setTimeSpent(spent)
    
    // Calculate actual elapsed time, accounting for pauses
    if (startTimeRef.current) {
      // Calculate total pause time in milliseconds
      let totalPauseTime = pauseTimeRef.current.reduce((total, pause) => total + pause, 0)
      
      // If currently paused, add the current pause duration
      if (isPaused && pauseStartRef.current) {
        totalPauseTime += (Date.now() - pauseStartRef.current)
      }
      
      // Calculate actual elapsed time (excluding pauses)
      const actualElapsed = Math.floor((Date.now() - startTimeRef.current - totalPauseTime) / 1000)
      setActualTimeSpent(actualElapsed)
    }

    // Trigger confetti
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
    })

    // Save session data locally
    if (currentTask && typeof window !== "undefined") {
      const sessionData = {
        taskId: currentTask.id,
        duration: spent,
        date: new Date().toISOString(),
        subtaskTimeSpent: subtaskTimeSpent, // Include subtask time tracking
      }

      // Save to local storage
      const sessions = JSON.parse(localStorage.getItem("timerSessions") || "[]")
      sessions.push(sessionData)
      localStorage.setItem("timerSessions", JSON.stringify(sessions))

      // Update task with completed subtasks if any
      if (currentTask.subtasks && currentTask.subtasks.length > 0) {
        // Create an updated task with the current subtask completion status
        const updatedTask = { ...currentTask }
        
        // Check if all subtasks are completed
        const allSubtasksCompleted = updatedTask.subtasks.every((st) => st.completed)
        
        // Mark the main task as completed if all subtasks are completed
        if (allSubtasksCompleted) {
          updatedTask.completed = true
        }
        
        // Update the tasks in local storage
        const updatedTasks = tasks.map((t) => (t.id === currentTask.id ? updatedTask : t))
        setTasks(updatedTasks)
      }
    }

    setSessionCompleted(true)
    setIsActive(false)

    toast({
      title: "Pomodoro completed!",
      description: "Great job! Take a short break before starting another session.",
    })
  }


  
  // Handle subtask completion toggle
  const handleSubtaskToggle = useCallback((index: number, checked: boolean) => {
    if (!currentTask || !currentTask.subtasks) return
    
    // Create a copy of the current task
    const updatedTask = { ...currentTask }
    
    // Update the subtask's completed status
    if (updatedTask.subtasks) {
      updatedTask.subtasks = [...updatedTask.subtasks]
      updatedTask.subtasks[index].completed = checked
      
      // If all subtasks are completed, mark the task as completed
      if (updatedTask.subtasks.every(st => st.completed)) {
        updatedTask.completed = true
      } else {
        updatedTask.completed = false
      }
      
      // Update the tasks in local storage
      const updatedTasks = tasks.map(t => t.id === currentTask.id ? updatedTask : t)
      setTasks(updatedTasks)
      
      // Update current task state
      setCurrentTask(updatedTask)
      
      // If the active subtask was completed, move to the next incomplete one
      if (checked && activeSubtaskIndex === index) {
        const nextIncompleteIndex = updatedTask.subtasks.findIndex(
          (st, i) => !st.completed && i > index
        )
        
        if (nextIncompleteIndex !== -1) {
          setActiveSubtaskIndex(nextIncompleteIndex)
        }
      }
    }
  }, [currentTask, tasks, setTasks, activeSubtaskIndex])
  
  // Set active subtask
  const setActiveSubtask = useCallback((index: number) => {
    setActiveSubtaskIndex(index)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6 flex flex-col items-center">
        <Skeleton className="h-20 w-40 rounded-md" />
        <Skeleton className="h-16 w-32 rounded-md" />
        <div className="flex space-x-4">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>
    )
  }

  return (
    <>
      {sessionCompleted ? (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Session Complete!</h2>
          
          {/* Time summary with toggle for detailed stats */}
          <div>
            <p className="text-muted-foreground">
              <span className="font-medium">Planned time:</span> {Math.floor(timeSpent / 60)} minutes and {timeSpent % 60} seconds
            </p>
            {actualTimeSpent > 0 && (
              <p className="text-muted-foreground">
                <span className="font-medium">Actual time:</span> {Math.floor(actualTimeSpent / 60)} minutes and {actualTimeSpent % 60} seconds
              </p>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 text-xs" 
              onClick={() => setShowDetailedStats(!showDetailedStats)}
            >
              {showDetailedStats ? "Hide detailed stats" : "Show detailed stats"}
            </Button>
          </div>
          
          {currentTask && (
            <div className="p-4 bg-accent/20 rounded-md">
              <h3 className="font-medium">{currentTask.title}</h3>
              
              {/* Show subtask completion summary if there are subtasks */}
              {currentTask.subtasks && currentTask.subtasks.length > 0 && (
                <div className="mt-3 space-y-2">
                  <h4 className="text-sm font-medium">Subtasks Progress:</h4>
                  <div className="space-y-2">
                    {currentTask.subtasks.map((subtask, index) => {
                      const plannedTime = subtaskTimeSpent[index] || 0
                      const actualTime = subtaskActualTimeSpent[index] || 0
                      const plannedMinutes = Math.floor(plannedTime / 60)
                      const plannedSeconds = plannedTime % 60
                      const actualMinutes = Math.floor(actualTime / 60)
                      const actualSeconds = actualTime % 60
                      
                      return (
                        <div key={index} className="flex flex-col gap-1 border-b border-border/20 pb-2 last:border-0">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                id={`summary-subtask-${index}`}
                                checked={subtask.completed}
                                onCheckedChange={(checked) => handleSubtaskToggle(index, !!checked)}
                              />
                              <label 
                                htmlFor={`summary-subtask-${index}`}
                                className={cn(subtask.completed ? "line-through text-muted-foreground" : "")}
                              >
                                {subtask.title}
                              </label>
                            </div>
                            {plannedTime > 0 && (
                              <span className="text-xs bg-primary/10 px-2 py-0.5 rounded-full">
                                {plannedMinutes > 0 ? `${plannedMinutes}m ` : ""}{plannedSeconds}s
                              </span>
                            )}
                          </div>
                          
                          {/* Show detailed stats if enabled */}
                          {showDetailedStats && plannedTime > 0 && (
                            <div className="text-xs text-muted-foreground pl-6 grid grid-cols-2 gap-2">
                              <span>Planned: {plannedMinutes > 0 ? `${plannedMinutes}m ` : ""}{plannedSeconds}s</span>
                              <span>Actual: {actualMinutes > 0 ? `${actualMinutes}m ` : ""}{actualSeconds}s</span>
                              <span>Efficiency: {Math.round((plannedTime / actualTime) * 100)}%</span>
                              <span>Difference: {Math.abs(actualTime - plannedTime)}s</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={handleReset}>
              New Session
            </Button>
          </div>
        </div>
      ) : (
        <>
          {currentTask && isActive && !isPaused && (
            <div className="w-full p-4 bg-accent/10 rounded-md mb-4">
              <h3 className="font-medium">{currentTask.title}</h3>
              
              {/* Show active subtask if available */}
              {currentTask.subtasks && currentTask.subtasks.length > 0 && activeSubtaskIndex !== null && (
                <div className="mt-2 pt-2 border-t border-border/30">
                  <p className="text-xs mb-1">Current subtask:</p>
                  <p className="text-sm font-medium">
                    {currentTask.subtasks[activeSubtaskIndex].title}
                  </p>
                </div>
              )}
            </div>
          )}

          {currentTask && !isActive && (
            <div className="w-full p-4 bg-accent/20 rounded-md mb-4">
              <h3 className="font-medium">{currentTask.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {currentTask.estimatedDuration} minute{currentTask.estimatedDuration !== 1 ? "s" : ""}
              </p>
              
              {/* Show subtasks if available */}
              {currentTask.subtasks && currentTask.subtasks.length > 0 && (
                <div className="mt-3 space-y-2">
                  <h4 className="text-sm font-medium">Subtasks:</h4>
                  <div className="space-y-2">
                    {currentTask.subtasks.map((subtask, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Checkbox 
                          id={`setup-subtask-${index}`}
                          checked={subtask.completed}
                          onCheckedChange={(checked) => handleSubtaskToggle(index, !!checked)}
                        />
                        <label 
                          htmlFor={`setup-subtask-${index}`}
                          className={cn("text-sm", subtask.completed ? "line-through text-muted-foreground" : "")}
                        >
                          {subtask.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="font-mono text-7xl font-bold tabular-nums">{formatTime(timeLeft)}</div>
          
          {/* Show active subtask controls when timer is active */}
          {isActive && currentTask?.subtasks && currentTask.subtasks.length > 0 && (
            <div className="my-4 p-3 border border-border/50 rounded-md">
              <h4 className="text-sm font-medium mb-2">Working on:</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {currentTask.subtasks.map((subtask, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md transition-colors", 
                      activeSubtaskIndex === index ? "bg-primary/10" : "",
                      subtask.completed ? "opacity-50" : ""
                    )}
                    onClick={() => !subtask.completed && setActiveSubtask(index)}
                  >
                    <Checkbox 
                      id={`active-subtask-${index}`}
                      checked={subtask.completed}
                      onCheckedChange={(checked) => handleSubtaskToggle(index, !!checked)}
                    />
                    <label 
                      htmlFor={`active-subtask-${index}`}
                      className={cn(
                        "text-sm flex-1 cursor-pointer", 
                        subtask.completed ? "line-through text-muted-foreground" : "",
                        activeSubtaskIndex === index ? "font-medium" : ""
                      )}
                    >
                      {subtask.title}
                    </label>
                    {activeSubtaskIndex === index && (
                      <span className="text-xs bg-primary/20 px-1.5 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            {!isActive ? (
              <Button onClick={handleStart} size="lg">
                Start
              </Button>
            ) : isPaused ? (
              <Button onClick={handleStart} size="lg">
                Resume
              </Button>
            ) : (
              <Button onClick={handlePause} size="lg">
                Pause
              </Button>
            )}
            <Button variant="outline" onClick={handleReset} size="lg">
              Reset
            </Button>
          </div>
        </>
      )}
    </>
  )
}

// Main component with loading state
export function PomodoroTimer() {
  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-transparent bg-transparent shadow-none">
          <div className="flex flex-col items-center p-6 space-y-6">
            <Suspense
              fallback={
                <div className="space-y-6 flex flex-col items-center">
                  <Skeleton className="h-20 w-40 rounded-md" />
                  <Skeleton className="h-16 w-32 rounded-md" />
                  <div className="flex space-x-4">
                    <Skeleton className="h-10 w-24 rounded-md" />
                    <Skeleton className="h-10 w-24 rounded-md" />
                  </div>
                </div>
              }
            >
              <TimerContent />
            </Suspense>
          </div>
        </Card>
      </div>
    </div>
  )
}
