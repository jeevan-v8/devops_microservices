'use client'

import { useState, useEffect } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface Note {
  id: number
  title: string
  content: string
  owner: number
  created_at: string
  updated_at: string
}

export default function NoteApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await fetch('/notes')
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      } else {
        console.error('Failed to fetch notes')
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
  }

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note)
    setIsEditing(false)
  }

  const handleEditClick = () => {
    if (selectedNote) {
      setEditTitle(selectedNote.title)
      setEditContent(selectedNote.content)
      setIsEditing(true)
    }
  }

  const handleUpdateNote = async () => {
    if (selectedNote) {
      try {
        const response = await fetch(`/notes/update?id=${selectedNote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: editTitle, content: editContent }),
        })
        if (response.ok) {
          const updatedNote = await response.json()
          setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note))
          setSelectedNote(updatedNote)
          setIsEditing(false)
        } else {
          console.error('Failed to update note')
        }
      } catch (error) {
        console.error('Error updating note:', error)
      }
    }
  }

  const handleDeleteNote = async () => {
    if (selectedNote) {
      try {
        const response = await fetch(`/notes/delete?id=${selectedNote.id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          setNotes(notes.filter(note => note.id !== selectedNote.id))
          setSelectedNote(null)
        } else {
          console.error('Failed to delete note')
        }
      } catch (error) {
        console.error('Error deleting note:', error)
      }
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Note Taking App</h1>
      <div className="flex gap-4">
        <div className="w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Click on a note to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {notes.map(note => (
                  <li
                    key={note.id}
                    onClick={() => handleNoteClick(note)}
                    className="cursor-pointer p-2 hover:bg-gray-100 rounded"
                  >
                    <h3 className="font-semibold">{note.title}</h3>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(note.created_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="w-2/3">
          {selectedNote && (
            <Card>
              <CardHeader>
                <CardTitle>{isEditing ? 'Edit Note' : selectedNote.title}</CardTitle>
                <CardDescription>
                  {isEditing ? 'Make your changes below' : `Last updated: ${new Date(selectedNote.updated_at).toLocaleString()}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Note Title"
                    />
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Note Content"
                      rows={5}
                    />
                  </div>
                ) : (
                  <p>{selectedNote.content}</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                {isEditing ? (
                  <>
                    <Button onClick={handleUpdateNote}>Save</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <Button onClick={handleEditClick}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteNote}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}