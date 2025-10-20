import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function NavigationLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 2
        },
        tabBarActiveTintColor: '#6200ee',
        headerShown: true,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="registroOcorrencia"
        options={{
          title: 'Registrar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
          headerTitle: 'Registrar Ocorrência'
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
