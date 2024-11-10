"use client"

import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Content } from '@radix-ui/react-dropdown-menu';

interface Note {
  id: number;
  title: string;
  content: string;
  owner: number;
  created_at: string;
  updated_at: string;
}

const NoteTakingApp = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '' });
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');


  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/notes/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data.data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(false);
  };

  const handleCreateNote = async () => {
    const body = JSON.stringify({ title , content});
    console.log(body);
    try {
      const token = localStorage.getItem('token');
      console.log(token);
      const response = await fetch('/notes', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        
        // body: JSON.stringify({ ...editForm, owner: 1 }),
        body: body
      });
      if (!response.ok) throw new Error('Failed to create note');
      const newNote = await response.json();
      setNotes([...notes, newNote]);
      setIsCreating(false);
      // setEditForm({ title: '', content: '' });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedNote) return;
    try {
      const response = await fetch(`/notes/update?id=${selectedNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!response.ok) throw new Error('Failed to update note');
      const updatedNote = await response.json();
      setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
      setSelectedNote(updatedNote);
      setIsEditing(false);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      const response = await fetch(`/notes/delete?id=${noteId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete note');
      setNotes(notes.filter(note => note.id !== noteId));
      if (selectedNote?.id === noteId) setSelectedNote(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const startEditing = (note: Note) => {
    setEditForm({ title: note.title, content: note.content });
    setIsEditing(true);
  };

  const startCreating = () => {
    setEditForm({ title: '', content: '' });
    setIsCreating(true);
    setSelectedNote(null);
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Notes</h1>
          <Button 
            onClick={startCreating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Note
          </Button>
        </div>

        {error && (
          <Alert className="mb-4 bg-red-900/50 border-red-800 text-red-300">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Notes List */}
          <div className="md:col-span-1 space-y-4">
            {notes.map(note => (
              <Card 
                key={note.id}
                className={`bg-[#1c2028] border-0 hover:bg-[#252932] transition-colors cursor-pointer ${
                  selectedNote?.id === note.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleSelectNote(note)}
              >
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-white">{note.title}</div>
                    <div className="text-sm text-gray-400">
                      {new Date(note.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-red-500/20 text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Note Content */}
          <div className="md:col-span-2">
            {(selectedNote || isCreating) && (
              <Card className="bg-[#1c2028] border-0">
                <CardContent className="p-6">
                  {(isEditing || isCreating) ? (
                    <div className="space-y-4">
                      <Input
                        value={title}
                        onChange={(e) => setTitle( e.target.value )}
                        placeholder="Note title"
                        className="bg-[#252932] border-0 text-white"
                      />
                      <Textarea
                        value={content}
                        onChange={(e) => setContent( e.target.value )}
                        placeholder="Note content"
                        rows={10}
                        className="bg-[#252932] border-0 text-white"
                      />
                      <div className="flex space-x-3">
                        <Button
                          onClick={isCreating ? handleCreateNote : handleUpdateNote}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isCreating ? 'Create' : 'Save'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setIsCreating(false);
                          }}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-white">{selectedNote?.title}</h2>
                        <Button
                          onClick={() => startEditing(selectedNote!)}
                          variant="ghost"
                          size="icon"
                          className="hover:bg-blue-500/20 text-blue-400"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-gray-300 whitespace-pre-wrap">
                        {selectedNote?.content}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteTakingApp;