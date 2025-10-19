import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
      <View style={styles.content}>
        <Text style={styles.title}>Tela Inicial</Text>
        <Text style={styles.subtitle}>Bem-vindo ao App Mobilidade</Text>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});