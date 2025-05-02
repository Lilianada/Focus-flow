"use client"

import { useState } from "react"
import type { Task } from "@/lib/types"
import { TaskItem } from "@/components/task-item"
import { TaskForm } from "@/components/task-form"
import { Card, CardContent } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { AnimatePresence } from "framer-motion"

interface TaskListProps {
  tasks: Task[]
  onUpdateTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onStartTimer: (taskId: string) => void
}

export function TaskList({ tasks, onUpdateTask, onDeleteTask, onStartTimer }: TaskListProps) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)

  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId)
  }

  const handleUpdateTask = (updatedTask: Task) => {
    onUpdateTask(updatedTask)
    setEditingTaskId(null)
  }

  const handleCancelEdit = () => {
    setEditingTaskId(null)
  }

  if (tasks.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="rounded-full bg-muted p-3">
            <Icons.fileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium">No tasks found</h3>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Add a new task or adjust your filters to see more tasks.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-1">
      <AnimatePresence>
        {tasks.map((task) => (
          <div key={task.id}>
            {editingTaskId === task.id ? (
              <TaskForm task={task} onSubmit={handleUpdateTask} onCancel={handleCancelEdit} />
            ) : (
              <TaskItem
                task={task}
                onEdit={() => handleEditTask(task.id)}
                onDelete={() => onDeleteTask(task.id)}
                onComplete={(completed) => {
                  onUpdateTask({ ...task, completed })
                }}
                onStartTimer={() => onStartTimer(task.id)}
              />
            )}
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
