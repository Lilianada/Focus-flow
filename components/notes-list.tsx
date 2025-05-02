"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { NoteForm } from "@/components/note-form"
import type { Note } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface NotesListProps {
  notes: Note[]
  onAddNote: (note: Note) => void
  onUpdateNote: (note: Note) => void
  onDeleteNote: (noteId: string) => void
}

export function NotesList({ notes, onAddNote, onUpdateNote, onDeleteNote }: NotesListProps) {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [isAddingNote, setIsAddingNote] = useState(false)

  const handleEditNote = (noteId: string) => {
    setEditingNoteId(noteId)
  }

  const handleUpdateNote = (updatedNote: Note) => {
    onUpdateNote(updatedNote)
    setEditingNoteId(null)
  }

  const handleCancelEdit = () => {
    setEditingNoteId(null)
  }

  const handleAddNote = (note: Note) => {
    onAddNote(note)
    setIsAddingNote(false)
  }

  const renderEmptyState = () => {
    return (
      <div className="space-y-4">
        {[
          { title: "Meeting notes", content: "Discussed project timeline and next steps..." },
          { title: "Ideas for tomorrow", content: "Research new productivity techniques..." },
          { title: "Follow-up tasks", content: "Email the team about the upcoming deadline..." },
        ].map((placeholder, index) => (
          <Card key={index} className="border-dashed bg-transparent opacity-50">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium italic">{placeholder.title}</h3>
              <p className="mt-2 italic text-muted-foreground">{placeholder.content}</p>
              <p className="mt-2 text-xs italic text-muted-foreground">Just now</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="relative">
      <div>
        <AnimatePresence>
          {notes.length > 0 ? (
            <div className="space-y-4">
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {editingNoteId === note.id ? (
                    <NoteForm note={note} onSubmit={handleUpdateNote} onCancel={handleCancelEdit} />
                  ) : (
                    <Card className="overflow-hidden border-transparent bg-transparent transition-all hover:border-border hover:bg-accent/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg font-medium">{note.title}</h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Icons.ellipsis className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditNote(note.id)}>
                                <Icons.edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onDeleteNote(note.id)} className="text-destructive">
                                <Icons.trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap">{note.content}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            renderEmptyState()
          )}
        </AnimatePresence>
        
        <div className="fixed bottom-6 right-6 z-10">
          <Button
            onClick={() => setIsAddingNote(true)}
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg"
            aria-label="Add note"
          >
            <Icons.add className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isAddingNote && <NoteForm onSubmit={handleAddNote} onCancel={() => setIsAddingNote(false)} />}
      </AnimatePresence>
    </div>
  )
}
