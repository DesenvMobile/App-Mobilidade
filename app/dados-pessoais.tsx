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

export default function ProfileScreen() {
  // Dados mocados e não editáveis
  const [fullName] = useState('Maria da Silva');
  const [email] = useState('maria.silva@example.com');
  const [cpf] = useState('123.456.789-00');

  // Apenas a senha pode ser alterada
  const [password, setPassword] = useState('');

  const handleSave = () => {
    // A lógica de salvar agora foca apenas na nova senha
    if (password) {
      console.log('Nova Senha salva:', password);
      Alert.alert('Sucesso', 'Nova senha salva com sucesso!');
    } else {
      Alert.alert('Aviso', 'Nenhuma alteração para salvar.');
    }
  };

  const handleCancel = () => {
    console.log('Operação cancelada');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: 'https://placehold.co/60x60/EFEFEF/333?text=Foto' }} // Placeholder
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.title}>Dados Pessoais</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nome Completo</Text>
          {/* Trocado TextInput por View e Text para garantir a visibilidade */}
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
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
            <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
            <Text style={styles.buttonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 0.8,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 50,
  },
  profileImageContainer: {
    alignSelf: 'flex-end',
    width: 60,
    height: 60,
    marginBottom: -50,
    marginRight: 0,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
    justifyContent: 'center', // Adicionado para alinhar o texto verticalmente
  },
  disabledInput: {
    backgroundColor: '#e9e9e9',
  },
  disabledInputText: {
    fontSize: 16,
    color: '#333', // Cor do texto mais escura para garantir visibilidade
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    width: '48%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#6200ee',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6200ee',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#6200ee',
  },
});

