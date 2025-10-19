import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function RegistroOcorrenciaScreen() {
  const [tipoOcorrencia, setTipoOcorrencia] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagens, setImagens] = useState<string[]>([]);

  // Função para escolher imagens
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Registrar uma ocorrência</Text>

        {/* Tipo da ocorrência - ComboBox */}
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

        {/* Descrição do problema */}
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
            {/* Botão de lixeira para apagar a última imagem */}
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
        <TouchableOpacity style={styles.locationButton}>
          <Text style={styles.locationText}>Adicionar Localizacao</Text>
          <Ionicons name="location-outline" size={22} color="#888" />
        </TouchableOpacity>

        {/* Botões de ação */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveText}>Salvar</Text>
          </TouchableOpacity>
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
    width: '90%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#333',
    textAlign: 'center',
  },
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 50,
    color: '#333',
    backgroundColor: '#fafafa',
    fontSize: 16,
    fontFamily: 'System',
  },
  textArea: {
    width: '100%',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
    textAlignVertical: 'top',
    backgroundColor: '#fafafa',
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 12,
    justifyContent: 'space-between',
    backgroundColor: '#fafafa',
  },
  attachText: {
    fontSize: 16,
    color: '#333',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 18,
    justifyContent: 'space-between',
    backgroundColor: '#fafafa',
  },
  locationText: {
    fontSize: 16,
    color: '#333',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    height: 45,
    backgroundColor: '#e53935',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    height: 45,
    backgroundColor: '#43a047',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  saveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trashButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#fff0f0',
  },
  trashText: {
    color: '#e53935',
    fontSize: 15,
    marginLeft: 6,
    fontWeight: 'bold',
  },
});