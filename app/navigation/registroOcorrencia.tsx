import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';

export default function RegistroOcorrenciaScreen() {
  const [tipoOcorrencia, setTipoOcorrencia] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagens, setImagens] = useState<string[]>([]);
  const [localizacao, setLocalizacao] = useState<string | null>(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [manual, setManual] = useState({ bairro: '', rua: '', numero: '' });

  // Escolher imagem
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      selectionLimit: 0,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImagens([...imagens, ...result.assets.map(asset => asset.uri)]);
    }
  };

  // Usar localização atual
  const usarLocalizacaoAtual = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'O app precisa da sua localização.');
      return;
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = pos.coords;
    const endereco = `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`;
    setLocalizacao(endereco);
    setModalVisivel(false);
  };

  // Salvar endereço manual
  const salvarManual = () => {
    if (!manual.bairro || !manual.rua) {
      Alert.alert('Campos obrigatórios', 'Informe pelo menos bairro e rua.');
      return;
    }
    const endereco = `${manual.rua}, ${manual.numero || 's/n'} - ${manual.bairro}`;
    setLocalizacao(endereco);
    setModalVisivel(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Registrar uma ocorrência</Text>

        {/* Tipo da ocorrência */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={tipoOcorrencia}
            onValueChange={(itemValue) => setTipoOcorrencia(itemValue)}
            style={styles.picker}
            dropdownIconColor="#888"
          >
            <Picker.Item label="Tipo da ocorrência" value="" />
            <Picker.Item label="Buraco na rua" value="Buraco na rua" />
            <Picker.Item label="Buraco na calçada" value="Buraco na calçada" />
            <Picker.Item label="Poste quebrado" value="Poste quebrado" />
            <Picker.Item label="Iluminação precária" value="Iluminação precária" />
            <Picker.Item label="Sinalização precária" value="Sinalização precária" />
          </Picker>
        </View>

        {/* Descrição */}
        <TextInput
          style={styles.textArea}
          placeholder="Descrição do problema"
          placeholderTextColor="#888"
          value={descricao}
          onChangeText={setDescricao}
          multiline
          numberOfLines={5}
        />

        {/* Anexar imagem */}
        <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
          <Text style={styles.attachText}>Anexar imagem</Text>
          <MaterialIcons name="attach-file" size={22} color="#888" />
        </TouchableOpacity>

        {imagens.length > 0 && (
          <View style={{ marginBottom: 12, width: '100%' }}>
            <Text style={{ fontSize: 14, color: '#333' }}>Imagens selecionadas:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 }}>
              {imagens.map((img, idx) => (
                <Image
                  key={idx}
                  source={{ uri: img }}
                  style={{ width: 80, height: 80, borderRadius: 8, marginRight: 8, marginBottom: 8 }}
                />
              ))}
            </View>
            <TouchableOpacity
              style={styles.trashButton}
              onPress={() => setImagens(imagens.slice(0, -1))}
            >
              <MaterialIcons name="delete" size={24} color="#e53935" />
              <Text style={styles.trashText}>Remover última imagem</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Adicionar localização */}
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => setModalVisivel(true)}
        >
          <Text style={styles.locationText}>Adicionar Localização</Text>
          <Ionicons name="location-outline" size={22} color="#888" />
        </TouchableOpacity>

        {localizacao && (
          <Text style={{ color: '#333', marginBottom: 10 }}>
            📍 Localização: {localizacao}
          </Text>
        )}

        {/* Botões de ação */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} 
          onPress={() => {
      Alert.alert(
        "Ocorrência salva!",
        `✅ Tipo: ${tipoOcorrencia || 'não informado'}
        📝 Descrição: ${descricao || 'vazio'}
        📍 Localização: ${localizacao || 'não informada'}
        🖼️ Imagens: ${imagens.length} selecionada(s)`
      );
    }}
  >
            <Text style={styles.saveText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de localização */}
      <Modal visible={modalVisivel} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar Localização</Text>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={usarLocalizacaoAtual}
            >
              <Text style={styles.optionText}>Usar minha localização atual</Text>
            </TouchableOpacity>

            <Text style={{ marginVertical: 10, textAlign: 'center', color: '#888' }}>ou</Text>

            <TextInput
              placeholder="Bairro"
              style={styles.input}
              value={manual.bairro}
              onChangeText={(t) => setManual({ ...manual, bairro: t })}
            />
            <TextInput
              placeholder="Rua"
              style={styles.input}
              value={manual.rua}
              onChangeText={(t) => setManual({ ...manual, rua: t })}
            />
            <TextInput
              placeholder="Número (opcional)"
              style={styles.input}
              value={manual.numero}
              onChangeText={(t) => setManual({ ...manual, numero: t })}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#e53935' }]}
                onPress={() => setModalVisivel(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#43a047' }]}
                onPress={salvarManual}
              >
                <Text style={styles.modalButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
  content: {
    width: '90%', padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center', elevation: 5,
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 18, color: '#333', textAlign: 'center' },
  pickerContainer: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 15, backgroundColor: '#fafafa', overflow: 'hidden' },
  picker: { width: '100%', height: 50, color: '#333' },
  textArea: {
    width: '100%', minHeight: 100, borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 15, paddingVertical: 10, marginBottom: 15, fontSize: 16, textAlignVertical: 'top',
    backgroundColor: '#fafafa',
  },
  attachButton: { flexDirection: 'row', alignItems: 'center', width: '100%', height: 45, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, marginBottom: 12, justifyContent: 'space-between', backgroundColor: '#fafafa' },
  attachText: { fontSize: 16, color: '#333' },
  locationButton: { flexDirection: 'row', alignItems: 'center', width: '100%', height: 45, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, marginBottom: 18, justifyContent: 'space-between', backgroundColor: '#fafafa' },
  locationText: { fontSize: 16, color: '#333' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  cancelButton: { flex: 1, height: 45, backgroundColor: '#e53935', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  cancelText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  saveButton: { flex: 1, height: 45, backgroundColor: '#43a047', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  saveText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  trashButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginTop: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, backgroundColor: '#fff0f0' },
  trashText: { color: '#e53935', fontSize: 15, marginLeft: 6, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
  modalButton: { flex: 1, height: 45, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5 },
  modalButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  optionButton: { backgroundColor: '#eee', borderRadius: 8, padding: 12, alignItems: 'center' },
  optionText: { fontSize: 16, color: '#333', fontWeight: '500' },
});
