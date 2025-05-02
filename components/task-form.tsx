"use client"

import type React from "react"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import type { Task, EnergyLevel, Subtask } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Icons } from "@/components/icons"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface TaskFormProps {
  task?: Task
  onSubmit: (task: Task) => void
  onCancel: () => void
}

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || "")
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(task?.energyLevel || "medium")
  const [estimatedDuration, setEstimatedDuration] = useState(task?.estimatedDuration || 15)
  const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks || [])
  const [newSubtask, setNewSubtask] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    const updatedTask: Task = {
      id: task?.id || uuidv4(),
      title,
      energyLevel,
      estimatedDuration,
      completed: task?.completed || false,
      subtasks,
      createdAt: task?.createdAt || new Date().toISOString(),
    }

    onSubmit(updatedTask)
  }

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return

    setSubtasks([...subtasks, { title: newSubtask, completed: false }])
    setNewSubtask("")
  }

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Edit your task details below." : "Create a new task by filling out the form below."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Energy Level</Label>
            <RadioGroup
              value={energyLevel}
              onValueChange={(value) => setEnergyLevel(value as EnergyLevel)}
              className="flex space-x-2"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high" className="flex items-center">
                  <Icons.highEnergy className="mr-1 h-4 w-4 text-green-500" />
                  High
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="flex items-center">
                  <Icons.mediumEnergy className="mr-1 h-4 w-4 text-yellow-500" />
                  Medium
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low" className="flex items-center">
                  <Icons.lowEnergy className="mr-1 h-4 w-4 text-red-500" />
                  Low
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="duration">Estimated Duration (minutes)</Label>
              <span className="text-sm">{estimatedDuration} min</span>
            </div>
            <Slider
              id="duration"
              min={1}
              max={60}
              step={1}
              value={[estimatedDuration]}
              onValueChange={(values) => setEstimatedDuration(values[0])}
            />
          </div>

          <div className="space-y-2">
            <Label>Subtasks</Label>
            <div className="flex space-x-2">
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add a subtask"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddSubtask()
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddSubtask}>
                <Icons.add className="h-4 w-4" />
              </Button>
            </div>

            {subtasks.length > 0 && (
              <div className="mt-2 space-y-2">
                {subtasks.map((subtask, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex-1 text-sm">{subtask.title}</div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSubtask(index)}>
                      <Icons.trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">{task ? "Update" : "Create"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
