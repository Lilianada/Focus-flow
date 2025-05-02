"use client"

import { useState, useEffect, Suspense } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { NotesList } from "@/components/notes-list"
import { Skeleton } from "@/components/ui/skeleton"
import type { Note } from "@/lib/types"

// Separate the content into a client component
function NotesContent() {
  const [notes, setNotes] = useLocalStorage<Note[]>("notes", [])
  const [isLoading, setIsLoading] = useState(true)

  // Set loading to false after component mounts
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const handleAddNote = (note: Note) => {
    setNotes([note, ...notes])
  }

  const handleUpdateNote = (updatedNote: Note) => {
    const newNotes = notes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    setNotes(newNotes)
  }

  const handleDeleteNote = (noteId: string) => {
    const newNotes = notes.filter((note) => note.id !== noteId)
    setNotes(newNotes)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-md" />
        ))}
      </div>
    )
  }

  return (
    <NotesList
      notes={notes}
      onAddNote={handleAddNote}
      onUpdateNote={handleUpdateNote}
      onDeleteNote={handleDeleteNote}
    />
  )
}

// Main component with loading state
export function Notes() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-md" />
          ))}
        </div>
      }
    >
      <NotesContent />
    </Suspense>
  )
}
