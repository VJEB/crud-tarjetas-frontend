import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { useNoteEdit } from '@/contexts/NoteEditContext';
import { useNotes } from '@/contexts/NotesContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Platform, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  buttons: Array<{ text: string; onPress?: () => void; style?: string }>;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { notes, refreshNotes } = useNotes();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    buttons: [{ text: 'OK' }]
  });

  const fetchNotes = useCallback(async () => {
    if (!user?.token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      await refreshNotes();
      setError(null);
    } catch (err) {
      setError('Failed to load notes');
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.token, refreshNotes]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const router = useRouter();
  const { setNoteToEdit } = useNoteEdit();

  const handleNotePress = (note: any) => {
    setNoteToEdit({
      id: note.id,
      title: note.title,
      contents: note.contents
    });
    router.push('/(protected)/(tabs)/add-note');
  };

    const showAlert = (title: string, message: string, buttons: Array<{ text: string; onPress?: () => void; style?: string }> = [{ text: 'OK', onPress: () => {} }]) => {
    if (Platform.OS === 'web') {
      setAlert({ visible: true, title, message, buttons });
    } else {
      // @ts-ignore - Alert is only used on native
      Alert.alert(title, message, buttons);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showAlert('Success', data.message || 'Note deleted successfully', [
          { text: 'OK', onPress: () => refreshNotes() }
        ]);
      } else {
        throw new Error(data.message || 'Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      showAlert('Error', 'Failed to delete note. Please try again.');
    }
  };

  const confirmDelete = (noteId: number) => {
    showAlert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeleteNote(noteId),
        },
      ]
    );
  };

  const renderNoteItem = ({ item }: { item: any }) => (
    <View style={styles.noteItemContainer}>
      <TouchableOpacity 
        style={styles.noteItem}
        onPress={() => handleNotePress(item)}
      >
        <View style={styles.noteContent}>
          <ThemedText style={styles.noteTitle}>{item.title}</ThemedText>
          <View style={styles.noteMeta}>
            <ThemedText style={styles.noteDate}>
              {new Date(item.updated_at).toLocaleDateString()}
            </ThemedText>
            <ThemedText style={styles.noteCount}>
              {item.contents.length} {item.contents.length === 1 ? 'item' : 'items'}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => confirmDelete(item.id)}
      >
        <FontAwesome5 name="trash" size={18} color="#ff3b30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">My Notes</ThemedText>
        {user && (
          <ThemedText style={styles.username}>Welcome, {user.username}!</ThemedText>
        )}
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ThemedText>Loading notes...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
              fetchNotes();
            }}
          >
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      ) : notes.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome5 name="sticky-note" size={48} color="#ccc" />
          <ThemedText style={styles.emptyStateText}>No notes yet</ThemedText>
          <ThemedText style={styles.emptyStateSubtext}>Create your first note to get started</ThemedText>
        </View>
      ) : (
        <FlatList
          data={notes}
          renderItem={renderNoteItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.notesList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
      {alert.visible && Platform.OS === 'web' && (
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <ThemedText type="title" style={styles.alertTitle}>{alert.title}</ThemedText>
            <ThemedText style={styles.alertMessage}>{alert.message}</ThemedText>
            <View style={styles.alertButtons}>
              {alert.buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.alertButton,
                    button.style === 'destructive' && styles.destructiveButton
                  ]}
                  onPress={() => {
                    button.onPress?.();
                    setAlert(prev => ({ ...prev, visible: false }));
                  }}
                >
                  <ThemedText style={[
                    styles.alertButtonText,
                    button.style === 'destructive' && styles.destructiveButtonText
                  ]}>
                    {button.text}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  noteItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  noteContent: {
    flex: 1,
  },
  deleteButton: {
    padding: 10,
    marginLeft: 10,
  },
  alertOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  alertBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  alertMessage: {
    marginBottom: 20,
  },
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  alertButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  alertButtonText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  destructiveButton: {
    backgroundColor: '#ffebee',
  },
  destructiveButtonText: {
    color: '#d32f2f',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  username: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  noteItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    flexGrow: 1,
    borderLeftColor: '#007AFF',
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  noteMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteDate: {
    color: '#6c757d',
    fontSize: 14,
  },
  noteCount: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '500',
  },
  notesList: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#6c757d',
    textAlign: 'center',
  },
  errorText: {
    color: '#dc3545',
    marginTop: 10,
  },
});
