import { Tabs } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { Pressable } from 'react-native';

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
    </Tabs>
  );
}
