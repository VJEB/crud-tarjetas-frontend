import { API_URL } from '@env';

export interface NoteContent {
  id: number;
  note_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  contents: NoteContent[];
}

export const getNotes = async (token: string): Promise<Note[]> => {
  const response = await fetch(`${API_URL}/notes`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }

  return response.json();
};
