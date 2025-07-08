import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { Link, Stack, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  buttons: Array<{ text: string; onPress?: () => void; style?: string }>;
}

export default function SignInScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    buttons: [{ text: 'OK' }]
  });
  const { signIn } = useAuth();

  const showAlert = (title: string, message: string, buttons: Array<{ text: string; onPress?: () => void; style?: string }> = [{ text: 'OK' }]) => {
    if (Platform.OS === 'web') {
      setAlert({ visible: true, title, message, buttons });
    } else {
      // @ts-ignore - Alert is only used on native
      Alert.alert(title, message, buttons);
    }
  };

  const handleSignIn = async () => {
    if (!username || !password) {
      showAlert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      await signIn(username, password);
      // Navigate to the main app after successful sign in
      router.replace('/(tabs)');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message?.[0] || 
                         error.message || 
                         'Failed to sign in';
      showAlert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Sign In' }} />
      
      <ThemedText type="title" style={styles.title}>Welcome Back</ThemedText>
      <ThemedText style={styles.subtitle}>Sign in to continue</ThemedText>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>Sign In</ThemedText>
          )}
        </Pressable>

        <View style={styles.footer}>
          <ThemedText>Don't have an account? </ThemedText>
          <Link href="/sign-up" asChild>
            <ThemedText style={styles.link}>Sign up</ThemedText>
          </Link>
        </View>
      </View>

      {/* Custom Alert Modal for Web */}
      {alert.visible && Platform.OS === 'web' && (
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <ThemedText type="title" style={styles.alertTitle}>{alert.title}</ThemedText>
            <ThemedText style={styles.alertMessage}>{alert.message}</ThemedText>
            <View style={styles.alertButtons}>
              {alert.buttons.map((button, index) => (
                <Pressable
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
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  link: {
    color: '#007AFF',
    fontWeight: '600',
  },
  alertOverlay: {
    position: 'fixed',
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
});
