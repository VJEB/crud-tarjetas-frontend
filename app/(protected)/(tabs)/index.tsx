import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Welcome, {user?.username}!</ThemedText>
      <ThemedText style={styles.subtitle}>You are now logged in.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
