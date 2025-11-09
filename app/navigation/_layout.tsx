import { Ionicons } from '@expo/vector-icons';
import { Stack, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native'; // 👈 2. Importe o loading

export default function NavigationLayout() {

  // 6. Se passou tudo, o usuário está logado. Mostre as Tabs.
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
        name="historicoOcorrencias"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="reorder-three" size={size} color={color} />
          ),
        }}
      />
      <Stack.Screen name="dados-pessoais" options={{ headerShown: false }} />
    </Tabs>
  );
}