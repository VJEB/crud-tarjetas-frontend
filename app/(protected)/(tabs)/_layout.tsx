import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { useNoteEdit } from '@/contexts/NoteEditContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, useWindowDimensions } from 'react-native';

function AddNoteButton() {
  const { startNewNote } = useNoteEdit();
  const router = useRouter();

  const handlePress = useCallback(() => {
    startNewNote();
    router.push('/(protected)/(tabs)/add-note');
  }, [startNewNote, router]);

  const { width } = useWindowDimensions();
  const isSmallScreen = width < 736;
  const pathname = usePathname();
  const isAddNoteScreen = pathname.includes('/add-note');
  const iconColor = isAddNoteScreen ? '#007AFF' : '#8e8e8f';

  return (
    <Pressable 
      onPress={handlePress} 
      style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        flexDirection: isSmallScreen ? 'column' : 'row',
        gap: isSmallScreen ? 0 : 4,
        paddingVertical: isSmallScreen ? 8 : 0
      }}
    >
      <FontAwesome5 name="clipboard-list" size={20} color={iconColor} />
      <ThemedText style={{ fontSize: isSmallScreen ? 10 : 13, color: iconColor, fontWeight: '500', lineHeight: 20 }}>Note</ThemedText>
    </Pressable>
  );
}

export default function TabLayout() {
  const { signOut } = useAuth();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#007AFF',
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome5 name="home" size={24} color={color} />,
          headerRight: () => (
            <Pressable
              onPress={signOut}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
                marginRight: 15,
              })}
            >
              <FontAwesome5 name="sign-out-alt" size={24} color="#007AFF" />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="add-note"
        options={{
          headerShown: false,
          title: 'New Note',
          tabBarButton: () => <AddNoteButton />,
        }}
      />
    </Tabs>
  );
}
