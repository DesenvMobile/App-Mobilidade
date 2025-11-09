import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router'; // 👈 Importe hooks de navegação
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { OccurrencesProvider } from "./contexts/occurrencesContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext"; // 👈 Importe o Provedor E o Hook
import React, { useEffect } from 'react'; // 👈 Importe React e useEffect

export const unstable_settings = {
  anchor: 'navigation',
};

// --- ESTE É O NOVO COMPONENTE "CHEFE" ---
function RootNavigationDecider() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments(); // Pega a rota atual (ex: ['login'] ou ['navigation', 'home'])

  useEffect(() => {
    // 1. Se estivermos verificando a sessão, não faça nada (evita o loop)
    if (loading) {
      return;
    }

    // 2. Define quais rotas são "públicas" (telas de autenticação)
    // Adapte este array se tiver mais telas públicas (ex: 'recuperar-senha')
    const inAuthGroup = ['login', 'cadastro', 'recuperar-senha'].includes(segments[0]);

    // 3. Lógica de Redirecionamento
    if (session && inAuthGroup) {
      // Usuário está LOGADO, mas está na tela de Login/Cadastro.
      // Jogue ele para a Home.
      router.replace('/navigation/home');
    } else if (!session && !inAuthGroup) {
      // Usuário NÃO está logado e NÃO está na tela de Login/Cadastro (ex: tentou ir pra home).
      // Jogue ele para o Login.
      router.replace('/login');
    }
  }, [session, loading, segments, router]); // Re-execute se a sessão, loading ou rota mudarem

  // Este componente não renderiza nada na tela, só cuida da lógica de navegação
  return null;
}
// --- FIM DO NOVO COMPONENTE ---


export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <OccurrencesProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="navigation" />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="login" />
            <Stack.Screen name="cadastro" />
            <Stack.Screen name="recuperar-senha" />
          </Stack>

          {/* 4. Adiciona o "Navegador" aqui. Ele vai ouvir o AuthProvider. */}
          <RootNavigationDecider />

          <StatusBar style="auto" />
        </ThemeProvider>
      </OccurrencesProvider>
    </AuthProvider>
  );
}