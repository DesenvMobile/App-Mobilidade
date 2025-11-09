import { Link, router } from 'expo-router'; // Remova o 'router'
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
// 1. 🛑 REMOVA A CRIAÇÃO DO CLIENTE DAQUI
// import { createClient } from '@supabase/supabase-js'; 

// 2. ✅ IMPORTE O CLIENTE ÚNICO DO SEU CONTEXTO
import { supabase } from './contexts/AuthContext';

// 🛑 REMOVA A INICIALIZAÇÃO DUPLICADA
// export const supabase = createClient(...);

export default function RegisterScreen() {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nomeCompleto || !email || !cpf || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);

    try {
      // 3. Esta função agora usa o cliente CORRETO
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: senha,
        options: {
          data: {
            nome: nomeCompleto,
            cpf: cpf
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Usuário não foi criado, mas não houve erro.');
      }

      Alert.alert('Sucesso', 'Cadastro realizado! Por favor, verifique seu e-mail para confirmar a conta.');

      // 4. 🛑 REMOVA A NAVEGAÇÃO DAQUI
      // router.replace('/login'); 

    } catch (error: any) {
      console.error('Erro no cadastro:', error.message);
      Alert.alert('Erro no Cadastro', error.message || 'Não foi possível completar o cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... (SEU JSX CONTINUA O MESMO - NÃO MUDA NADA AQUI) ...
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Cadastro</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome Completo"
          placeholderTextColor="#888"
          value={nomeCompleto}
          onChangeText={setNomeCompleto}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="CPF"
          placeholderTextColor="#888"
          value={cpf}
          onChangeText={setCpf}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#888"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Cadastrar</Text>
          )}
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