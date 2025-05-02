"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { TaskList } from "@/components/task-list"
import { TaskForm } from "@/components/task-form"
import { EnergyFilter } from "@/components/energy-filter"
import { QuickWinToggle } from "@/components/quick-win-toggle"
import { Icons } from "@/components/icons"
import { Skeleton } from "@/components/ui/skeleton"
import type { Task, EnergyLevel } from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Input } from "@/components/ui/input"
import { AnimatePresence } from "framer-motion"

// Separate the dashboard content into a client component
function DashboardContent() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", [])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [energyFilter, setEnergyFilter] = useState<EnergyLevel | null>(null)
  // Use useCallback to memoize the state setter function
  const [showQuickWins, setShowQuickWinsState] = useState(false)
  
  // Memoize the state setter to prevent infinite loops
  const setShowQuickWins = useCallback((value: boolean) => {
    setShowQuickWinsState(value)
  }, [])
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Set loading to false after component mounts
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Filter tasks when dependencies change
  useEffect(() => {
    // Start with all tasks
    let filtered = [...tasks]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.subtasks?.some((subtask) => subtask.title.toLowerCase().includes(query)),
      )
    }

    // Filter by energy level - only if energyFilter is not null
    if (energyFilter !== null) {
      filtered = filtered.filter((task) => task.energyLevel === energyFilter)
    }

    // Filter by quick wins
    if (showQuickWins) {
      filtered = filtered.filter((task) => task.estimatedDuration < 5)
    }

    setFilteredTasks(filtered)
  }, [tasks, energyFilter, showQuickWins, searchQuery])

  const handleAddTask = (task: Task) => {
    const newTasks = [...tasks, task]
    setTasks(newTasks)
    setIsAddingTask(false)
  }

  const handleUpdateTask = (updatedTask: Task) => {
    const newTasks = tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    setTasks(newTasks)
  }

  const handleDeleteTask = (taskId: string) => {
    const newTasks = tasks.filter((task) => task.id !== taskId)
    setTasks(newTasks)
  }

  const handleStartTimer = (taskId: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("currentTaskId", taskId)
      window.location.href = "/timer"
    }
  }

  if (isLoading) {
    return (
      <>
        <div className="mb-6 space-y-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-32 rounded-md" />
            <Skeleton className="h-8 w-28 rounded-md" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <EnergyFilter currentFilter={energyFilter} onFilterChange={setEnergyFilter} />
          <QuickWinToggle checked={showQuickWins} onCheckedChange={setShowQuickWins} />
        </div>
      </div>

      <div>
        <TaskList
          tasks={filteredTasks}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onStartTimer={handleStartTimer}
        />

        <div className="fixed bottom-6 right-6 z-10">
          <Button
            onClick={() => setIsAddingTask(true)}
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg"
            aria-label="Add task"
          >
            <Icons.add className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isAddingTask && <TaskForm onSubmit={handleAddTask} onCancel={() => setIsAddingTask(false)} />}
      </AnimatePresence>
    </>
  )
}

// Main component with loading state
export default function Dashboard() {
  return (
    <div className="p-4">
      <header className="mb-8">
        <h1 className="text-xl font-bold">FocusFlow</h1>
        <p className="text-muted-foreground">Manage your tasks based on energy levels</p>
      </header>

      <Suspense
        fallback={
          <>
            <div className="mb-6 space-y-4">
              <Skeleton className="h-10 w-full rounded-md" />
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-32 rounded-md" />
                <Skeleton className="h-8 w-28 rounded-md" />
              </div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-md" />
              ))}
            </div>
          </>
        }
      >
        <DashboardContent />
      </Suspense>
    </div>
  )
}
