export type EnergyLevel = "high" | "medium" | "low"

export interface Subtask {
  title: string
  completed: boolean
}

export interface Task {
  id: string
  title: string
  energyLevel: EnergyLevel
  estimatedDuration: number
  completed: boolean
  subtasks?: Subtask[]
  createdAt: string
}

export interface TimerSession {
  taskId: string
  duration: number
  date: string
}

export interface Note {
  id: string
  content: string
  title: string
  createdAt: string
}

export interface User {
  id: string
  name: string
  email: string
}
