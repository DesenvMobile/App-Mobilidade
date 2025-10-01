import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router'; // 1. Importe o componente Link

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tela Inicial (Home)</Text>
      <Text style={styles.subtitle}>
        Este é o ponto de partida do seu app.
      </Text>

      {/* 2. Adicione o Link para a tela de login */}
      <Link href="/login" style={styles.link}>
        <Text>Ir para a tela de Login</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 30,
  },
  link: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: '#6200ee',
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});