"use client"
import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, StickyNote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation'

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  owner: number;
}

// const sampleData: Note[] = [
//   {
//     "content": "asdfasdfadfadf",
//     "created_at": "2024-11-10T07:19:10+05:30",
//     "id": 4,
//     "owner": 3,
//     "title": "jeevan",
//     "updated_at": "2024-11-10T07:19:10+05:30"
//   }
// ];

const NoteTakingApp = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const router = useRouter();

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching notes with token:', token);
      
      const response = await fetch('/notes/notes/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      // console.log('Response status:', response.status);
      // console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notes: ${response.status} ${response.statusText}`);
      }
      
      const data: Note[] = await response.json();
      console.log('Fetched Notes:', data);
      setNotes(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(`Failed to fetch notes: ${(err as Error).message}`);
      // Use sample data as fallback
      console.log('Using sample data as fallback');
      // setNotes(sampleData);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // const handleSelectNote = (note: Note) => {
  //   setSelectedNote(note);
  //   setTitle(note.title);
  //   setContent(note.content);
  //   setIsEditing(false);
  // };

  const handleSelectNote = (note: Note) => {
    if (selectedNote?.id === note.id) {
      setSelectedNote(null); // Deselects if the same note is clicked
    } else {
      setSelectedNote(note);
      setIsCreating(false);
      setIsEditing(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      const token = localStorage.getItem('token');

      const body = JSON.stringify({ title, content });

      console.log(body);
  
      const response = await fetch('/notes/notes', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body : body
      });
      // console.log('Response status:', response.status);
      if (!response.ok) throw new Error('Failed to create note');
  
      await fetchNotes(); // Refresh notes list
      setIsCreating(false);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedNote) return;
    try {
      const token = localStorage.getItem('token');
    
      const response = await fetch(`/notes/notes/update?id=${selectedNote.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ title, content })
      });
      if (!response.ok) throw new Error('Failed to update note');
      const updatedNote: Note = await response.json();
      setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
      setSelectedNote(updatedNote);
      setIsEditing(false);
      fetchNotes();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/notes/notes/delete?id=${noteId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      if (!response.ok) throw new Error('Failed to delete note');
      setNotes(notes.filter(note => note.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
        setTitle('');
        setContent('');
      }
      fetchNotes();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const startEditing = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(true);
  };

  const startCreating = () => {
    setTitle('');
    setContent('');
    setIsCreating(true);
    setSelectedNote(null);
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">Notes</h1>
            <div className="flex gap-4 ml-auto">
            <Button onClick={startCreating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2">
              <Plus className="h-5 w-5" />
                   Add Note
            </Button>
            <Button onClick={handleLogout} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2">
              LogOut
            </Button>
          </div>
        </div>
        {error && (
          <Alert className="mb-4 bg-red-900/50 border-red-800 text-red-300">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Notes List */}
          <div className="md:col-span-1 space-y-4">
            { notes?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <StickyNote className="w-12 h-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No notes yet</h3>
                <p className="text-sm text-gray-500 mb-4">Click 'Add Note' to create your first note</p>
              </div>
            ) : (
              notes?.map(note => (
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
                        {new Date(note.created_at).toLocaleString()}
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
              ))
            )}
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
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Note title"
                        className="bg-[#252932] border-0 text-white"
                      />
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Note content"
                        rows={10}
                        className="bg-[#252932] border-0 text-white"
                      />
                      <div className="flex space-x-3">
                        <Button
                          onClick={isCreating ? handleCreateNote : handleUpdateNote}
                          // onClick={handleCreateNote}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isCreating ? 'Create' : 'Save'}
                          
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setIsCreating(false);
                            if (selectedNote) {
                              setTitle(selectedNote.title);
                              setContent(selectedNote.content);
                            }
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
                         <div className='flex gap-4 ml-auto'>
                            <Button
                              onClick={() => startEditing(selectedNote!)}
                              variant="ghost"
                              size="icon"
                              className="hover:bg-blue-500/20 text-blue-400"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                onClick={() => setSelectedNote(null)} // Close button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-red-500/20 text-red-400">
                                X
                            </Button>
                          </div>
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