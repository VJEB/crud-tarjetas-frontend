import { CustomAlert } from '@/components/CustomAlert';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { useNoteEdit } from '@/contexts/NoteEditContext';
import { useNotes } from '@/contexts/NotesContext';
import { API_URL } from '@env';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Button, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

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

export default function AddNoteScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { refreshNotes } = useNotes();
  const { noteToEdit, clearNoteToEdit, isEditMode } = useNoteEdit();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contents, setContents] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons?: Array<{ text: string; onPress: () => void }>;
  }>({ visible: false, title: '', message: '' });

  // Initialize form with note data if in edit mode
  useEffect(() => {
    if (isEditMode && noteToEdit) {
      setTitle(noteToEdit.title);
      // Convert NoteContent[] to string[] if needed
      const contentsArray = noteToEdit.contents.map(item => 
        typeof item === 'string' ? item : item.content
      );
      setContents(contentsArray);
    } else {
      setTitle('');
      setContents([]);
      setContent('');
    }

    // Clear edit data when component unmounts
    return () => {
      if (isEditMode) {
        clearNoteToEdit();
      }
    };
  }, [isEditMode, noteToEdit]);

  // Handle back button press
  const handleBackPress = () => {
    if (isEditMode) {
      clearNoteToEdit();
    }
    router.back();
  };

  const addContentItem = () => {
    if (content.trim()) {
      setContents([...contents, content.trim()]);
      setContent('');
    }
  };

  const removeContentItem = (index: number) => {
    const newContents = [...contents];
    newContents.splice(index, 1);
    setContents(newContents);
  };

  const showAlert = (title: string, message: string, buttons = [{ text: 'OK', onPress: () => {} }]) => {
    if (Platform.OS === 'web') {
      setAlert({ visible: true, title, message, buttons });
    } else {
      // @ts-ignore - Alert is only used on native
      Alert.alert(title, message, buttons);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || contents.length === 0) {
      showAlert('Error', 'Please add a title and at least one content item');
      return;
    }

    if (!user?.token) {
      showAlert('Error', 'Not authenticated');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const url = isEditMode && noteToEdit?.id
        ? `${API_URL}/notes/${noteToEdit.id}`
        : `${API_URL}/notes`;
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          contents: contents,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save note');
      }

      // Refresh the notes list
      await refreshNotes();
      
      const successMessage = isEditMode ? 'Note updated successfully' : 'Note created successfully';
      showAlert('Success', successMessage, [
        {
          text: 'OK',
          onPress: () => {
            setAlert({ ...alert, visible: false });
            clearNoteToEdit();
            router.push('/(protected)/(tabs)');
          }
        }
      ]);
    } catch (error) {
      console.error('Error creating note:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save note. Please try again.';
      showAlert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        buttons={alert.buttons}
        onDismiss={() => setAlert({ ...alert, visible: false })}
      />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>
            {isEditMode ? 'Edit Note' : 'New Note'}
          </ThemedText>
        </View>

        <TextInput
          style={styles.titleInput}
          placeholder="Note Title"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#666"
        />
        
        <View style={styles.contentContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.contentInput}
              placeholder="Add an item"
              value={content}
              onChangeText={setContent}
              onSubmitEditing={addContentItem}
              returnKeyType="done"
              placeholderTextColor="#666"
            />
            <Button 
              title="Add" 
              onPress={addContentItem} 
              disabled={!content.trim()}
            />
          </View>

          {contents.length > 0 ? (
            <View style={styles.contentList}>
              {contents.map((item, index) => (
                <View key={index} style={styles.contentItem}>
                  <ThemedText style={styles.contentText}>{item}</ThemedText>
                  <TouchableOpacity 
                    onPress={() => removeContentItem(index)}
                    style={styles.removeButton}
                  >
                    <FontAwesome name="trash" size={16} color="#dc3545" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <FontAwesome name="sticky-note" size={48} color="#e9ecef" />
              <ThemedText style={styles.emptyStateText}>
                {isEditMode 
                  ? 'This note is empty. Add some items!' 
                  : 'Start by adding items to your note'}
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isSubmitting ? 'Saving...' : isEditMode ? 'Update Note' : 'Create Note'}
          onPress={handleSubmit}
          disabled={isSubmitting || title.trim().length === 0 || contents.length === 0}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  title: {
    flex: 1,
    marginLeft: 10,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 12,
    borderRadius: 5,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  contentInput: {
    flex: 1,
    padding: 8,
    marginRight: 8,
  },
  contentList: {
    marginTop: 15,
  },
  contentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  contentText: {
    flex: 1,
    marginRight: 10,
  },
  removeButton: {
    padding: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginTop: 20,
  },
  emptyStateText: {
    marginTop: 15,
    textAlign: 'center',
    color: '#6c757d',
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});
