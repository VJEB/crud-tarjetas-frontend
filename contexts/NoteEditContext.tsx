import { createContext, useContext, useState, ReactNode } from 'react';

interface NoteContent {
  id: number;
  note_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

interface Note {
  id?: number;
  title: string;
  contents: NoteContent[] | string[];
}

interface NoteEditContextType {
  noteToEdit: Note | null;
  setNoteToEdit: (note: Note | null) => void;
  clearNoteToEdit: () => void;
  isEditMode: boolean;
  startNewNote: () => void;
}

const NoteEditContext = createContext<NoteEditContextType | undefined>(undefined);

export function NoteEditProvider({ children }: { children: ReactNode }) {
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const clearNoteToEdit = () => {
    setNoteToEdit(null);
    setIsEditMode(false);
  };

  const startNewNote = () => {
    clearNoteToEdit();
  };

  const contextValue = {
    noteToEdit,
    setNoteToEdit: (note: Note | null) => {
      setNoteToEdit(note);
      setIsEditMode(!!note);
    },
    clearNoteToEdit,
    isEditMode,
    startNewNote
  };

  return (
    <NoteEditContext.Provider value={contextValue}>
      {children}
    </NoteEditContext.Provider>
  );
}

export function useNoteEdit() {
  const context = useContext(NoteEditContext);
  if (context === undefined) {
    throw new Error('useNoteEdit must be used within a NoteEditProvider');
  }
  return context;
}
