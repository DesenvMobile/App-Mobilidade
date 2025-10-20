import { AntDesign } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  // --- STATE ---
  // Dados mocados e não editáveis
  const [fullName] = useState('Maria da Silva');
  const [email] = useState('maria.silva@example.com');
  const [cpf] = useState('123.456.789-00');

  // Apenas a senha pode ser alterada
  const [password, setPassword] = useState('');

  // --- HANDLERS ---
  const handleSave = () => {
    if (password) {
      console.log('Nova Senha salva:', password);
      Alert.alert('Sucesso', 'Nova senha salva com sucesso!');
    } else {
      Alert.alert('Atenção', 'Nenhuma alteração para salvar.');
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  // --- RENDER ---
  return (
    <SafeAreaView style={styles.container}>
      {/* Header Padronizado */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleGoBack}>
            <AntDesign name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Dados Pessoais</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: 'https://placehold.co/100x100/EFEFEF/333?text=Foto' }}
            style={styles.profileImage}
          />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Nome Completo</Text>
          <View style={[styles.input, styles.disabledInput]}>
            <Text style={styles.disabledInputText}>{fullName}</Text>
          </View>

          <Text style={styles.label}>Email</Text>
          <View style={[styles.input, styles.disabledInput]}>
            <Text style={styles.disabledInputText}>{email}</Text>
          </View>

          <Text style={styles.label}>CPF</Text>
          <View style={[styles.input, styles.disabledInput]}>
            <Text style={styles.disabledInputText}>{cpf}</Text>
          </View>

          <Text style={styles.label}>Nova Senha (Opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite uma nova senha"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
            <Text style={styles.buttonText}>Salvar Alterações</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6', // Cor de fundo da Home
  },
  // Header Styles (copiados da Home)
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerLeft: {
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  // Content Styles
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 15,
    color: '#555',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
    justifyContent: 'center',
  },
  disabledInput: {
    backgroundColor: '#EFEFEF', // Fundo mais suave para campos desabilitados
    borderColor: '#E0E0E0',
  },
  disabledInputText: {
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#3b82f6', // Mesmo azul do ícone de like da Home
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});