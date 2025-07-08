import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { NoteEditProvider } from '@/contexts/NoteEditContext';
import { NotesProvider } from '@/contexts/NotesContext';
import { ActivityIndicator, View } from 'react-native';

export default function ProtectedLayout() {
  const { user, isLoading } = useAuth();

  // Show loading indicator while checking auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If user is not authenticated, redirect to sign-in
  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // If user is authenticated, render the protected routes
  return (
    <NoteEditProvider>
      <NotesProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </NotesProvider>
    </NoteEditProvider>
  );
}
