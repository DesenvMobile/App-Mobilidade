import { Link } from 'expo-router';
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
import { supabase } from './contexts/AuthContext'; // 👈 CORRIGIDO (caminho relativo)
import { Checkbox } from 'expo-checkbox'; // 👈 NOVO
import * as Linking from 'expo-linking'; // 👈 NOVO

export default function RegisterScreen() {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false); // 👈 NOVO

  // 👈 NOVO: Funções para abrir os links
  const openPrivacyPolicy = () => {
    // ‼️ SUBSTITUA PELA URL REAL DA SUA POLÍTICA DE PRIVACIDADE
    Linking.openURL('https://seusite.com/politica-de-privacidade');
  };
  const openTermsOfUse = () => {
    // ‼️ SUBSTITUA PELA URL REAL DOS SEUS TERMOS DE USO
    Linking.openURL('https://seusite.com/termos-de-uso');
  };

  const handleRegister = async () => {
    if (!nomeCompleto || !email || !cpf || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    // 👈 NOVO: Validação da LGPD
    if (!agreedToTerms) {
      Alert.alert('Atenção', 'Você deve aceitar os Termos de Uso e a Política de Privacidade para continuar.');
      return;
    }

    setLoading(true);

    try {
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

    } catch (error: any) {
      console.error('Erro no cadastro:', error.message);
      Alert.alert('Erro no Cadastro', error.message || 'Não foi possível completar o cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
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

        {/* 1. 👈 NOVO: Bloco do Checkbox */}
        <View style={styles.checkboxContainer}>
          <Checkbox
            style={styles.checkbox}
            value={agreedToTerms}
            onValueChange={setAgreedToTerms}
            color={agreedToTerms ? '#6200ee' : undefined}
          />
          <Text style={styles.checkboxLabel}>
            Eu li e concordo com os{' '}
            <Text style={styles.linkTextLGPD} onPress={openTermsOfUse}>
              Termos de Uso
            </Text>
            {' '}e a{' '}
            <Text style={styles.linkTextLGPD} onPress={openPrivacyPolicy}>
              Política de Privacidade
            </Text>
            .
          </Text>
        </View>

        <TouchableOpacity
          // 2. 👈 ALTERADO: Desabilita o botão se não concordar
          style={[styles.button, (!agreedToTerms || loading) && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading || !agreedToTerms}
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
  // 3. 👈 NOVO: Estilo do botão desabilitado
  buttonDisabled: {
    backgroundColor: '#ccc',
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
  // 4. 👈 NOVOS: Estilos para o Checkbox e Links
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    marginTop: 5,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxLabel: {
    flex: 1, // Permite que o texto quebre a linha
    fontSize: 14,
    color: '#555',
  },
  linkTextLGPD: { // Estilo específico para os links da LGPD
    color: '#6200ee',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
});