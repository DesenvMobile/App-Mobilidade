import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function RecuperarSenhaScreen() {
  const [email, setEmail] = useState('');

  const handlePasswordRecovery = () => {
    if (!email) {
      Alert.alert('Erro', 'Por favor, digite seu email.');
      return;
    }

    // Lógica para enviar o email de recuperação viria aqui
    console.log('Enviando email de recuperação para:', email);

    Alert.alert(
      'Verifique seu Email',
      `Enviamos as instruções para recuperação de senha para ${email}.`
    );
    
    // Navega de volta para a tela de login
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Recuperar Senha</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.button} onPress={handlePasswordRecovery}>
          <Text style={styles.buttonText}>Enviar</Text> 
        </TouchableOpacity>

        <View style={styles.linksContainer}>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Já tem conta? Clique aqui</Text> 
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Os estilos são os mesmos das telas anteriores para manter a consistência
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#6200ee',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linksContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#6200ee',
    fontSize: 16,
    marginTop: 10,
  },
});