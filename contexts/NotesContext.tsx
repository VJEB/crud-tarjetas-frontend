import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getNotes } from '@/utils/api';

interface NotesContextType {
  notes: any[];
  setNotes: (notes: any[]) => void;
  refreshNotes: () => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<any[]>([]);
  const { user } = useAuth();

  const refreshNotes = useCallback(async () => {
    if (!user?.token) return;
    try {
      const data = await getNotes(user.token);
      setNotes(data);
    } catch (error) {
      console.error('Error refreshing notes:', error);
      throw error;
    }
  }, [user?.token]);

  return (
    <NotesContext.Provider value={{ notes, setNotes, refreshNotes }}>
      {children}
    </NotesContext.Provider>
  );
}

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
